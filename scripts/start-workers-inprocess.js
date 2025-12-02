/**
 * In-Process Worker Starter
 * 
 * Starts workers IN THE SAME PROCESS as production-start.js
 * This allows workers to call Next.js API functions directly without HTTP!
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const WORKERS = parseInt(process.env.QUEUE_WORKERS || '180', 10);
const POLL_INTERVAL = parseInt(process.env.QUEUE_POLL_INTERVAL || '1000', 10);
const MAX_RETRIES = parseInt(process.env.QUEUE_MAX_RETRIES || '3', 10);

let db = null;
let activeWorkers = 0;
let totalProcessed = 0;
let totalFailed = 0;

/**
 * Get database connection
 */
async function getDatabase() {
  if (db) return db;

  const client = await MongoClient.connect(MONGODB_URI);
  db = client.db();
  return db;
}

/**
 * Process webhook data by calling the route handler DIRECTLY
 * 
 * This is the KEY innovation: Workers import the COMPILED Next.js route
 * from .next/server/ folder and call it directly (no HTTP!)
 */
async function processWebhookData(data) {
  try {
    // Import the webhook processing module
    const processor = require('../lib/webhook-processor.js');

    const result = await processor.processWebhook(data);
    return result.success;

  } catch (error) {
    console.error('❌ [WORKER] Processing error:', error.message);
    return false;
  }
}

/**
 * Process next job in queue
 */
async function processNextJob(workerId) {
  const db = await getDatabase();
  const collection = db.collection('webhook_queue');
  const now = new Date();

  try {
    // Atomically claim next pending job (that's ready to retry)
    const job = await collection.findOneAndUpdate(
      {
        status: 'pending',
        $or: [
          { retryAt: { $exists: false } },
          { retryAt: { $lte: now } }
        ]
      },
      {
        $set: {
          status: 'processing',
          workerId: workerId,
          processingStartedAt: now,
          lastAttemptAt: now
        },
        $inc: { attempts: 1 }
      },
      {
        sort: { priority: -1, createdAt: 1 },
        returnDocument: 'after'
      }
    );

    if (!job) {
      return false; // No jobs available
    }

    const startTime = Date.now();

    // Process the webhook
    const success = await processWebhookData(job.data);

    const processingTime = Date.now() - startTime;

    if (success) {
      // Mark as completed
      await collection.updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            processingTime
          }
        }
      );

      activeWorkers++;
      totalProcessed++;

      if (totalProcessed % 100 === 0) {
        console.log(`✅ Processed ${totalProcessed} webhooks (Worker ${workerId})`);
      }

      return true;

    } else {
      // Handle failure
      const attempts = job.attempts || 1;

      if (attempts >= MAX_RETRIES) {
        // Move to dead letter queue
        const deadLetterCollection = db.collection('webhook_dead_letter');
        await deadLetterCollection.insertOne({
          ...job,
          failedAt: new Date(),
          finalAttempts: attempts
        });

        await collection.deleteOne({ _id: job._id });

        totalFailed++;
        console.error(`💀 Job failed after ${attempts} attempts (moved to DLQ)`);

      } else {
        // Schedule retry with exponential backoff
        const retryDelay = Math.pow(2, attempts) * 5000; // 10s, 20s, 40s
        const retryAt = new Date(Date.now() + retryDelay);

        await collection.updateOne(
          { _id: job._id },
          {
            $set: {
              status: 'pending',
              retryAt,
              lastError: 'Processing failed'
            }
          }
        );

        console.warn(`⚠️  Job retry ${attempts}/${MAX_RETRIES} scheduled for ${retryAt.toISOString()}`);
      }

      return false;
    }

  } catch (error) {
    console.error(`❌ [Worker ${workerId}] Error:`, error.message);
    return false;
  }
}

/**
 * Worker loop - continuously processes jobs
 */
async function workerLoop(workerId) {
  while (true) {
    try {
      const processed = await processNextJob(workerId);

      if (!processed) {
        // No jobs available, wait before polling again
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }

    } catch (error) {
      console.error(`❌ [Worker ${workerId}] Loop error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
  }
}

/**
 * Start all workers
 */
async function startWorkers() {
  // 🚨 CRITICAL: Don't start MongoDB workers if BullMQ is enabled
  const BULLMQ_ENABLED = process.env.BULLMQ_ENABLED === 'true';

  if (BULLMQ_ENABLED) {
    console.log('\n⚠️  ========== MONGODB IN-PROCESS WORKERS DISABLED ==========');
    console.log('🚀 BullMQ is enabled (BULLMQ_ENABLED=true)');
    console.log('📊 MongoDB in-process workers will NOT start');
    console.log('💡 BullMQ workers will handle all webhook processing');
    console.log('💡 To use MongoDB workers, set BULLMQ_ENABLED=false');
    console.log('============================================================\n');
    return; // Exit immediately without starting workers
  }

  console.log(`🚀 Starting ${WORKERS} in-process MongoDB workers...`);

  // Test database connection first
  try {
    await getDatabase();
    console.log('✅ MongoDB connected\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }

  // Start all workers (non-blocking)
  for (let i = 1; i <= WORKERS; i++) {
    workerLoop(i).catch(err => {
      console.error(`❌ Worker ${i} crashed:`, err.message);
    });
  }

  console.log(`✅ Started ${WORKERS} MongoDB in-process workers\n`);

  // Log metrics periodically
  setInterval(() => {
    console.log(`📊 Metrics: ${totalProcessed} processed, ${totalFailed} failed, ${activeWorkers} active`);
  }, 60000);
}

module.exports = startWorkers;

// If run directly
if (require.main === module) {
  startWorkers().catch(err => {
    console.error('❌ Failed to start workers:', err);
    process.exit(1);
  });
}
