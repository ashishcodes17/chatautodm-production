/**
 * Reset Stuck Jobs Script
 * 
 * Resets jobs stuck in "processing" status back to "pending"
 * Run this if workers crash and leave jobs in limbo
 * 
 * Usage: node scripts/reset-stuck-jobs.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority';
const STUCK_THRESHOLD = 5 * 60 * 1000; // 5 minutes

async function resetStuckJobs() {
  console.log('\n🔧 ========== RESET STUCK JOBS ==========\n');
  
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();
  
  try {
    // Find jobs stuck in processing for more than threshold
    const stuckTime = new Date(Date.now() - STUCK_THRESHOLD);
    
    const stuckJobs = await db.collection('webhook_queue').find({
      status: 'processing',
      startedAt: { $lt: stuckTime }
    }).toArray();
    
    console.log(`📊 Found ${stuckJobs.length} stuck jobs (processing > 5 minutes)\n`);
    
    if (stuckJobs.length === 0) {
      console.log('✅ No stuck jobs found!\n');
      await client.close();
      return;
    }
    
    // Show sample of stuck jobs
    console.log('📋 Sample stuck jobs:');
    stuckJobs.slice(0, 5).forEach(job => {
      const stuckDuration = Math.floor((Date.now() - new Date(job.startedAt).getTime()) / 1000);
      console.log(`   - Job ${job._id}: stuck for ${stuckDuration}s (worker: ${job.workerId}, attempts: ${job.attempts})`);
    });
    console.log();
    
    // Reset them to pending
    const result = await db.collection('webhook_queue').updateMany(
      {
        status: 'processing',
        startedAt: { $lt: stuckTime }
      },
      {
        $set: {
          status: 'pending',
          workerId: null,
          startedAt: null
        }
      }
    );
    
    console.log(`✅ Reset ${result.modifiedCount} jobs to pending status\n`);
    console.log('🔄 Workers should pick them up automatically\n');
    
    // Show current stats
    const stats = await db.collection('webhook_queue').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('📊 Current queue stats:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    console.log();
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('========================================\n');
  }
}

resetStuckJobs().catch(console.error);
