import { getDatabase } from "./mongodb"
import { getClient } from "./redis-factory"

const CACHE_KEY = "admin:stats:global"
const CACHE_TTL = 60 // 1 minute cache
const RATE_LIMIT_KEY = "admin:stats:last_publish"
const MIN_PUBLISH_INTERVAL = 10000 // Minimum 10 seconds between Pub/Sub publishes

export interface AdminStats {
  totalUsers: number
  totalWorkspaces: number
  totalDMsSent: number
  totalContacts: number
  totalAutomations: number
  activeAutomations: number
  avgDMsPerUser: number
  avgAutomationsPerUser: number
  lastUpdated: string
}

/**
 * Get admin stats from cache or compute if expired
 * Uses Redis for caching to avoid hammering MongoDB
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const redis = getClient("cache")

    // Try to get from cache first
    if (redis) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        console.log("✅ Admin stats from cache")
        return JSON.parse(cached)
      }
    }

    // Cache miss or Redis unavailable - compute stats
    console.log("📊 Computing admin stats...")
    const stats = await computeAdminStats()

    // Cache the result
    if (redis) {
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(stats))
      console.log(`✅ Admin stats cached for ${CACHE_TTL}s`)
    }

    return stats
  } catch (error) {
    console.error("❌ Error getting admin stats:", error)
    // Return default stats on error
    return {
      totalUsers: 0,
      totalWorkspaces: 0,
      totalDMsSent: 0,
      totalContacts: 0,
      totalAutomations: 0,
      activeAutomations: 0,
      avgDMsPerUser: 0,
      avgAutomationsPerUser: 0,
      lastUpdated: new Date().toISOString(),
    }
  }
}

/**
 * Compute admin stats using efficient MongoDB aggregation
 * This is called only when cache expires
 */
async function computeAdminStats(): Promise<AdminStats> {
  const db = await getDatabase()

  // Use Promise.all to run queries in parallel
  const [
    totalUsers,
    totalWorkspaces,
    totalContacts,
    totalAutomations,
    activeAutomations,
    dmStats,
  ] = await Promise.all([
    db.collection("users").estimatedDocumentCount(), // Faster than countDocuments
    db.collection("workspaces").estimatedDocumentCount(),
    db.collection("contacts").estimatedDocumentCount(),
    db.collection("automations").estimatedDocumentCount(),
    db.collection("automations").countDocuments({ isActive: true }), // Need exact count for active
    
    // Use aggregation to sum DMs efficiently on DB side
    db.collection("instagram_accounts").aggregate([
      {
        $group: {
          _id: null,
          totalDMs: { $sum: "$dmUsed" },
          count: { $sum: 1 },
        },
      },
    ]).toArray(),
  ])

  const totalDMsSent = dmStats[0]?.totalDMs || 0

  // Calculate averages
  const avgDMsPerUser = totalUsers > 0 ? Math.round(totalDMsSent / totalUsers) : 0
  const avgAutomationsPerUser = totalUsers > 0 ? Math.round((totalAutomations / totalUsers) * 10) / 10 : 0

  return {
    totalUsers,
    totalWorkspaces,
    totalDMsSent,
    totalContacts,
    totalAutomations,
    activeAutomations,
    avgDMsPerUser,
    avgAutomationsPerUser,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Force refresh admin stats cache
 * Call this after major operations (user signup, automation created, etc.)
 * Includes rate limiting to prevent Pub/Sub spam at high volume (20k+ DMs/12hrs)
 */
export async function refreshAdminStatsCache(skipRateLimit = false): Promise<void> {
  try {
    const stats = await computeAdminStats()
    const cacheRedis = getClient("cache")
    const pubsubRedis = getClient("pubsub")
    
    if (cacheRedis) {
      await cacheRedis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(stats))
      console.log("✅ Admin stats cache refreshed")
      
      // Notify all SSE subscribers with rate limiting
      if (pubsubRedis && !skipRateLimit) {
        const shouldPublish = await checkRateLimit(cacheRedis)
        if (shouldPublish) {
          await pubsubRedis.publish("admin:stats:updated", JSON.stringify({ timestamp: new Date().toISOString() }))
          console.log("📡 Admin stats update published via Pub/Sub")
        } else {
          console.log("⏱️ Admin stats Pub/Sub rate limited (too frequent)")
        }
      } else if (pubsubRedis && skipRateLimit) {
        await pubsubRedis.publish("admin:stats:updated", JSON.stringify({ timestamp: new Date().toISOString() }))
        console.log("📡 Admin stats update published via Pub/Sub (forced)")
      }
    }
  } catch (error) {
    console.error("❌ Error refreshing admin stats cache:", error)
  }
}

/**
 * Check if we should publish based on rate limit
 * Returns true if enough time has passed since last publish
 */
async function checkRateLimit(redis: any): Promise<boolean> {
  try {
    const lastPublish = await redis.get(RATE_LIMIT_KEY)
    const now = Date.now()
    
    if (!lastPublish || now - parseInt(lastPublish) >= MIN_PUBLISH_INTERVAL) {
      // Update last publish time
      await redis.set(RATE_LIMIT_KEY, now.toString(), "PX", MIN_PUBLISH_INTERVAL * 2)
      return true
    }
    return false
  } catch (error) {
    console.error("❌ Rate limit check error:", error)
    return true // Allow on error
  }
}

/**
 * Notify SSE subscribers that stats have changed (rate-limited)
 * Lightweight - doesn't recompute, just triggers cache check
 * Rate limited to max 1 publish per 10 seconds (handles high volume)
 */
export async function notifyStatsUpdate(): Promise<void> {
  try {
    const cacheRedis = getClient("cache")
    const pubsubRedis = getClient("pubsub")
    
    if (pubsubRedis && cacheRedis) {
      const shouldPublish = await checkRateLimit(cacheRedis)
      if (shouldPublish) {
        await pubsubRedis.publish("admin:stats:updated", JSON.stringify({ timestamp: new Date().toISOString() }))
        console.log("📡 Admin stats notification sent")
      }
    }
  } catch (error) {
    console.error("❌ Error notifying stats update:", error)
  }
}
