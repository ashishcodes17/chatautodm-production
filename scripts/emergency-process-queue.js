/**
 * EMERGENCY: Process webhooks directly (bypass broken workers)
 * 
 * OPTION 1: Run this locally to clear backlog (calls production API)
 * OPTION 2: SSH to Coolify and restart workers: pm2 restart all
 * 
 * This script fetches webhooks from queue and sends them to production API
 * 
 * Usage: node scripts/emergency-process-queue.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";
const PRODUCTION_API = process.env.PRODUCTION_URL || "https://chatautodm.com"; // Your production URL
const PARALLEL_JOBS = 30; // Process 30 webhooks at once (safe for production API)

let processed = 0;
let failed = 0;
const startTime = Date.now();

async function processWebhook(data) {
  // Send webhook to production Next.js API
  const response = await fetch(`${PRODUCTION_API}/api/webhooks/instagram`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}: ${await response.text()}`);
  }
}

async function main() {
  console.log('\n🚨 ========== EMERGENCY QUEUE PROCESSOR ==========');
  console.log('⚠️  Bypassing broken workers - processing directly');
  console.log(`⚡ Parallel jobs: ${PARALLEL_JOBS}`);
  console.log('==================================================\n');

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  while (true) {
    // Fetch batch
    const jobs = await db.collection('webhook_queue')
      .find({ status: 'pending' })
      .limit(PARALLEL_JOBS)
      .toArray();

    if (jobs.length === 0) {
      console.log('\n✅ Queue empty!');
      break;
    }

    console.log(`\n📦 Processing batch of ${jobs.length} webhooks...`);

    // Process in parallel
    const promises = jobs.map(async (job) => {
      try {
        // Mark as processing
        await db.collection('webhook_queue').updateOne(
          { _id: job._id },
          { $set: { status: 'processing', startedAt: new Date() } }
        );

        // Process
        await processWebhook(job.data);

        // Mark completed
        await db.collection('webhook_queue').updateOne(
          { _id: job._id },
          { 
            $set: { 
              status: 'completed', 
              completedAt: new Date(),
              processingTime: Date.now() - new Date(job.startedAt || Date.now()).getTime()
            } 
          }
        );

        processed++;
        return true;

      } catch (error) {
        console.error(`❌ Job ${job._id} failed:`, error.message);

        // Mark failed
        await db.collection('webhook_queue').updateOne(
          { _id: job._id },
          { 
            $set: { 
              status: 'failed', 
              failedAt: new Date(),
              error: error.message 
            } 
          }
        );

        failed++;
        return false;
      }
    });

    await Promise.all(promises);

    // Show progress
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const rate = Math.round((processed / elapsed) * 60);
    const remaining = await db.collection('webhook_queue').countDocuments({ status: 'pending' });

    console.log(`✅ Processed: ${processed} | ❌ Failed: ${failed} | ⏳ Remaining: ${remaining} | ⚡ Rate: ${rate}/min`);
  }

  const totalTime = Math.floor((Date.now() - startTime) / 1000);
  const avgRate = Math.round((processed / totalTime) * 60);

  console.log('\n✅ ========== EMERGENCY PROCESSING COMPLETE ==========');
  console.log(`Total time: ${totalTime}s`);
  console.log(`Processed: ${processed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Average rate: ${avgRate} webhooks/min`);
  console.log('====================================================\n');

  await client.close();
}

main().catch(console.error);
