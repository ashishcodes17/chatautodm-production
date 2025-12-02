/**
 * Webhook Queue Worker Startup Script
 * 
 * This script starts the worker pool that processes webhooks from the queue
 * Can be run standalone or via production-start.js
 * 
 * Usage:
 *   node scripts/start-workers.js
 * 
 * Or automatically via:
 *   npm start (if USE_QUEUE_SYSTEM=true)
 */

require('dotenv').config();

// Check if queue system is enabled
const USE_QUEUE = process.env.USE_QUEUE_SYSTEM === 'true';

if (!USE_QUEUE) {
  console.log('\n⚠️  Queue system is DISABLED (USE_QUEUE_SYSTEM=false)');
  console.log('To enable, set USE_QUEUE_SYSTEM=true in your .env file\n');
  process.exit(0);
}

// 🚨 Check if BullMQ is enabled - if so, don't start MongoDB workers
const BULLMQ_ENABLED = process.env.BULLMQ_ENABLED === 'true';

if (BULLMQ_ENABLED) {
  console.log('\n⚠️  ========== MONGODB WORKERS DISABLED ==========');
  console.log('🚀 BullMQ is enabled (BULLMQ_ENABLED=true)');
  console.log('📊 MongoDB workers will NOT start');
  console.log('💡 BullMQ workers will handle all webhook processing');
  console.log('💡 To use MongoDB workers, set BULLMQ_ENABLED=false');
  console.log('===============================================\n');
  process.exit(0);
}

console.log('🚀 Starting Webhook Queue Workers (MongoDB)...\n');

// Import and start workers (using dynamic import for ES modules)
async function startWorkersAsync() {
  try {
    // Try to import the worker module
    const workerPath = '../app/api/webhooks/worker';
    const { startWorkers } = require(workerPath);

    await startWorkers();
  } catch (err) {
    console.error('\n❌ Worker system failed to start:', err);
    console.error('\nTrying alternative startup method...\n');

    // Fallback: Start workers using a simpler polling approach
    const { startSimpleWorkers } = require('./simple-worker-fallback');
    await startSimpleWorkers();
  }
}

startWorkersAsync().catch(err => {
  console.error('\n❌ All worker startup methods failed:', err);
  process.exit(1);
});
