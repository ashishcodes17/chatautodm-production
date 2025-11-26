/**
 * Redis Cache Layer - PRODUCTION SAFE
 *
 * Features:
 * - Automatic fallback to MongoDB if Redis fails
 * - Cache warming on startup
 * - TTL-based invalidation
 * - Pub/Sub for cross-worker cache invalidation
 *
 * Environment Variables:
 * - REDIS_ENABLED=true (enable Redis caching)
 * - REDIS_URL=redis://default:password@host:port
 */

import Redis from "ioredis"
import type { Db } from "mongodb"

const REDIS_ENABLED = process.env.REDIS_ENABLED === "true"
const REDIS_URL = process.env.REDIS_URL

// TTL Configuration (seconds)
const TTL = {
  AUTOMATION: 3600, // 1 hour (rarely changes)
  USER_STATE: 600, // 10 minutes (active conversations)
  CONTACT: 300, // 5 minutes (can change frequently)
  WORKSPACE: 3600, // 1 hour (rarely changes)
}

let redis: Redis | null = null
let pubsub: Redis | null = null
let isConnected = false

// Initialize Redis connection
export async function initRedis() {
  if (!REDIS_ENABLED) {
    console.log("⚠️  Redis disabled (set REDIS_ENABLED=true to enable)")
    return
  }

  if (!REDIS_URL) {
    console.error("❌ REDIS_URL environment variable is not set")
    console.log("⚠️  Falling back to MongoDB only")
    return
  }

  try {
    console.log("🔄 Connecting to Redis...")

    const url = new URL(REDIS_URL)
    const hostname = url.hostname
    const port = Number.parseInt(url.port || "6379")
    const password = url.password || ""
    const username = url.username || "default"

    const redisOptions: any = {
      host: hostname,
      port: port,
      username: username !== "" ? username : undefined,
      password: password !== "" ? password : undefined,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times: number) {
        if (times > 5) {
          console.error("❌ Redis connection failed after 5 retries - falling back to MongoDB")
          return null
        }
        const delay = Math.min(times * 500, 3000)
        console.log(`🔄 Redis retry ${times} in ${delay}ms...`)
        return delay
      },
      connectTimeout: 15000,
      commandTimeout: 10000,
      lazyConnect: false,
      reconnectOnError: () => true,
    }

    redis = new Redis(redisOptions)

    // Separate connection for pub/sub
    pubsub = redis.duplicate()

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Redis connection timeout (15s)"))
      }, 15000)

      redis!.on("ready", () => {
        clearTimeout(timeout)
        console.log("✅ Redis connected and ready")
        isConnected = true
        resolve()
      })

      redis!.on("error", (err) => {
        clearTimeout(timeout)
        console.error("❌ Redis connection error:", err.message)
        reject(err)
      })
    })

    // Listen for cache invalidation events
    pubsub.subscribe("cache:invalidate", (err) => {
      if (err) console.error("❌ Pub/Sub subscribe error:", err.message)
    })

    pubsub.on("message", (channel, message) => {
      if (channel === "cache:invalidate") {
        console.log(`🔄 Cache invalidation: ${message}`)
      }
    })

    // Handle connection errors gracefully
    redis.on("error", (err) => {
      console.error("❌ Redis error:", err.message)
      isConnected = false
    })

    redis.on("connect", () => {
      isConnected = true
      console.log("✅ Redis reconnected")
    })

    redis.on("close", () => {
      isConnected = false
      console.warn("⚠️  Redis connection closed")
    })
  } catch (error: any) {
    console.error("❌ Redis initialization failed:", error.message)
    console.log("⚠️  Falling back to MongoDB only")
    redis = null
    pubsub = null
    isConnected = false
  }
}

// Safe wrapper for Redis operations
async function safeRedisGet<T>(key: string): Promise<T | null> {
  if (!redis || !isConnected) return null

  try {
    const data = await redis.get(key)
    if (!data) return null
    return JSON.parse(data) as T
  } catch (error: any) {
    console.error(`⚠️  Redis GET error for ${key}:`, error.message)
    return null
  }
}

async function safeRedisSet(key: string, value: any, ttl: number): Promise<void> {
  if (!redis || !isConnected) return

  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (error: any) {
    console.error(`⚠️  Redis SET error for ${key}:`, error.message)
  }
}

async function safeRedisDel(key: string): Promise<void> {
  if (!redis || !isConnected) return

  try {
    await redis.del(key)
  } catch (error: any) {
    console.error(`⚠️  Redis DEL error for ${key}:`, error.message)
  }
}

// ============================================
// AUTOMATION CACHING
// ============================================

export async function getAutomation(workspaceId: string, type: string, postId: string | null, db: Db): Promise<any[]> {
  const cacheKey = `automation:${workspaceId}:${type}:${postId || "all"}`

  // Try cache first
  const cached = await safeRedisGet<any[]>(cacheKey)
  if (cached) {
    return cached
  }

  // Cache miss - load from MongoDB
  const query: any = {
    workspaceId,
    isActive: true,
  }

  // Handle different automation types
  if (type === "story_reply_flow") {
    query.type = "story_reply_flow"
    if (postId) {
      query.selectedStory = postId
    }
  } else if (type === "comment_reply_flow") {
    query.type = { $in: ["comment_to_dm_flow", "comment_reply_flow"] }
    if (postId) {
      query.selectedPost = postId
    }
  } else if (type === "dm_automation") {
    query.type = { $in: ["dm_automation", "generic_dm_automation"] }
  } else {
    query.type = type
  }

  const automations = await db.collection("automations").find(query).toArray()

  // Cache the result (even empty array, to prevent repeated queries)
  await safeRedisSet(cacheKey, automations, TTL.AUTOMATION)

  return automations
}

export async function invalidateAutomation(workspaceId: string, type?: string, postId?: string): Promise<void> {
  const pattern = `automation:${workspaceId}:${type || "*"}:${postId || "*"}`

  if (!redis || !isConnected) return

  try {
    // Delete matching keys
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }

    // Notify other workers
    if (pubsub) {
      await pubsub.publish("cache:invalidate", pattern)
    }
  } catch (error: any) {
    console.error("⚠️  Cache invalidation error:", error.message)
  }
}

// ============================================
// USER STATE CACHING
// ============================================

export async function getUserState(senderId: string, accountId: string, db: Db): Promise<any> {
  const cacheKey = `user_state:${accountId}:${senderId}`

  // Try cache first
  const cached = await safeRedisGet(cacheKey)
  if (cached) {
    return cached
  }

  // Cache miss - load from MongoDB
  const state = await db.collection("user_states").findOne({
    senderId,
    accountId,
  })

  if (state) {
    await safeRedisSet(cacheKey, state, TTL.USER_STATE)
  }

  return state
}

export async function setUserState(senderId: string, accountId: string, state: any, db: Db): Promise<void> {
  const cacheKey = `user_state:${accountId}:${senderId}`

  // Write to Redis immediately (fast)
  await safeRedisSet(cacheKey, state, TTL.USER_STATE)

  // Write to MongoDB (source of truth) - don't await, do in background
  db.collection("user_states")
    .updateOne({ senderId, accountId }, { $set: state }, { upsert: true })
    .catch((err) => {
      console.error("⚠️  MongoDB user_state write error:", err.message)
    })
}

// ============================================
// CONTACT CACHING
// ============================================

export async function getContact(senderId: string, accountId: string, db: Db): Promise<any> {
  const cacheKey = `contact:${accountId}:${senderId}`

  const cached = await safeRedisGet(cacheKey)
  if (cached) {
    return cached
  }

  const contact = await db.collection("contacts").findOne({
    senderId,
    instagramUserId: accountId,
  })

  if (contact) {
    await safeRedisSet(cacheKey, contact, TTL.CONTACT)
  }

  return contact
}

// ============================================
// WORKSPACE/ACCOUNT CACHING
// ============================================

export async function getWorkspaceByInstagramId(instagramId: string, db: Db): Promise<any> {
  const cacheKey = `workspace:${instagramId}`

  const cached = await safeRedisGet(cacheKey)
  if (cached) {
    return cached
  }

  // Try account lookup
  const account = await db.collection("instagram_accounts").findOne({
    $or: [{ instagramUserId: instagramId }, { instagramProfessionalId: instagramId }],
  })

  if (account) {
    await safeRedisSet(cacheKey, account, TTL.WORKSPACE)
    return account
  }

  // Try workspace lookup
  const workspace = await db.collection("workspaces").findOne({
    $or: [
      { instagramUserId: instagramId },
      { instagramProfessionalId: instagramId },
      { "instagramAccount.instagramUserId": instagramId },
      { "instagramAccount.instagramProfessionalId": instagramId },
    ],
  })

  if (workspace) {
    const normalized = {
      instagramUserId: workspace.instagramUserId || workspace.instagramAccount?.instagramUserId,
      instagramProfessionalId: workspace.instagramProfessionalId || workspace.instagramAccount?.instagramProfessionalId,
      accessToken: workspace.accessToken || workspace.instagramAccount?.accessToken,
      workspaceId: workspace._id,
      username: workspace.name?.replace("@", "") || workspace.username,
    }
    await safeRedisSet(cacheKey, normalized, TTL.WORKSPACE)
    return normalized
  }

  return null
}

// ============================================
// CACHE WARMING (ON STARTUP)
// ============================================

export async function warmCache(db: Db): Promise<void> {
  if (!redis || !isConnected) {
    console.log("⚠️  Skipping cache warming (Redis disabled)")
    return
  }

  console.log("🔥 Warming cache...")

  try {
    // Preload all active automations
    const automations = await db.collection("automations").find({ status: "active" }).toArray()

    for (const auto of automations) {
      const cacheKey = `automation:${auto.workspaceId}:${auto.type}:${auto.config?.postId || "none"}`
      await safeRedisSet(cacheKey, auto, TTL.AUTOMATION)
    }

    console.log(`✅ Warmed ${automations.length} automations`)

    // Preload workspaces
    const accounts = await db.collection("instagram_accounts").find({}).toArray()
    for (const acc of accounts) {
      if (acc.instagramUserId) {
        await safeRedisSet(`workspace:${acc.instagramUserId}`, acc, TTL.WORKSPACE)
      }
      if (acc.instagramProfessionalId) {
        await safeRedisSet(`workspace:${acc.instagramProfessionalId}`, acc, TTL.WORKSPACE)
      }
    }

    console.log(`✅ Warmed ${accounts.length} workspaces`)
    console.log("✅ Cache warming complete\n")
  } catch (error: any) {
    console.error("❌ Cache warming error:", error.message)
  }
}

// ============================================
// MONITORING
// ============================================

export async function getCacheStats(): Promise<any> {
  if (!redis || !isConnected) {
    return { enabled: false }
  }

  try {
    const info = await redis.info("stats")
    const memory = await redis.info("memory")

    return {
      enabled: true,
      connected: isConnected,
      keyspace: await redis.dbsize(),
      stats: info,
      memory: memory,
    }
  } catch (error: any) {
    return { enabled: true, connected: false, error: error.message }
  }
}

export function isRedisEnabled(): boolean {
  return REDIS_ENABLED && isConnected
}
