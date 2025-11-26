/**
 * Emergency: Check what's blocking workers
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";

(async () => {
  const client = await MongoClient.connect(uri);
  const db = client.db();

  console.log('\n🔍 ========== WORKER DIAGNOSTIC ==========\n');

  // 1. Check processing jobs age
  const processingJobs = await db.collection('webhook_queue').find({
    status: 'processing'
  }).sort({ startedAt: 1 }).limit(10).toArray();

  console.log(`⚙️  Processing Jobs: ${processingJobs.length} total\n`);
  console.log('Oldest 10 processing jobs:');
  console.log('─────────────────────────────────────');

  const now = new Date();
  for (const job of processingJobs) {
    const age = Math.round((now - new Date(job.startedAt)) / 1000);
    console.log(`Job ${job._id}: ${age}s old | Worker ${job.workerId} | Attempts: ${job.attempts}`);
  }

  // 2. Check if workers are still claiming new jobs
  const recentJobs = await db.collection('webhook_queue').find({
    status: 'processing',
    startedAt: { $gte: new Date(Date.now() - 30000) } // Last 30 seconds
  }).toArray();

  console.log(`\n📊 Jobs claimed in last 30s: ${recentJobs.length}`);

  if (recentJobs.length === 0) {
    console.log('❌ PROBLEM: Workers stopped claiming jobs!');
    console.log('   → Workers may have crashed');
    console.log('   → Check Coolify logs for errors');
  }

  // 3. Check for errors in recent completions
  const recentCompletions = await db.collection('webhook_queue').find({
    status: 'completed',
    completedAt: { $gte: new Date(Date.now() - 60000) }
  }).limit(5).toArray();

  console.log(`\n✅ Completions in last 60s: ${recentCompletions.length}`);

  if (recentCompletions.length === 0) {
    console.log('❌ CRITICAL: No jobs completing!');
    console.log('   → Workers are stuck or erroring');
    console.log('   → Need to check production logs');
  }

  // 4. Force reset jobs older than 2 minutes
  const stuckJobs = await db.collection('webhook_queue').find({
    status: 'processing',
    startedAt: { $lt: new Date(Date.now() - 120000) } // 2 minutes
  }).toArray();

  if (stuckJobs.length > 0) {
    console.log(`\n🔄 Resetting ${stuckJobs.length} jobs stuck for >2 minutes...`);
    
    const result = await db.collection('webhook_queue').updateMany(
      {
        status: 'processing',
        startedAt: { $lt: new Date(Date.now() - 120000) }
      },
      {
        $set: {
          status: 'pending',
          startedAt: null,
          workerId: null
        }
      }
    );

    console.log(`✅ Reset ${result.modifiedCount} stuck jobs`);
  }

  console.log('\n========================================\n');
  
  await client.close();
})().catch(console.error);
