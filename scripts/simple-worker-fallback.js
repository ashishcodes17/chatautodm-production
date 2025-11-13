/**
 * Simple Worker Fallback (JavaScript version)
 * 
 * This is a simplified version of the worker system that works
 * without TypeScript compilation issues.
 * 
 * Automatically used if the main worker.ts fails to load.
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority';
const WORKERS = parseInt(process.env.QUEUE_WORKERS || '180');
const POLL_INTERVAL = parseInt(process.env.QUEUE_POLL_INTERVAL || '1000');
const MAX_RETRIES = parseInt(process.env.QUEUE_MAX_RETRIES || '3');
const RETRY_DELAY = parseInt(process.env.QUEUE_RETRY_DELAY || '5000');

let isShuttingDown = false;
let activeWorkers = 0;
let processedCount = 0;
let failedCount = 0;
let startTime = Date.now();
let db = null;

// Connect to MongoDB
async function connectDB() {
  if (db) return db;
  
  const client = await MongoClient.connect(MONGODB_URI);
  db = client.db();
  return db;
}

// Process webhook by calling the route handler
async function processWebhookData(data) {
  // Determine the base URL (production or local)
  // In production, use internal URL or fallback to localhost
  const baseUrl = process.env.WEBHOOK_INTERNAL_URL || 
                  process.env.NEXT_PUBLIC_BASE_URL || 
                  'http://localhost:3000';
  
  const url = `${baseUrl}/api/webhooks/instagram`;
  
  console.log(`🔗 Calling webhook processor: ${url}`);
  
  try {
    // Make a fetch call to the webhook route to process it
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WebhookQueueWorker/1.0',
        'X-Internal-Worker': 'true', // Mark as internal call to skip re-queueing
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
    }

    return true;
  } catch (fetchError) {
    // Better error logging
    if (fetchError.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to ${url} - is the server running?`);
    }
    throw fetchError;
  }
}

// Main worker function
async function processNextJob(workerId) {
  if (isShuttingDown) return false;

  const database = await connectDB();
  
  try {
    // Atomic findOneAndUpdate to claim a job
    const result = await database.collection('webhook_queue').findOneAndUpdate(
      {
        status: 'pending',
        $or: [
          { attempts: { $lt: MAX_RETRIES } },
          { attempts: { $exists: false } }
        ]
      },
      {
        $set: {
          status: 'processing',
          startedAt: new Date(),
          workerId: workerId
        },
        $inc: { attempts: 1 }
      },
      {
        sort: { priority: 1, createdAt: 1 },
        returnDocument: 'after'
      }
    );

    // Check if result exists and has a value
    if (!result || !result.value) {
      return false;
    }

    const job = result.value;

    console.log(`🔄 Worker ${workerId}: Processing job ${job._id}`);
    activeWorkers++;

    try {
      // Process the webhook
      await processWebhookData(job.data);

      // Mark as completed
      await database.collection('webhook_queue').updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            processingTime: Date.now() - new Date(job.startedAt).getTime()
          }
        }
      );

      processedCount++;
      console.log(`✅ Worker ${workerId}: Completed job ${job._id}`);
      activeWorkers--;
      return true;

    } catch (error) {
      console.error(`❌ Worker ${workerId}: Error processing job ${job._id}:`, error.message);

      const currentAttempts = job.attempts || 1;
      
      if (currentAttempts >= MAX_RETRIES) {
        // Move to dead letter queue
        await database.collection('webhook_queue').updateOne(
          { _id: job._id },
          {
            $set: {
              status: 'failed',
              failedAt: new Date(),
              error: error.message
            }
          }
        );
        
        await database.collection('webhook_dead_letter').insertOne({
          originalJobId: job._id,
          data: job.data,
          attempts: currentAttempts,
          error: error.message,
          createdAt: job.createdAt,
          failedAt: new Date()
        });

        failedCount++;
        console.error(`💀 Worker ${workerId}: Job ${job._id} moved to dead letter queue`);
        
      } else {
        // Retry with exponential backoff
        const retryDelay = RETRY_DELAY * Math.pow(2, currentAttempts - 1);
        await database.collection('webhook_queue').updateOne(
          { _id: job._id },
          {
            $set: {
              status: 'pending',
              retryAt: new Date(Date.now() + retryDelay),
              lastError: error.message
            }
          }
        );
        console.log(`🔄 Worker ${workerId}: Job ${job._id} scheduled for retry in ${retryDelay}ms`);
      }

      activeWorkers--;
      return false;
    }

  } catch (error) {
    console.error(`❌ Worker ${workerId}: Fatal error:`, error.message);
    activeWorkers--;
    return false;
  }
}

// Worker loop
async function workerLoop(workerId) {
  console.log(`👷 Worker ${workerId} started`);

  while (!isShuttingDown) {
    try {
      const processed = await processNextJob(workerId);
      
      if (!processed) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
      
    } catch (error) {
      console.error(`❌ Worker ${workerId} error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL * 2));
    }
  }

  console.log(`👷 Worker ${workerId} stopped`);
}

// Metrics logger
function logMetrics() {
  setInterval(async () => {
    const database = await connectDB();
    
    const stats = await database.collection('webhook_queue').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const pending = stats.find(s => s._id === 'pending')?.count || 0;
    const processing = stats.find(s => s._id === 'processing')?.count || 0;
    const completed = stats.find(s => s._id === 'completed')?.count || 0;
    const failed = stats.find(s => s._id === 'failed')?.count || 0;

    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const throughput = processedCount / (uptime / 60);

    console.log('\n📊 ========== QUEUE METRICS ==========');
    console.log(`⏱️  Uptime: ${uptime}s`);
    console.log(`👷 Active Workers: ${activeWorkers}/${WORKERS}`);
    console.log(`📥 Pending: ${pending}`);
    console.log(`⚙️  Processing: ${processing}`);
    console.log(`✅ Completed: ${completed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Throughput: ${throughput.toFixed(1)} jobs/min`);
    console.log(`🎯 Success Rate: ${processedCount > 0 ? ((processedCount / (processedCount + failedCount)) * 100).toFixed(1) : 0}%`);
    console.log('=====================================\n');

  }, parseInt(process.env.QUEUE_METRICS_INTERVAL || '60000'));
}

// Graceful shutdown
function setupGracefulShutdown() {
  const shutdown = async () => {
    console.log('\n⚠️  Shutdown signal received, waiting for workers to finish...');
    isShuttingDown = true;

    const maxWait = 30000;
    const checkInterval = 100;
    let waited = 0;

    while (activeWorkers > 0 && waited < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    console.log(activeWorkers > 0 ? `⚠️  Force shutdown: ${activeWorkers} workers still active` : '✅ All workers finished gracefully');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Start workers
async function startSimpleWorkers() {
  console.log('\n🚀 ========== WEBHOOK QUEUE WORKER SYSTEM (Simple) ==========');
  console.log(`📊 Configuration:`);
  console.log(`   - Workers: ${WORKERS}`);
  console.log(`   - Poll Interval: ${POLL_INTERVAL}ms`);
  console.log(`   - Max Retries: ${MAX_RETRIES}`);
  console.log(`=============================================================\n`);

  setupGracefulShutdown();
  logMetrics();

  // Start all workers
  const workers = [];
  for (let i = 1; i <= WORKERS; i++) {
    workers.push(workerLoop(i));
  }

  console.log(`✅ Started ${WORKERS} workers\n`);

  await Promise.all(workers);
}

module.exports = { startSimpleWorkers };
