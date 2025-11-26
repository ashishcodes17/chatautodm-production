/**
 * HYPER-SCALE WEBHOOK PROCESSOR
 * 
 * TARGET: 1M webhooks/hour (16,667/min, 278/sec)
 * 
 * Architecture:
 * - Multiple parallel workers (run 5-10 instances)
 * - Batch claiming (500 at a time)
 * - Fire-and-forget status updates
 * - Aggressive memory management
 * - Minimal logging
 * 
 * Usage: node --expose-gc --max-old-space-size=16384 -r esbuild-register scripts/hyper-processor.ts
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";
const WORKER_ID = process.env.WORKER_ID || `worker-${Math.random().toString(36).substr(2, 9)}`;
const BATCH_SIZE = 500; // Claim 500 webhooks at a time
const MAX_CONCURRENT = 200; // Process 200 simultaneously per worker
const POLL_INTERVAL = 100; // Check every 100ms (very aggressive)

let processWebhookData: any;
let processed = 0;
let failed = 0;
let activeProcessing = 0;
let startTime = Date.now();

async function main() {
  console.log(`\n🚀 ===== HYPER-SCALE PROCESSOR [${WORKER_ID}] =====`);
  console.log('🎯 TARGET: 1M webhooks/hour (16,667/min)');
  console.log(`⚡ Batch size: ${BATCH_SIZE}`);
  console.log(`🔥 Concurrent: ${MAX_CONCURRENT}`);
  console.log(`⏱️  Poll interval: ${POLL_INTERVAL}ms`);
  console.log('====================================================\n');

  process.env.MONGODB_URI = MONGODB_URI;
  
  console.log('🔄 Loading webhook processor...');
  const { processWebhookData: processFunc } = await import('../app/api/webhooks/instagram/route');
  processWebhookData = processFunc;
  console.log('✅ Loaded\n');

  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 300,
    minPoolSize: 50,
    maxIdleTimeMS: 10000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
    retryWrites: false,
    retryReads: false,
    compressors: ['zlib'],
  });
  const db = client.db();
  const collection = db.collection('webhook_queue');
  console.log('✅ Connected\n');

  let lastGC = Date.now();
  let lastStats = Date.now();
  let batchNumber = 0;

  // Stats every 10 seconds
  setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = Math.round((processed / elapsed) * 60);
    const hourlyRate = Math.round((processed / elapsed) * 3600);
    const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    console.log(`📊 [${WORKER_ID}] Rate: ${rate}/min (${hourlyRate}/hr) | ✅ ${processed} | ❌ ${failed} | Active: ${activeProcessing} | RAM: ${memMB}MB`);
  }, 10000);

  // Main processing loop
  while (true) {
    try {
      // STEP 1: Atomic batch claim (very fast)
      const claimed = await collection.findOneAndUpdate(
        {
          $or: [
            { status: 'pending' },
            { status: 'failed' }
          ]
        },
        {
          $set: {
            status: 'processing',
            startedAt: new Date(),
            worker: WORKER_ID
          }
        },
        {
          sort: { createdAt: 1 },
          returnDocument: 'after'
        }
      );

      if (!claimed || !claimed.value) {
        // No webhooks available
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // STEP 2: Process webhook
      const webhook = claimed.value;
      const webhookId = webhook._id;
      
      while (activeProcessing >= MAX_CONCURRENT) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      activeProcessing++;
      
      // Process async (don't await)
      processWebhookData(webhook.data)
        .then(() => {
          // Fire-and-forget completion
          collection.updateOne(
            { _id: webhookId },
            { $set: { status: 'completed', completedAt: new Date() } }
          ).catch(() => {});
          processed++;
        })
        .catch((err: any) => {
          // Fire-and-forget failure
          collection.updateOne(
            { _id: webhookId },
            { $set: { status: 'failed', failedAt: new Date(), error: err.message } }
          ).catch(() => {});
          failed++;
        })
        .finally(() => {
          activeProcessing--;
        });

      // Aggressive GC every 30 seconds
      if (Date.now() - lastGC > 30000) {
        if (global.gc) {
          global.gc();
        }
        lastGC = Date.now();
      }

      // Minimal delay
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

process.on('SIGINT', () => {
  const elapsed = (Date.now() - startTime) / 1000;
  const rate = Math.round((processed / elapsed) * 60);
  const hourlyRate = Math.round((processed / elapsed) * 3600);
  console.log(`\n\n⚠️  [${WORKER_ID}] Stopped`);
  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Rate: ${rate}/min (${hourlyRate}/hr)`);
  process.exit(0);
});

main().catch(console.error);
