require('dotenv').config();
const { MongoClient } = require('mongodb');

(async () => {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();
  
  await db.collection('comments').createIndex(
    { commentId: 1, instagramUserId: 1, processed: 1 },
    { background: true, name: 'comment_dedup_idx' }
  );
  
  console.log('✅ Comment deduplication index created');
  await client.close();
})().catch(console.error);
