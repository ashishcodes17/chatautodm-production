/**
 * Check Active Workers Status
 * 
 * Shows real-time status of what workers are actually doing:
 * - How many jobs are "processing" (claimed by workers)
 * - How long they've been processing
 * - Which workers are stuck (processing > 30 seconds)
 * - Worker efficiency metrics
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";

async function main() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  console.log('\n🔍 ========== WORKER STATUS CHECK ==========\n');

  // 1. Current queue status
  const stats = await db.collection("webhook_queue").aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  const pending = stats.find(s => s._id === "pending")?.count || 0;
  const processing = stats.find(s => s._id === "processing")?.count || 0;
  const completed = stats.find(s => s._id === "completed")?.count || 0;
  const failed = stats.find(s => s._id === "failed")?.count || 0;

  console.log('📊 Queue Status:');
  console.log(`   Pending:     ${pending}`);
  console.log(`   Processing:  ${processing} ⚡ (workers actively working)`);
  console.log(`   Completed:   ${completed.toLocaleString()}`);
  console.log(`   Failed:      ${failed}\n`);

  // 2. Check jobs currently being processed
  if (processing > 0) {
    console.log('🔄 Jobs Currently Processing:\n');
    
    const processingJobs = await db.collection("webhook_queue")
      .find({ status: "processing" })
      .sort({ startedAt: 1 })
      .limit(20)
      .toArray();

    const now = new Date();
    let stuckCount = 0;

    processingJobs.forEach((job, index) => {
      const processingTime = Math.floor((now - new Date(job.startedAt)) / 1000);
      const isStuck = processingTime > 30;
      
      if (isStuck) stuckCount++;
      
      const statusIcon = isStuck ? '🔴 STUCK' : '🟢 OK';
      
      console.log(`   ${statusIcon} Job ${job._id}`);
      console.log(`      Worker ID: ${job.workerId || 'unknown'}`);
      console.log(`      Processing for: ${processingTime}s`);
      console.log(`      Attempts: ${job.attempts || 1}`);
      console.log(`      Started: ${job.startedAt.toISOString()}`);
      
      if (index < processingJobs.length - 1) {
        console.log('');
      }
    });

    if (processingJobs.length > 20) {
      console.log(`\n   ... and ${processingJobs.length - 20} more jobs`);
    }

    console.log(`\n⚠️  Stuck jobs (>30s): ${stuckCount}/${processingJobs.length}`);
  } else {
    console.log('💤 No jobs currently being processed (workers are idle or polling)\n');
  }

  // 3. Check recent completion rate
  console.log('\n📈 Recent Performance (last 60 seconds):\n');
  
  const oneMinuteAgo = new Date(Date.now() - 60000);
  const recentCompleted = await db.collection("webhook_queue").countDocuments({
    status: "completed",
    completedAt: { $gte: oneMinuteAgo }
  });

  const recentFailed = await db.collection("webhook_queue").countDocuments({
    status: "failed",
    failedAt: { $gte: oneMinuteAgo }
  });

  console.log(`   ✅ Completed: ${recentCompleted} (${recentCompleted}/min)`);
  console.log(`   ❌ Failed: ${recentFailed}`);
  console.log(`   📊 Success Rate: ${recentCompleted > 0 ? ((recentCompleted / (recentCompleted + recentFailed)) * 100).toFixed(1) : 0}%`);

  // 4. Check if workers are actually working
  console.log('\n🔍 Worker Activity Analysis:\n');

  const recentlyStarted = await db.collection("webhook_queue").countDocuments({
    status: "processing",
    startedAt: { $gte: new Date(Date.now() - 10000) }
  });

  if (recentlyStarted > 0) {
    console.log(`   ✅ ${recentlyStarted} jobs started in last 10 seconds - Workers ARE working!`);
  } else {
    console.log(`   ⚠️  No jobs started in last 10 seconds`);
    if (pending > 0) {
      console.log(`   🔴 ${pending} jobs pending but workers not picking them up!`);
      console.log(`   💡 Possible issues:`);
      console.log(`      - Workers crashed or not running`);
      console.log(`      - Workers stuck in infinite loop`);
      console.log(`      - Database connection issues`);
    } else {
      console.log(`   ✅ Queue is empty - workers are idle (this is good!)`);
    }
  }

  // 5. Check for stuck jobs that need reset
  const veryStuckJobs = await db.collection("webhook_queue").countDocuments({
    status: "processing",
    startedAt: { $lt: new Date(Date.now() - 60000) }
  });

  if (veryStuckJobs > 0) {
    console.log(`\n⚠️  ${veryStuckJobs} jobs stuck for >60 seconds`);
    console.log(`   Run: node scripts/reset-stuck-jobs.js`);
  }

  // 6. Check worker distribution
  console.log('\n👷 Worker Distribution:\n');
  
  const workerStats = await db.collection("webhook_queue").aggregate([
    { $match: { status: "processing" } },
    {
      $group: {
        _id: "$workerId",
        count: { $sum: 1 },
        oldestJob: { $min: "$startedAt" }
      }
    },
    { $sort: { count: -1 } }
  ]).toArray();

  if (workerStats.length > 0) {
    workerStats.forEach(worker => {
      const oldestTime = Math.floor((now - new Date(worker.oldestJob)) / 1000);
      console.log(`   Worker ${worker._id}: ${worker.count} jobs (oldest: ${oldestTime}s ago)`);
    });
  } else {
    console.log('   No workers currently processing jobs');
  }

  console.log('\n==========================================\n');

  await client.close();
}

main().catch(console.error);
