/**
 * Clear Redis Cache Script
 * 
 * This script flushes the Redis cache to force fresh data loading.
 * Use this after updating the plan field or making schema changes.
 * 
 * Usage: npx tsx scripts/clear-redis-cache.ts
 */

import { createClient } from 'redis'

const REDIS_URL = process.env.REDIS_URL

if (!REDIS_URL) {
  console.error('❌ REDIS_URL environment variable is not set')
  process.exit(1)
}

async function clearRedisCache() {
  const client = createClient({
    url: REDIS_URL,
    socket: {
      reconnectStrategy: false
    }
  })

  try {
    console.log('🔌 Connecting to Redis...')
    await client.connect()
    console.log('✅ Connected to Redis')

    console.log('\n🗑️  Clearing all cached data...')
    
    // Get all workspace keys
    const workspaceKeys = await client.keys('workspace:*')
    const automationKeys = await client.keys('automation:*')
    
    console.log(`   Found ${workspaceKeys.length} workspace cache entries`)
    console.log(`   Found ${automationKeys.length} automation cache entries`)
    
    // Delete workspace keys
    if (workspaceKeys.length > 0) {
      await client.del(workspaceKeys)
      console.log(`   ✅ Deleted ${workspaceKeys.length} workspace cache entries`)
    }
    
    // Delete automation keys
    if (automationKeys.length > 0) {
      await client.del(automationKeys)
      console.log(`   ✅ Deleted ${automationKeys.length} automation cache entries`)
    }
    
    console.log('\n✅ Redis cache cleared successfully!')
    console.log('💡 Fresh data with plan fields will be loaded on next webhook')
    
  } catch (error) {
    console.error('\n❌ Failed to clear cache:', error)
    throw error
  } finally {
    await client.quit()
    console.log('\n🔌 Disconnected from Redis')
  }
}

clearRedisCache().catch(console.error)
