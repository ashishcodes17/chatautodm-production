/**
 * EMERGENCY QUEUE PROCESSOR - Run from Local PC
 * 
 * This bypasses broken production workers and processes webhooks directly
 * using your powerful i7 Intel CPU with 30 parallel workers
 * 
 * Usage: pnpm tsx scripts/emergency-process-queue.ts
 */

import { MongoClient } from 'mongodb';

// Hardcoded MongoDB URI (no env variable needed)
// Password is: 1196843649@1 (@ is URL-encoded as %40)
const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";
const PARALLEL_JOBS = 200; // STABLE - high throughput without memory crash
const BATCH_DELAY = 0; // NO delay between batches (max speed)
const EMPTY_QUEUE_DELAY = 2000; // Wait 2 seconds when queue is empty

// Import processWebhookData dynamically to avoid lib/mongodb.ts initialization
let processWebhookData: any;

let processed = 0;
let failed = 0;
let errors = 0;
const startTime = Date.now();

async function processWebhook(jobId: any, data: any, db: any) {
  const jobStartTime = Date.now();
  
  try {
    // Mark as processing (fast, no await to speed up)
    db.collection('webhook_queue').updateOne(
      { _id: jobId },
      { $set: { status: 'processing', startedAt: new Date(), worker: 'local-emergency' } }
    ).catch(() => {}); // Fire and forget

    // Process with 40 second timeout - fail faster to avoid freezing
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Webhook timeout after 40s')), 40000);
    });
    
    await Promise.race([
      processWebhookData(data),
      timeoutPromise
    ]);

    // Mark completed - CRITICAL: This must succeed (with retries)
    const processingTime = Date.now() - jobStartTime;
    
    let updateSuccess = false;
    for (let retry = 0; retry < 3; retry++) {
      try {
        const updateResult = await db.collection('webhook_queue').updateOne(
          { _id: jobId },
          { 
            $set: { 
              status: 'completed', 
              completedAt: new Date(),
              processingTime,
              worker: 'local-emergency'
            } 
          }
        );
        
        if (updateResult.matchedCount > 0) {
          updateSuccess = true;
          break;
        }
      } catch (err) {
        if (retry === 2) console.error(`❌ Failed to mark ${jobId} completed after 3 retries`);
        await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
      }
    }

    if (updateSuccess) {
      processed++;
      return { success: true, time: processingTime };
    } else {
      throw new Error('Failed to mark completed in database');
    }

  } catch (error: any) {
    failed++;
    console.error(`❌ ERROR [${jobId.toString().slice(-6)}]: ${error.message}`);
    
    try {
      // Mark failed (with retry logic)
      await db.collection('webhook_queue').updateOne(
        { _id: jobId },
        { 
          $set: { 
            status: 'failed', 
            failedAt: new Date(),
            error: error.message,
            processingTime: Date.now() - jobStartTime
          } 
        }
      );
    } catch (dbError: any) {
      console.error(`❌ DB error marking failed:`, dbError.message);
      errors++;
    }

    return { success: false, error: error.message };
  }
}

async function main() {
  const originalLog = console.log;
  
  originalLog('\n🚨 ========== EMERGENCY QUEUE PROCESSOR ==========');
  originalLog('💪 Running from your i7 Intel PC');
  originalLog(`⚡ Parallel jobs: ${PARALLEL_JOBS}`);
  originalLog('⚠️  Bypassing broken production workers');
  originalLog('==================================================\n');

  // Set MONGODB_URI env var before importing route (to avoid lib/mongodb.ts error)
  process.env.MONGODB_URI = MONGODB_URI;
  
  originalLog('🔄 Setting up environment...');
  
  // DISABLE VERBOSE LOGGING for speed
  console.log = (...args: any[]) => {
    // Only show important messages (errors and our progress)
    const msg = args[0]?.toString() || '';
    if (msg.includes('❌') || msg.includes('⚠️') || msg.includes('📦') || msg.includes('⚡') || msg.includes('🔄')) {
      originalLog(...args);
    }
  };
  
  originalLog('🔄 Loading webhook processor...');
  // Now safely import processWebhookData
  const { processWebhookData: processFunc } = await import('../app/api/webhooks/instagram/route');
  processWebhookData = processFunc;
  originalLog('✅ Webhook processor loaded');

  originalLog('🔄 Connecting to MongoDB...');
  // Connect with MAXED OUT connection pool settings
  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 100, // Low - let real-time have priority
    minPoolSize: 20,  // Keep connections ready
    maxIdleTimeMS: 60000, // Keep connections alive longer
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 120000, // 2 minutes for slow Instagram API
  });
  const db = client.db();
  originalLog('✅ Connected to MongoDB\n');

  let batchNumber = 0;
  let consecutiveErrors = 0;
  let lastCleanup = Date.now();
  const recentlyProcessed = new Set(); // Track recently processed IDs to avoid dupes

  // INFINITE LOOP - Never stop processing
  while (true) {
    try {
      batchNumber++;
      
      originalLog(`🔍 Fetching batch #${batchNumber}...`);
      
      // SUPER SIMPLE - just get pending webhooks (no date filter = faster query)
      const jobs = await db.collection('webhook_queue')
        .find({ status: 'pending' })
        .sort({ createdAt: 1 }) // Oldest first
        .limit(PARALLEL_JOBS)
        .toArray();
      
      // Filter out any we just processed (shouldn't happen, but safety check)
      const newJobs = jobs.filter(job => !recentlyProcessed.has(job._id.toString()));
      if (newJobs.length < jobs.length) {
        originalLog(`⚠️  Filtered out ${jobs.length - newJobs.length} duplicate webhooks`);
      }

      if (newJobs.length === 0) {
        originalLog(`\n⏸️  Queue empty - waiting ${EMPTY_QUEUE_DELAY/1000}s for new webhooks...`);
        await new Promise(resolve => setTimeout(resolve, EMPTY_QUEUE_DELAY));
        continue; // Check again
      }

      const batchStart = Date.now();
      originalLog(`\n📦 Batch #${batchNumber}: Processing ${newJobs.length} webhooks...`);

      // Track these IDs
      newJobs.forEach(job => recentlyProcessed.add(job._id.toString()));

      // Process all jobs in parallel with timeout protection
      const resultsPromise = Promise.allSettled(
        newJobs.map(job => processWebhook(job._id, job.data, db))
      );

      // Show progress every 2 seconds with detailed info
      let completedInBatch = 0;
      const progressInterval = setInterval(() => {
        const elapsed = ((Date.now() - batchStart) / 1000).toFixed(0);
        const currentProcessed = processed;
        const currentFailed = failed;
        const batchProgress = Math.round((completedInBatch / jobs.length) * 100);
        originalLog(`⏳ Batch #${batchNumber}: ${elapsed}s | ✅ ${currentProcessed} ❌ ${currentFailed} | Working...`);
      }, 2000);

      const results = await resultsPromise;
      clearInterval(progressInterval);

      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(1);

      // Count successes and failures in this batch
      const batchSuccess = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const batchFailed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

      // Calculate stats
      const elapsed = Math.floor((Date.now() - startTime) / 1000) || 1;
      const rate = Math.round((processed / elapsed) * 60);
      const remaining = await db.collection('webhook_queue').countDocuments({ status: 'pending' });
      const completedCount = await db.collection('webhook_queue').countDocuments({ status: 'completed', worker: 'local-emergency' });

      // Show detailed progress with batch timing and memory usage
      const memUsage = process.memoryUsage();
      const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      originalLog(`⚡ Batch: ${batchTime}s (✅ ${batchSuccess} ❌ ${batchFailed}) | Total: ✅ ${processed} ❌ ${failed} | DB: ${completedCount} completed | ⏳ ${remaining} pending | 📊 ${rate}/min | 💾 ${memMB}MB`);

      // Show errors if any in this batch
      if (batchFailed > 0) {
        originalLog(`⚠️  ${batchFailed} webhooks failed in this batch`);
      }

      // Estimate completion
      if (remaining > 0 && rate > 0) {
        const minutesLeft = Math.ceil(remaining / rate);
        originalLog(`🕐 ETA: ${minutesLeft} minutes (${remaining} webhooks left)`);
      }
      
      // CRITICAL: Check if we're stalling
      if (parseFloat(batchTime) > 30) {
        originalLog(`⚠️  WARNING: Batch took ${batchTime}s! Webhooks may be hanging.`);
      }

      // Force garbage collection every 5 minutes to prevent memory bloat
      if (Date.now() - lastCleanup > 300000) {
        if (global.gc) {
          originalLog('🧹 Running garbage collection...');
          global.gc();
        }
        // Clear tracking set to prevent memory leak
        recentlyProcessed.clear();
        lastCleanup = Date.now();
      }

      // Reset error counter on success
      consecutiveErrors = 0;

      // Optional delay between batches (currently 0 for max speed)
      if (BATCH_DELAY > 0) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }

    } catch (batchError: any) {
      consecutiveErrors++;
      console.error(`\n❌ BATCH ERROR #${consecutiveErrors}:`, batchError.message);
      
      // If too many consecutive errors, wait longer
      if (consecutiveErrors >= 5) {
        console.log('⚠️  Too many errors, waiting 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        consecutiveErrors = 0; // Reset
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Continue processing (don't crash)
      continue;
    }
  }

  // Final stats
  const totalTime = Math.floor((Date.now() - startTime) / 1000);
  const avgRate = Math.round((processed / totalTime) * 60);

  console.log('\n✅ ========== EMERGENCY PROCESSING COMPLETE ==========');
  console.log(`⏱️  Total time: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`);
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚡ Average rate: ${avgRate} webhooks/min`);
  console.log('====================================================\n');

  await client.close();
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  const totalTime = Math.floor((Date.now() - startTime) / 1000);
  const avgRate = Math.round((processed / totalTime) * 60);

  console.log('\n\n⚠️  ========== INTERRUPTED BY USER (Ctrl+C) ==========');
  console.log(`⏱️  Total time: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`);
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Errors: ${errors}`);
  console.log(`⚡ Average rate: ${avgRate} webhooks/min`);
  console.log('====================================================\n');
  
  process.exit(0);
});

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  console.log('\n🔄 Restarting in 5 seconds...');
  setTimeout(() => {
    main().catch(() => process.exit(1));
  }, 5000);
});
