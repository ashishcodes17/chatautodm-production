/**
 * Check Worker Activity - See what workers are doing in real-time
 * 
 * Shows:
 * - How many jobs each worker is processing
 * - Average processing time per worker
 * - Stuck jobs (processing for >30 seconds)
 * - Worker distribution
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";

async function main() {
  const client = await MongoClient.connect(uri);
  const db = client.db();

  console.log('\n📊 ========== WORKER ACTIVITY MONITOR ==========\n');

  // 1. Check jobs currently being processed
  const processingJobs = await db.collection('webhook_queue').find({
    status: 'processing'
  }).toArray();

  console.log(`⚙️  Currently Processing: ${processingJobs.length} jobs\n`);

  // 2. Group by worker ID
  const workerStats = {};
  const now = new Date();
  
  for (const job of processingJobs) {
    const workerId = job.workerId || 'unknown';
    if (!workerStats[workerId]) {
      workerStats[workerId] = {
        count: 0,
        oldestJob: null,
        totalTime: 0
      };
    }
    
    workerStats[workerId].count++;
    
    const processingTime = now - new Date(job.startedAt);
    workerStats[workerId].totalTime += processingTime;
    
    if (!workerStats[workerId].oldestJob || processingTime > (now - new Date(workerStats[workerId].oldestJob.startedAt))) {
      workerStats[workerId].oldestJob = job;
    }
  }

  // 3. Display worker stats
  console.log('👷 Worker Distribution:');
  console.log('─────────────────────────────────────');
  
  const workers = Object.keys(workerStats).sort((a, b) => a - b);
  for (const workerId of workers) {
    const stats = workerStats[workerId];
    const avgTime = Math.round(stats.totalTime / stats.count);
    const oldestTime = Math.round((now - new Date(stats.oldestJob.startedAt)) / 1000);
    
    console.log(`Worker ${workerId}: ${stats.count} job(s) | Avg: ${avgTime}ms | Oldest: ${oldestTime}s`);
  }

  // 4. Check for stuck jobs (processing for >30 seconds)
  console.log('\n🚨 Stuck Jobs (>30s):');
  console.log('─────────────────────────────────────');
  
  const stuckJobs = processingJobs.filter(job => {
    const processingTime = now - new Date(job.startedAt);
    return processingTime > 30000;
  });

  if (stuckJobs.length === 0) {
    console.log('✅ No stuck jobs!');
  } else {
    for (const job of stuckJobs) {
      const processingTime = Math.round((now - new Date(job.startedAt)) / 1000);
      console.log(`❌ Job ${job._id}: Worker ${job.workerId} | ${processingTime}s | Attempts: ${job.attempts}`);
    }
  }

  // 5. Check recent completions (last 60 seconds)
  const recentCompletions = await db.collection('webhook_queue').find({
    status: 'completed',
    completedAt: { $gte: new Date(Date.now() - 60000) }
  }).toArray();

  const completionTimes = recentCompletions.map(job => job.processingTime).filter(t => t);
  
  if (completionTimes.length > 0) {
    const avgProcessing = Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length);
    const minProcessing = Math.min(...completionTimes);
    const maxProcessing = Math.max(...completionTimes);
    
    console.log('\n⏱️  Recent Completions (last 60s):');
    console.log('─────────────────────────────────────');
    console.log(`Completed: ${recentCompletions.length} jobs`);
    console.log(`Avg Time: ${avgProcessing}ms`);
    console.log(`Min Time: ${minProcessing}ms`);
    console.log(`Max Time: ${maxProcessing}ms`);
  }

  // 6. Check for failed jobs in last 60 seconds
  const recentFailures = await db.collection('webhook_queue').countDocuments({
    status: 'failed',
    failedAt: { $gte: new Date(Date.now() - 60000) }
  });

  if (recentFailures > 0) {
    console.log(`\n⚠️  Recent Failures: ${recentFailures} jobs failed in last 60s`);
  }

  // 7. Overall queue status
  const queueStats = await db.collection('webhook_queue').aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  console.log('\n📈 Queue Status:');
  console.log('─────────────────────────────────────');
  for (const stat of queueStats) {
    console.log(`${stat._id}: ${stat.count.toLocaleString()}`);
  }

  console.log('\n==============================================\n');
  
  await client.close();
}

main().catch(console.error);
