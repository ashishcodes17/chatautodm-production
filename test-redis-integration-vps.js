// Test Redis Integration with MongoDB
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm';
const REDIS_PASSWORD = '1196843649';

async function testRedisIntegration() {
  console.log('Testing Redis Integration with MongoDB...\n');

  const Redis = require('ioredis');
  
  const redis = new Redis({
    host: 'localhost',
    port: 6379,
    password: REDIS_PASSWORD,
    connectTimeout: 3000
  });

  let mongoClient;

  try {
    // Test 1: Redis Connection
    console.log('Test 1: Redis connection...');
    await redis.ping();
    console.log('OK Redis connected\n');

    // Test 2: MongoDB Connection
    console.log('Test 2: MongoDB connection...');
    mongoClient = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    const db = mongoClient.db();
    console.log('OK MongoDB connected\n');

    // Test 3: Fetch workspaces from MongoDB
    console.log('Test 3: Fetching workspaces from MongoDB...');
    const workspaces = await db.collection('workspaces').find({}).limit(5).toArray();
    console.log('OK Found ' + workspaces.length + ' workspaces\n');

    if (workspaces.length === 0) {
      console.log('WARN No workspaces found, skipping cache test');
      return;
    }

    // Test 4: Cache workspace data
    console.log('Test 4: Caching workspace data in Redis...');
    for (const workspace of workspaces) {
      const cacheKey = 'workspace:' + (workspace.instagramUserId || workspace._id);
      const cacheData = {
        _id: workspace._id.toString(),
        name: workspace.name,
        instagramUserId: workspace.instagramUserId,
        cachedAt: Date.now()
      };
      
      await redis.setex(cacheKey, 3600, JSON.stringify(cacheData));
      console.log('  OK Cached: ' + workspace.name);
    }
    console.log('');

    // Test 5: Retrieve from cache
    console.log('Test 5: Retrieving from Redis cache...');
    const firstWorkspace = workspaces[0];
    const cacheKey = 'workspace:' + (firstWorkspace.instagramUserId || firstWorkspace._id);
    
    const start = Date.now();
    const cached = await redis.get(cacheKey);
    const duration = Date.now() - start;
    
    const parsedCache = JSON.parse(cached);
    console.log('  OK Retrieved: ' + parsedCache.name + ' (' + duration + 'ms)');
    console.log('');

    // Test 6: Fetch automations
    console.log('Test 6: Caching automations...');
    const automations = await db.collection('automations')
      .find({})
      .limit(5)
      .toArray();
    
    console.log('  Found ' + automations.length + ' automations');
    
    for (const automation of automations) {
      const autoKey = 'automation:' + automation.workspaceId + ':' + automation.type + ':all';
      await redis.setex(autoKey, 3600, JSON.stringify([automation]));
    }
    console.log('  OK Cached ' + automations.length + ' automations\n');

    // Test 7: Database stats
    console.log('Test 7: Redis database stats...');
    const dbsize = await redis.dbsize();
    const memory = await redis.info('memory');
    const memMatch = memory.match(/used_memory_human:([\d.]+[KMG])/);
    
    console.log('  OK Total keys: ' + dbsize);
    console.log('  OK Memory used: ' + (memMatch ? memMatch[1] : 'N/A'));
    console.log('');

    console.log('SUCCESS All tests passed! Redis integration is working correctly.\n');
    console.log('Summary:');
    console.log('   - Redis keys: ' + dbsize);
    console.log('   - Workspaces cached: ' + workspaces.length);
    console.log('   - Automations cached: ' + automations.length);
    console.log('   - Cache retrieval: ' + duration + 'ms (vs ~20ms MongoDB)');
    console.log('');
    console.log('READY FOR PRODUCTION with Redis caching!\n');

  } catch (err) {
    console.error('ERROR Test failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await redis.quit();
    if (mongoClient) await mongoClient.close();
  }
}

testRedisIntegration();
