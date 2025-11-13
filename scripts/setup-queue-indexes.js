/**
 * Setup MongoDB Indexes for Webhook Queue System
 * 
 * SAFE TO RUN: This script only creates indexes, doesn't modify data
 * Run this BEFORE deploying the queue system
 * 
 * Usage:
 *   node scripts/setup-queue-indexes.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority';

async function setupIndexes() {
  console.log('🔧 Connecting to MongoDB on VPS (62.72.42.195)...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  console.log('📊 Setting up webhook_queue collection...');

  // Create the collection if it doesn't exist
  const collections = await db.listCollections({ name: 'webhook_queue' }).toArray();
  if (collections.length === 0) {
    await db.createCollection('webhook_queue');
    console.log('✅ Created webhook_queue collection');
  } else {
    console.log('ℹ️  webhook_queue collection already exists');
  }

  // Index 1: Main processing index (CRITICAL for performance)
  console.log('📌 Creating processing index...');
  await db.collection('webhook_queue').createIndex(
    { status: 1, priority: 1, createdAt: 1 },
    { 
      name: 'queue_processing_index',
      background: true  // Non-blocking index creation
    }
  );
  console.log('✅ Processing index created');

  // Index 2: Auto-cleanup old completed jobs (7 days)
  console.log('📌 Creating TTL index for auto-cleanup...');
  await db.collection('webhook_queue').createIndex(
    { createdAt: 1 },
    { 
      name: 'queue_ttl_index',
      expireAfterSeconds: 604800,  // 7 days
      background: true,
      partialFilterExpression: { status: 'completed' }  // Only delete completed jobs
    }
  );
  console.log('✅ TTL index created (auto-delete after 7 days)');

  // Index 3: Deduplication index
  console.log('📌 Creating deduplication index...');
  await db.collection('webhook_queue').createIndex(
    { webhookHash: 1, createdAt: 1 },
    { 
      name: 'deduplication_index',
      background: true,
      sparse: true  // Only index documents with webhookHash
    }
  );
  console.log('✅ Deduplication index created');

  // Index 4: Monitoring/stats index
  console.log('📌 Creating status index for monitoring...');
  await db.collection('webhook_queue').createIndex(
    { status: 1, createdAt: -1 },
    { 
      name: 'status_monitoring_index',
      background: true
    }
  );
  console.log('✅ Status index created');

  // Optimize existing collections for better performance
  console.log('📌 Optimizing existing webhook_logs index...');
  await db.collection('webhook_logs').createIndex(
    { timestamp: -1 },
    { 
      name: 'timestamp_desc_index',
      background: true
    }
  );
  console.log('✅ webhook_logs index optimized');

  console.log('📌 Optimizing contacts index...');
  await db.collection('contacts').createIndex(
    { instagramUserId: 1, senderId: 1 },
    { 
      name: 'contact_lookup_index',
      background: true
    }
  );
  console.log('✅ contacts index optimized');

  console.log('📌 Optimizing user_states index...');
  await db.collection('user_states').createIndex(
    { senderId: 1, accountId: 1 },
    { 
      name: 'user_state_lookup_index',
      background: true
    }
  );
  console.log('✅ user_states index optimized');

  console.log('📌 Optimizing automations index...');
  await db.collection('automations').createIndex(
    { workspaceId: 1, isActive: 1, type: 1 },
    { 
      name: 'automation_lookup_index',
      background: true
    }
  );
  console.log('✅ automations index optimized');

  // Show all indexes
  console.log('\n📋 All indexes on webhook_queue:');
  const indexes = await db.collection('webhook_queue').indexes();
  indexes.forEach(idx => {
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });

  await client.close();
  console.log('\n✅ Database setup complete! Safe to deploy queue system.\n');
}

setupIndexes().catch(err => {
  console.error('❌ Error setting up indexes:', err);
  process.exit(1);
});
