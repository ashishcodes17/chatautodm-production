/**
 * Quick Queue Diagnostic
 * 
 * Checks the actual state of jobs in the queue
 * Run: node scripts/check-queue-status.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority';

async function checkQueueStatus() {
  console.log('\n🔍 ========== QUEUE STATUS CHECK ==========\n');
  
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();
  
  try {
    // Get overall stats
    const stats = await db.collection('webhook_queue').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('📊 Overall Stats:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    console.log();
    
    // Check for jobs with retryAt in future
    const futureRetry = await db.collection('webhook_queue').countDocuments({
      status: 'pending',
      retryAt: { $gt: new Date() }
    });
    
    console.log(`⏰ Pending jobs with future retryAt: ${futureRetry}`);
    
    // Check for jobs ready to process
    const readyToProcess = await db.collection('webhook_queue').countDocuments({
      status: 'pending',
      $or: [
        { retryAt: { $exists: false } },
        { retryAt: { $lte: new Date() } }
      ]
    });
    
    console.log(`✅ Jobs ready to process NOW: ${readyToProcess}\n`);
    
    // Show sample of processing jobs
    const processingJobs = await db.collection('webhook_queue').find({
      status: 'processing'
    }).limit(5).toArray();
    
    if (processingJobs.length > 0) {
      console.log('📋 Sample of "processing" jobs:');
      processingJobs.forEach(job => {
        const stuckDuration = Math.floor((Date.now() - new Date(job.startedAt).getTime()) / 1000);
        console.log(`   Job ${job._id}:`);
        console.log(`     Worker: ${job.workerId || 'unknown'}`);
        console.log(`     Attempts: ${job.attempts || 0}`);
        console.log(`     Stuck for: ${stuckDuration}s`);
        console.log(`     Last error: ${job.lastError || 'none'}`);
        console.log();
      });
    }
    
    // Show sample of pending with retryAt
    const retryJobs = await db.collection('webhook_queue').find({
      status: 'pending',
      retryAt: { $exists: true }
    }).limit(3).toArray();
    
    if (retryJobs.length > 0) {
      console.log('📋 Sample of pending jobs with retryAt:');
      retryJobs.forEach(job => {
        const retryIn = Math.floor((new Date(job.retryAt).getTime() - Date.now()) / 1000);
        console.log(`   Job ${job._id}:`);
        console.log(`     Retry in: ${retryIn}s`);
        console.log(`     Attempts: ${job.attempts || 0}`);
        console.log(`     Last error: ${job.lastError || 'none'}`);
        console.log();
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('========================================\n');
  }
}

checkQueueStatus().catch(console.error);
