/**
 * CORRECT Worker Architecture
 * 
 * Single Node.js process with controlled concurrency
 * Processes 10-20 webhooks concurrently (not 180!)
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY || '10', 10); // 10 concurrent jobs
const POLL_INTERVAL = parseInt(process.env.QUEUE_POLL_INTERVAL || '1000', 10);
const MAX_RETRIES = parseInt(process.env.QUEUE_MAX_RETRIES || '3', 10);
const WEBHOOK_TIMEOUT = 30000; // 30 seconds per webhook

let db = null;
let isShuttingDown = false;
let activeJobs = 0;

async function getDatabase() {
  if (db) return db;
  const client = await MongoClient.connect(MONGODB_URI);
  db = client.db();
  return db;
}

/**
 * Process webhook via HTTP to localhost
 */
async function processWebhook(data) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);
    
    const response = await fetch('http://localhost:3000/api/webhooks/instagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Worker': 'true'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status === 200;
    
  } catch (error) {
    console.error('❌ Processing error:', error.message);
    return false;
  }
}

/**
 * Process a single job from queue
 */
async function processJob() {
  const db = await getDatabase();
  const collection = db.collection('webhook_queue');
  const now = new Date();

  try {
    // Claim next job atomically
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

    activeJobs++;
    const startTime = Date.now();
    
    // Process webhook
    const success = await processWebhook(job.data);
    const processingTime = Date.now() - startTime;

    if (success) {
      // Mark completed
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
      
      activeJobs--;
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
        
      } else {
        // Schedule retry
        const retryDelay = Math.pow(2, attempts) * 5000;
        await collection.updateOne(
          { _id: job._id },
          {
            $set: {
              status: 'pending',
              retryAt: new Date(Date.now() + retryDelay),
              lastError: 'Processing failed'
            }
          }
        );
      }
      
      activeJobs--;
      return false;
    }

  } catch (error) {
    console.error('❌ Job processing error:', error.message);
    activeJobs--;
    return false;
  }
}

/**
 * Main worker loop - maintains CONCURRENCY concurrent jobs
 */
async function workerLoop() {
  console.log(`🚀 Starting worker with concurrency: ${CONCURRENCY}`);
  console.log(`📊 This means ${CONCURRENCY} webhooks processed at the same time\n`);
  
  let totalProcessed = 0;
  let totalFailed = 0;
  
  // Log metrics every minute
  setInterval(() => {
    console.log(`📊 Stats: ${totalProcessed} processed, ${totalFailed} failed, ${activeJobs} active`);
  }, 60000);

  while (!isShuttingDown) {
    try {
      // If we have room for more concurrent jobs, start them
      if (activeJobs < CONCURRENCY) {
        const jobsToStart = CONCURRENCY - activeJobs;
        
        // Start multiple jobs concurrently (up to CONCURRENCY limit)
        const promises = [];
        for (let i = 0; i < jobsToStart; i++) {
          promises.push(
            processJob().then(success => {
              if (success) totalProcessed++;
              else if (success === false) totalFailed++;
            })
          );
        }
        
        await Promise.all(promises);
      }
      
      // Small delay before next batch
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      
    } catch (error) {
      console.error('❌ Worker loop error:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Graceful shutdown
 */
function setupShutdown() {
  const shutdown = async () => {
    console.log('\n⚠️  Shutting down gracefully...');
    isShuttingDown = true;
    
    // Wait for active jobs to complete (max 30 seconds)
    const startTime = Date.now();
    while (activeJobs > 0 && Date.now() - startTime < 30000) {
      console.log(`   Waiting for ${activeJobs} active jobs to complete...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ Shutdown complete\n');
    process.exit(0);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

/**
 * Start worker
 */
async function startWorker() {
  try {
    // Test database connection
    await getDatabase();
    console.log('✅ MongoDB connected\n');
    
    setupShutdown();
    await workerLoop();
    
  } catch (error) {
    console.error('❌ Worker failed to start:', error);
    process.exit(1);
  }
}

// Start
startWorker();
