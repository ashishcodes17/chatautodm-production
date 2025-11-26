/**
 * Quick MongoDB connection test
 */
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  console.log('1️⃣ Testing basic connection...');
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected successfully!\n');
    
    console.log('2️⃣ Checking server status...');
    const admin = client.db().admin();
    const serverStatus = await admin.serverStatus();
    console.log(`   MongoDB version: ${serverStatus.version}`);
    console.log(`   Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`);
    console.log(`   Current connections: ${serverStatus.connections.current}`);
    console.log(`   Available connections: ${serverStatus.connections.available}`);
    console.log(`   Total created: ${serverStatus.connections.totalCreated}\n`);
    
    console.log('3️⃣ Checking queue...');
    const db = client.db();
    const pending = await db.collection('webhook_queue').countDocuments({ status: 'pending' });
    const processing = await db.collection('webhook_queue').countDocuments({ status: 'processing' });
    const completed = await db.collection('webhook_queue').countDocuments({ status: 'completed' });
    const failed = await db.collection('webhook_queue').countDocuments({ status: 'failed' });
    
    console.log(`   📊 Queue Status:`);
    console.log(`   - Pending: ${pending}`);
    console.log(`   - Processing: ${processing}`);
    console.log(`   - Completed: ${completed}`);
    console.log(`   - Failed: ${failed}\n`);
    
    if (processing > 100) {
      console.log(`⚠️  WARNING: ${processing} webhooks stuck in "processing" state!`);
      console.log(`   This may be consuming connections. Run: node scripts/reset-stuck-processing.js\n`);
    }
    
    await client.close();
    console.log('✅ All checks passed!\n');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Possible causes:');
    console.log('   1. MongoDB server is down or unreachable');
    console.log('   2. Too many open connections (max limit reached)');
    console.log('   3. Network/firewall issue');
    console.log('   4. Wrong credentials or IP not whitelisted\n');
    
    if (error.message.includes('ETIMEDOUT')) {
      console.log('🔧 This is a TIMEOUT - the server is not responding.');
      console.log('   Try: ping 62.72.42.195');
      console.log('   Or check if MongoDB service is running on the server.\n');
    }
    
    process.exit(1);
  }
}

testConnection();
