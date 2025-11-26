/**
 * OPTIMIZE WEBHOOK QUEUE INDEXES FOR FAST PROCESSING
 * Adds compound indexes specifically for realtime processor queries
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm";

async function optimizeIndexes() {
  console.log('🔧 Optimizing webhook_queue indexes for fast processing...\n');
  
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();
  const collection = db.collection('webhook_queue');

  try {
    // 1. Index for fetching pending webhooks by time (CRITICAL for processor)
    console.log('📌 Creating index: status + createdAt (ascending) for pending fetch...');
    await collection.createIndex(
      { status: 1, createdAt: 1 },
      { 
        name: 'processor_pending_fetch_idx',
        background: true 
      }
    );
    console.log('✅ Created processor_pending_fetch_idx\n');

    // 2. Index for fetching failed webhooks by time (for retry)
    console.log('📌 Creating index: status + createdAt (ascending) for failed fetch...');
    await collection.createIndex(
      { status: 1, createdAt: 1 },
      { 
        name: 'processor_failed_fetch_idx',
        background: true,
        partialFilterExpression: { status: 'failed' }
      }
    );
    console.log('✅ Created processor_failed_fetch_idx\n');

    // 3. Compound index for atomic claim (status check)
    console.log('📌 Creating index: status for atomic claim...');
    await collection.createIndex(
      { status: 1 },
      { 
        name: 'processor_claim_idx',
        background: true 
      }
    );
    console.log('✅ Created processor_claim_idx\n');

    // Show current indexes
    console.log('📊 Current webhook_queue indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Show collection stats
    console.log('\n📊 Collection stats:');
    const stats = await db.command({ collStats: 'webhook_queue' });
    console.log(`   Documents: ${stats.count.toLocaleString()}`);
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Indexes: ${stats.nindexes}`);
    console.log(`   Index size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Done!');
  }
}

optimizeIndexes().catch(console.error);
