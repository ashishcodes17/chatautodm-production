/**
 * EMERGENCY: Connect with minimal settings to check/fix connection issues
 */
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm";

async function emergencyConnect() {
  console.log('🚨 EMERGENCY CONNECTION ATTEMPT\n');
  console.log('Trying with MINIMAL connection pool (1 connection)...\n');
  
  let client;
  try {
    // Ultra minimal settings - just 1 connection
    client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 1,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected!\n');
    
    const admin = client.db().admin();
    const serverStatus = await admin.serverStatus();
    
    console.log('📊 MongoDB Server Status:');
    console.log(`   Version: ${serverStatus.version}`);
    console.log(`   Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`);
    console.log(`   Current connections: ${serverStatus.connections.current}`);
    console.log(`   Available connections: ${serverStatus.connections.available}`);
    console.log(`   Max connections: ${serverStatus.connections.current + serverStatus.connections.available}\n`);
    
    if (serverStatus.connections.current > 800) {
      console.log('🔥 CONNECTION POOL EXHAUSTED!');
      console.log(`   Current: ${serverStatus.connections.current}`);
      console.log(`   Available: ${serverStatus.connections.available}`);
      console.log('\n💡 Solutions:');
      console.log('   1. Wait 5-10 minutes for connections to timeout');
      console.log('   2. Restart MongoDB service on server');
      console.log('   3. Kill orphaned connections from MongoDB shell\n');
    }
    
    const db = client.db();
    const pending = await db.collection('webhook_queue').countDocuments({ status: 'pending' });
    const processing = await db.collection('webhook_queue').countDocuments({ status: 'processing' });
    
    console.log('📊 Webhook Queue:');
    console.log(`   Pending: ${pending}`);
    console.log(`   Processing: ${processing}\n`);
    
    if (processing > 0) {
      console.log('🔧 Resetting stuck "processing" webhooks...');
      const result = await db.collection('webhook_queue').updateMany(
        { status: 'processing' },
        { 
          $set: { status: 'pending' },
          $unset: { startedAt: '', worker: '' }
        }
      );
      console.log(`   ✅ Reset ${result.modifiedCount} webhooks\n`);
    }
    
    console.log('✅ Emergency check complete!\n');
    console.log('💡 If connections are exhausted, wait 10 minutes then try again.\n');
    
  } catch (error) {
    console.error('❌ Emergency connection FAILED:', error.message);
    
    if (error.message.includes('ETIMEDOUT')) {
      console.log('\n🔥 TIMEOUT ERROR - MongoDB is not responding');
      console.log('\n💡 This means:');
      console.log('   1. MongoDB has reached MAX connections and is rejecting new ones');
      console.log('   2. Server is overloaded from too many processors running');
      console.log('   3. Need to restart MongoDB service OR wait for connections to timeout\n');
      console.log('🕐 WAIT 10-15 MINUTES for old connections to timeout naturally\n');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Connection closed properly\n');
    }
  }
}

emergencyConnect();
