/**
 * Reset webhooks stuck in "processing" state back to "pending"
 * Run this to recover from MongoDB connection failures
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";

async function resetStuckWebhooks() {
  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  console.log('🔍 Finding stuck webhooks in "processing" state...');
  
  // Find webhooks stuck in processing for more than 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const result = await db.collection('webhook_queue').updateMany(
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

  console.log(`✅ Reset ${result.modifiedCount} stuck webhooks back to pending`);
  
  await client.close();
}

resetStuckWebhooks().catch(console.error);
