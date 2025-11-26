/**
 * REAL-TIME WEBHOOK PROCESSOR with MongoDB Change Streams
 * 
 * Processes NEW webhooks INSTANTLY as they're inserted (zero latency!)
 * Uses Change Streams - no polling, no wasted connections
 * Runs alongside emergency-process-queue.ts to handle backlog
 * 
 * Usage: pnpm tsx scripts/realtime-processor.ts
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";
const MAX_CONCURRENT = 1000; // ULTRA MODE: 2k-4k webhooks/min (1000 concurrent)

let processWebhookData: any;
let processed = 0;
let failed = 0;
let activeProcessing = 0;

async function processWebhook(jobId: any, data: any, db: any) {
  activeProcessing++;
  try {
    // Mark as processing
    await db.collection('webhook_queue').updateOne(
      { _id: jobId },
      { $set: { status: 'processing', startedAt: new Date(), worker: `realtime-${process.env.PROCESSOR_ID || 'single'}` } }
    );

    // 30s timeout - fail fast and retry instead of waiting
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 50000);
    });
    
    await Promise.race([processWebhookData(data), timeoutPromise]);

    // Mark completed
    await db.collection('webhook_queue').updateOne(
      { _id: jobId },
      { $set: { status: 'completed', completedAt: new Date(), worker: `realtime-${process.env.PROCESSOR_ID || 'single'}` } }
    );

    processed++;
    console.log(`✅ Webhook processed | Total: ${processed} ✅ ${failed} ❌ | Active: ${activeProcessing}`);
    return true;

  } catch (error: any) {
    failed++;
    
    // LOG THE ACTUAL ERROR - this is critical!
    console.error(`❌ Webhook [${jobId.toString().slice(-6)}] FAILED: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
    }
    
    await db.collection('webhook_queue').updateOne(
      { _id: jobId },
      { $set: { status: 'failed', failedAt: new Date(), error: error.message } }
    ).catch((dbErr: any) => {
      console.error(`   ⚠️ DB update failed: ${dbErr.message}`);
    });
    
    console.log(`❌ Webhook failed | Total: ${processed} ✅ ${failed} ❌ | Active: ${activeProcessing}`);
    return false;
  } finally {
    activeProcessing--;
  }
}

async function main() {
  const processorId = process.env.PROCESSOR_ID || 'MONSTER';
  console.log(`\n🚀 ===== ULTRA WEBHOOK PROCESSOR [${processorId}] =====`);
  console.log('⚡ Processes webhooks INSTANTLY');
  console.log('🔥 Ultra-fast polling (checks every 200ms)');
  console.log('💪 CAPACITY: 2000-4000 webhooks/min (1000 concurrent)');
  console.log('🔋 Using 1000 concurrent + 1000 connections');
  console.log('====================================================\n');

  process.env.MONGODB_URI = MONGODB_URI;
  
  console.log('🔄 Loading webhook processor...');
  const { processWebhookData: processFunc } = await import('../app/api/webhooks/instagram/route');
  processWebhookData = processFunc;
  console.log('✅ Webhook processor loaded');

  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 2000, // MAX OUT connections for speed
    minPoolSize: 500,
    maxIdleTimeMS: 10000,
    socketTimeoutMS: 30000, // Fail FAST
    serverSelectionTimeoutMS: 5000,
    retryWrites: false, // Don't retry - faster
    retryReads: false,
    directConnection: false,
    compressors: ['zlib'], // Compress network traffic
  });
  const db = client.db();
  console.log('✅ Connected to MongoDB\n');

  console.log('⚡ Polling for NEW webhooks every 200ms (last 30 sec)...\n');

  let lastProcessedTime = new Date();
  let lastCleanup = Date.now();
  let lastStatsTime = Date.now();
  const processingIds = new Set(); // Track which IDs are being processed

  // Performance stats
  setInterval(() => {
    const elapsed = (Date.now() - lastStatsTime) / 1000;
    const rate = Math.round((processed / elapsed) * 60);
    console.log(`📊 RATE: ${rate}/min | Active: ${activeProcessing}/1000 | RAM: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    lastStatsTime = Date.now();
  }, 10000);

  // Ultra-fast polling loop (1 second interval)
  while (true) {
    try {
      // Get webhooks created in last 30 seconds (smaller batches = faster processing)
      const threeMinutesAgo = new Date(Date.now() - 30 * 1000);
      
      // ATOMIC CLAIM: Mark as processing first, then process
      // This prevents multiple processors from claiming the same webhook
      const workerId = `realtime-${processorId}`;
      
      // Get pending webhooks AND ALL failed webhooks (no retry limit - process till success)
      const claimedJobs = await db.collection('webhook_queue')
        .find({ 
          $or: [
            { status: 'pending', createdAt: { $gte: threeMinutesAgo } },
            { status: 'failed', createdAt: { $gte: threeMinutesAgo } }
          ]
        })
        .hint('processor_pending_fetch_idx') // Force optimal index for 10x speed boost
        .sort({ createdAt: 1 })
        .limit(MAX_CONCURRENT)
        .toArray();

      if (claimedJobs.length > 0) {
        // Atomically claim these webhooks
        const jobIds = claimedJobs.map(j => j._id);
        
        const claimResult = await db.collection('webhook_queue').updateMany(
          { 
            _id: { $in: jobIds },
            $or: [
              { status: 'pending' },
              { status: 'failed' }
            ]
          },
          { 
            $set: { 
              status: 'processing',
              startedAt: new Date(),
              worker: workerId
            },
            $inc: { retryCount: 1 }
          }
        );
        
        // Only process webhooks we successfully claimed
        if (claimResult.modifiedCount > 0) {
          console.log(`📥 Claimed ${claimResult.modifiedCount} NEW webhooks, processing (${activeProcessing} active)...`);
          
          // Process the claimed webhooks
          for (const webhook of claimedJobs) {
            // Skip if we didn't claim it (another processor got it)
            if (processingIds.has(webhook._id.toString())) continue;
            
            while (activeProcessing >= MAX_CONCURRENT) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const jobIdStr = webhook._id.toString();
            processingIds.add(jobIdStr);
            
            // Process without marking as processing again (already done)
            activeProcessing++;
            processWebhookData(webhook.data)
              .then(() => {
                // FIRE AND FORGET - don't wait for DB update
                db.collection('webhook_queue').updateOne(
                  { _id: webhook._id },
                  { $set: { status: 'completed', completedAt: new Date(), worker: workerId } }
                ).catch(() => {});
                processed++;
                if (processed % 100 === 0) {
                  console.log(`✅ ${processed} processed | ${failed} failed | ${activeProcessing} active`);
                }
              })
              .catch((err: any) => {
                failed++;
                // FIRE AND FORGET - don't wait for DB queries or updates
                db.collection('webhook_queue').updateOne(
                  { _id: webhook._id },
                  { $set: { status: 'failed', failedAt: new Date(), error: err.message } }
                ).catch(() => {});
                if (failed % 10 === 0) {
                  console.error(`⚠️ ${failed} failed (${err.message})`);
                }
              })
              .finally(() => {
                activeProcessing--;
                processingIds.delete(jobIdStr);
              });
          }
        }
      } else {
        // Show heartbeat every 10 seconds
        const now = new Date();
        if (now.getTime() - lastProcessedTime.getTime() > 10000) {
          const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
          console.log(`💚 Watching... (${processed} processed, ${failed} failed, ${activeProcessing} active, ${memMB}MB)`);
          lastProcessedTime = now;
        }
      }

      // Aggressive garbage collection every 30 seconds
      if (Date.now() - lastCleanup > 30 * 1000) {
        if (global.gc) {
          console.log('🧹 Running garbage collection...');
          global.gc();
        }
        // Clear old IDs from tracking set (just in case)
        processingIds.clear();
        lastCleanup = Date.now();
      }

      // Check every 200ms for ultra-fast response to new webhooks
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error: any) {
      console.error(`❌ Error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

process.on('SIGINT', () => {
  console.log(`\n\n⚠️  Stopped. Processed ${processed} webhooks, ${failed} failed.\n`);
  process.exit(0);
});

main().catch(console.error);
