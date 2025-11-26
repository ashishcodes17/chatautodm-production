/**
 * NUCLEAR OPTION: Mark all old webhooks (>24h) as failed immediately
 * Instagram won't process them anyway (24h window)
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";

async function markOldWebhooksFailed() {
  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  console.log('🔍 Finding old webhooks (>24 hours)...');
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Mark all old pending/processing webhooks as failed
  const result = await db.collection('webhook_queue').updateMany(
    { 
      status: { $in: ['pending', 'processing'] },
      createdAt: { $lt: oneDayAgo }
    },
    { 
      $set: { 
        status: 'failed',
        failedAt: new Date(),
        error: 'Outside 24h Instagram messaging window - auto-failed',
        worker: 'cleanup-script'
      } 
    }
  );

  console.log(`✅ Marked ${result.modifiedCount} old webhooks as failed`);
  
  // Also reset stuck processing webhooks
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const resetResult = await db.collection('webhook_queue').updateMany(
    { 
      status: 'processing',
      startedAt: { $lt: fiveMinutesAgo }
    },
    { 
      $set: { 
        status: 'pending',
        worker: null,
        startedAt: null
      } 
    }
  );

  console.log(`✅ Reset ${resetResult.modifiedCount} stuck webhooks back to pending`);
  
  // Show current stats
  const stats = await db.collection('webhook_queue').aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  console.log('\n📊 Current Queue Status:');
  stats.forEach(s => {
    console.log(`   ${s._id}: ${s.count.toLocaleString()}`);
  });
  
  await client.close();
}

markOldWebhooksFailed().catch(console.error);
