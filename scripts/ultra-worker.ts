/**
 * ULTRA-FAST SINGLE WORKER
 * 
 * Optimized for maximum throughput on single process
 * TARGET: 2000-3000/min per worker
 * 
 * Key optimizations:
 * - Batch claiming with updateMany
 * - Fire-and-forget updates
 * - Minimal logging
 * - Aggressive GC
 * 
 * Usage: node --expose-gc --max-old-space-size=12288 -r esbuild-register scripts/ultra-worker.ts
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";
const BATCH_SIZE = 300; // Claim 300 at a time
const MAX_CONCURRENT = 300; // Process 300 simultaneously

let processWebhookData: any;
let processed = 0;
let failed = 0;
let activeProcessing = 0;
const startTime = Date.now();

async function main() {
  console.log('\n🚀 ===== ULTRA-FAST WORKER =====');
  console.log(`📦 Batch: ${BATCH_SIZE} | 🔥 Concurrent: ${MAX_CONCURRENT}`);
  console.log('===============================\n');

  process.env.MONGODB_URI = MONGODB_URI;
  
  const { processWebhookData: processFunc } = await import('../app/api/webhooks/instagram/route');
  processWebhookData = processFunc;

  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 500,
    minPoolSize: 100,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
    retryWrites: false,
    compressors: ['zlib'],
  });
  
  const db = client.db();
  const collection = db.collection('webhook_queue');
  
  console.log('✅ Ready\n');

  let lastGC = Date.now();

  // Stats
  setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = Math.round((processed / elapsed) * 60);
    const hourlyRate = Math.round(rate * 60);
    console.log(`📊 ${rate}/min (${hourlyRate}/hr) | ✅ ${processed} | ❌ ${failed} | 🔥 ${activeProcessing} | 💾 ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  }, 5000);

  while (true) {
    try {
      // Claim batch
      const webhooks = await collection
        .find({
          $or: [{ status: 'pending' }, { status: 'failed' }]
        })
        .sort({ createdAt: 1 })
        .limit(BATCH_SIZE)
        .toArray();

      if (webhooks.length === 0) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      // Atomic claim
      const ids = webhooks.map(w => w._id);
      await collection.updateMany(
        {
          _id: { $in: ids },
          $or: [{ status: 'pending' }, { status: 'failed' }]
        },
        {
          $set: { status: 'processing', startedAt: new Date(), worker: 'ultra' }
        }
      );

      // Process all
      for (const webhook of webhooks) {
        while (activeProcessing >= MAX_CONCURRENT) {
          await new Promise(r => setTimeout(r, 10));
        }

        activeProcessing++;
        
        processWebhookData(webhook.data)
          .then(() => {
            collection.updateOne(
              { _id: webhook._id },
              { $set: { status: 'completed', completedAt: new Date() } }
            ).catch(() => {});
            processed++;
          })
          .catch((err: any) => {
            collection.updateOne(
              { _id: webhook._id },
              { $set: { status: 'failed', error: err.message, failedAt: new Date() } }
            ).catch(() => {});
            failed++;
          })
          .finally(() => {
            activeProcessing--;
          });
      }

      // GC every 30s
      if (Date.now() - lastGC > 30000) {
        if (global.gc) global.gc();
        lastGC = Date.now();
      }

      await new Promise(r => setTimeout(r, 100));

    } catch (error: any) {
      console.error(`❌ ${error.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

process.on('SIGINT', () => {
  const elapsed = (Date.now() - startTime) / 1000;
  const rate = Math.round((processed / elapsed) * 60);
  console.log(`\n✅ ${processed} | ❌ ${failed} | 📊 ${rate}/min\n`);
  process.exit(0);
});

main().catch(console.error);
