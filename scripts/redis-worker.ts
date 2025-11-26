/**
 * REDIS-POWERED WORKER
 * 
 * Uses Redis cache + BullMQ queue for maximum performance
 * Falls back to MongoDB-only mode if Redis unavailable
 * 
 * Environment Variables:
 * - REDIS_ENABLED=true
 * - BULLMQ_ENABLED=true
 * - REDIS_URL=redis://62.72.42.195:6379
 * - WORKER_ID=worker-1
 * 
 * Usage: 
 * REDIS_ENABLED=true BULLMQ_ENABLED=true node --expose-gc --max-old-space-size=8192 -r esbuild-register scripts/redis-worker.ts
 */

import { MongoClient } from 'mongodb';
import { initRedis, warmCache, isRedisEnabled, getCacheStats } from '../lib/redis-cache';
import { initQueue, createWorker, isQueueEnabled, getQueueStats, closeQueue } from '../lib/webhook-queue';

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";
const WORKER_ID = process.env.WORKER_ID || `worker-${Math.random().toString(36).substr(2, 9)}`;
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '200');

let processWebhookData: any;
let processed = 0;
let failed = 0;
const startTime = Date.now();

async function main() {
  console.log(`\n🚀 ===== REDIS-POWERED WORKER [${WORKER_ID}] =====`);
  console.log(`⚡ Concurrency: ${CONCURRENCY}`);
  console.log(`📊 Redis: ${process.env.REDIS_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`📊 BullMQ: ${process.env.BULLMQ_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log('================================================\n');

  // Global error handlers to avoid unhandled exceptions crashing the process
  process.on('unhandledRejection', (reason: any, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  })

  process.on('uncaughtException', (err: any) => {
    console.error('❌ Uncaught Exception:', err)
    // attempt graceful shutdown
    try {
      (async () => {
        await closeQueue().catch(() => {})
        process.exit(1)
      })()
    } catch (e) {
      process.exit(1)
    }
  })

  // Set MongoDB URI
  process.env.MONGODB_URI = MONGODB_URI;

  // Initialize Redis (optional, with fallback)
  await initRedis();

  // Initialize BullMQ (optional, with fallback)
  await initQueue();

  // Load webhook processor
  console.log('🔄 Loading webhook processor...');
  const routeModule = await import('../app/api/webhooks/instagram/route');
  processWebhookData = routeModule.processWebhookData;
  console.log('✅ Loaded\n');

  // Connect to MongoDB
  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 300,
    minPoolSize: 50,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
  });
  const db = client.db();
  console.log('✅ Connected to MongoDB\n');

  // Warm Redis cache if enabled
  if (isRedisEnabled()) {
    await warmCache(db);
  }

  // Stats monitoring
  setInterval(async () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = Math.round((processed / elapsed) * 60);
    const hourlyRate = Math.round(rate * 60);
    const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    
    console.log(`\n📊 [${WORKER_ID}] Performance:`);
    console.log(`   Rate: ${rate}/min (${hourlyRate}/hr)`);
    console.log(`   Processed: ${processed} ✅ | Failed: ${failed} ❌`);
    console.log(`   Memory: ${memMB}MB`);

    if (isRedisEnabled()) {
      const cacheStats = await getCacheStats();
      console.log(`   Redis: ${cacheStats.keyspace || 0} keys cached`);
    }

    if (isQueueEnabled()) {
      const queueStats = await getQueueStats();
      console.log(`   Queue: ${queueStats.waiting} waiting | ${queueStats.active} active`);
    }
  }, 10000);

  // If BullMQ enabled, create worker
  if (isQueueEnabled()) {
    console.log('🔥 Starting BullMQ worker...\n');
    
    const worker = createWorker(async (data) => {
      try {
        await processWebhookData(data);
        processed++;
      } catch (error) {
        failed++;
        throw error;
      }
    }, CONCURRENCY);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⚠️  Shutting down gracefully...');
      await closeQueue();
      await client.close();
      
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = Math.round((processed / elapsed) * 60);
      console.log(`\n✅ [${WORKER_ID}] Processed: ${processed} | Failed: ${failed} | Rate: ${rate}/min\n`);
      process.exit(0);
    });

  } else {
    // Fallback: Direct MongoDB processing (like ultra-worker)
    console.log('📌 Using direct MongoDB processing (BullMQ disabled)\n');
    
    const collection = db.collection('webhook_queue');
    let lastGC = Date.now();

    while (true) {
      try {
        // Claim batch
        const webhooks = await collection
          .find({ $or: [{ status: 'pending' }, { status: 'failed' }] })
          .sort({ createdAt: 1 })
          .limit(CONCURRENCY)
          .toArray();

        if (webhooks.length === 0) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }

        // Atomic claim
        const ids = webhooks.map(w => w._id);
        await collection.updateMany(
          { _id: { $in: ids }, $or: [{ status: 'pending' }, { status: 'failed' }] },
          { $set: { status: 'processing', startedAt: new Date(), worker: WORKER_ID } }
        );

        // Process all (fire and forget)
        let activeProcessing = 0;
        for (const webhook of webhooks) {
          while (activeProcessing >= CONCURRENCY) {
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
}

process.on('SIGINT', () => {
  const elapsed = (Date.now() - startTime) / 1000;
  const rate = Math.round((processed / elapsed) * 60);
  console.log(`\n✅ [${WORKER_ID}] Processed: ${processed} | Failed: ${failed} | Rate: ${rate}/min\n`);
  process.exit(0);
});

main().catch(console.error);
