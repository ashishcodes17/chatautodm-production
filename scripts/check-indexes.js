/**
 * Check indexes on user_states collection
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";

async function checkIndexes() {
  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  console.log('\n📊 user_states indexes:');
  const userStateIndexes = await db.collection('user_states').indexes();
  userStateIndexes.forEach(idx => {
    console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });

  console.log('\n📊 webhook_queue indexes:');
  const queueIndexes = await db.collection('webhook_queue').indexes();
  queueIndexes.forEach(idx => {
    console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });

  await client.close();
}

checkIndexes().catch(console.error);
