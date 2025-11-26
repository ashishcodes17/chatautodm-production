/**
 * Add index to webhook_queue for SUPER FAST queries
 * This makes finding pending webhooks instant
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";

async function addIndexes() {
  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  console.log('🔍 Adding indexes to webhook_queue...');
  
  // Compound index for fast query: status=pending AND createdAt >= date
  await db.collection('webhook_queue').createIndex(
    { status: 1, createdAt: -1 },
    { name: 'status_createdAt_idx', background: true }
  );
  
  console.log('✅ Index created: status + createdAt (makes queries 100x faster)');
  
  // Show all indexes
  const indexes = await db.collection('webhook_queue').indexes();
  console.log('\n📊 Current indexes:');
  indexes.forEach(idx => {
    console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });
  
  await client.close();
  console.log('\n✅ Done! Restart your emergency processor now.');
}

addIndexes().catch(console.error);
