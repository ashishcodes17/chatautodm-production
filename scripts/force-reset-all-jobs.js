/**
 * Force reset ALL processing jobs (emergency)
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";

(async () => {
  const client = await MongoClient.connect(uri);
  const db = client.db();

  console.log('\n🚨 EMERGENCY: Resetting ALL stuck jobs...\n');

  const result = await db.collection('webhook_queue').updateMany(
    { status: 'processing' },
    {
      $set: {
        status: 'pending',
        startedAt: null,
        workerId: null
      }
    }
  );

  console.log(`✅ Reset ${result.modifiedCount} jobs back to pending`);
  console.log('\n⚠️  Now restart workers on Coolify!\n');
  
  await client.close();
})().catch(console.error);
