// file: lib/redis-cache.ts
/**
 * Redis Cache Layer - PRODUCTION (factory clients)
 *
 * - Factory creates dedicated clients (cache, pubsub, admin)
 * - SCAN-based invalidation (no KEYS)
 * - safeGet/safeSet with JSON (non-throwing)
 * - Graceful shutdown
 * - Singleton init with initPromise to avoid races
 *
 * Exports:
 * - initRedis()
 * - getRedisInstance()
 * - getPubSubInstance()
 * - getAutomation(...)
 * - invalidateAutomation(...)
 * - getUserState(...)
 * - setUserState(...)
 * - getContact(...)
 * - warmCache(...)
 * - getCacheStats(...)
 * - isRedisEnabled()
 */

import Redis, { RedisOptions } from "ioredis"
import type { Db } from "mongodb"

const REDIS_ENABLED = process.env.REDIS_ENABLED === "true"
const REDIS_URL = process.env.REDIS_URL

// TTLs (seconds)
const TTL = {
  AUTOMATION: 3600,
  USER_STATE: 600,
  CONTACT: 300,
  WORKSPACE: 3600,
}

let cacheClient: Redis | null = null
let pubsubClient: Redis | null = null
let adminClient: Redis | null = null
let isConnected = false
let initPromise: Promise<void> | null = null

export function getRedisInstance(): Redis | null {
  return cacheClient
}
export function getPubSubInstance(): Redis | null {
  return pubsubClient
}

function normalizeRedisUrl(): string | null {
  if (!REDIS_URL) return null
  return REDIS_URL
}

// createClientFactory - returns function(type) -> Redis client
function createClientFactory() {
  const url = normalizeRedisUrl()
  if (!url) throw new Error("REDIS_URL is not set")

  const common: RedisOptions = {
    maxRetriesPerRequest: null,
    connectTimeout: 20000,
    lazyConnect: false,
    retryStrategy(times: number) {
      if (times > 10) return null
      return Math.min(times * 1000, 10000)
    },
    reconnectOnError(err: Error) {
      const msg = err?.message || ""
      if (msg.includes("READONLY You can't write against a read only replica.")) return true
      if (msg.includes("EPIPE") || msg.includes("ECONNRESET") || msg.includes("ETIMEDOUT")) return true
      return false
    },
  }

  return (role: "cache" | "pubsub" | "admin") => {
    const client = new Redis(url, common)

    client.on("error", (err) => {
      console.error(`[redis:${role}] error:`, err?.message || err)
      // do NOT set isConnected=false here — only on 'close' we mark disconnected
    })

    client.on("connect", () => {
      // lightweight connect log
      console.log(`[redis:${role}] connect`)
    })

    client.on("ready", () => {
      console.log(`[redis:${role}] ready`)
    })

    client.on("close", () => {
      console.warn(`[redis:${role}] connection closed`)
    })

    return client
  }
}

// initRedis - singleton
export async function initRedis(): Promise<void> {
  if (initPromise) {
    await initPromise
    return
  }

  if (!REDIS_ENABLED) {
    console.log("⚠️ Redis disabled (REDIS_ENABLED!=true)")
    return
  }

  if (!REDIS_URL) {
    console.error("❌ REDIS_URL missing - skipping Redis init")
    return
  }

  initPromise = initRedisInternal()
  await initPromise
  initPromise = null
}

async function initRedisInternal(): Promise<void> {
  try {
    console.log("🔄 Initializing Redis clients...")

    const createClient = createClientFactory()

    // create three dedicated clients
    cacheClient = createClient("cache")
    pubsubClient = createClient("pubsub")
    adminClient = createClient("admin")

    // Prefer to wait until cacheClient is ready (others follow)
    await waitForReady(cacheClient, 20000)

    // subscribe pubsub (lazy subscribe)
    if (pubsubClient) {
      // don't block startup on subscribe errors
      pubsubClient.on("message", (channel, message) => {
        try {
          if (channel === "cache:invalidate") {
            console.log("🔄 Cache invalidation message:", message)
          }
        } catch (e) {
          console.warn("⚠️ pubsub message handler error:", e)
        }
      })
      // subscribe asynchronously, do not await too long
      pubsubClient.subscribe("cache:invalidate").catch((err) => {
        console.warn("⚠️ pubsub subscribe failed:", err?.message || err)
      })
    }

    isConnected = true
    console.log("✅ Redis initialized and ready")
  } catch (err: any) {
    console.error("❌ Redis initialization failed:", err?.message || err)
    // cleanup partial clients
    try {
      await shutdownRedisClients()
    } catch (e) {
      /* ignore */
    }
    cacheClient = null
    pubsubClient = null
    adminClient = null
    isConnected = false
  }
}

// wait for ready with timeout
function waitForReady(client: Redis, timeoutMs = 20000) {
  return new Promise<void>((resolve, reject) => {
    let done = false
    const onReady = () => {
      if (done) return
      done = true
      cleanup()
      resolve()
    }
    const onError = (err: any) => {
      if (done) return
      done = true
      cleanup()
      reject(err)
    }
    const cleanup = () => {
      client.removeListener("ready", onReady)
      client.removeListener("error", onError)
    }

    client.once("ready", onReady)
    client.once("error", onError)

    const t = setTimeout(() => {
      if (done) return
      done = true
      cleanup()
      reject(new Error("Redis ready timeout"))
    }, timeoutMs)
    // clear the timer on resolution/rejection
    const origResolve = resolve
    const origReject = reject
    resolve = (v?: any) => {
      clearTimeout(t)
      origResolve(v)
    }
    reject = (e?: any) => {
      clearTimeout(t)
      origReject(e)
    }
  })
}

// shutdown helper
async function shutdownRedisClients() {
  try {
    if (pubsubClient) {
      try {
        await pubsubClient.unsubscribe("cache:invalidate").catch(() => {})
      } catch {}
      try {
        await pubsubClient.quit()
      } catch {
        pubsubClient.disconnect()
      }
      pubsubClient = null
    }

    if (cacheClient) {
      try {
        await cacheClient.quit()
      } catch {
        cacheClient.disconnect()
      }
      cacheClient = null
    }

    if (adminClient) {
      try {
        await adminClient.quit()
      } catch {
        adminClient.disconnect()
      }
      adminClient = null
    }
  } finally {
    isConnected = false
  }
}

// graceful shutdown export
export async function closeRedis(): Promise<void> {
  await shutdownRedisClients()
  console.log("✅ Redis clients closed")
}

// ---------- Safe JSON helpers ----------
async function safeRedisGet<T>(key: string): Promise<T | null> {
  const client = getRedisInstance()
  if (!client || !isConnected) return null
  try {
    const raw = await client.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      // If non-JSON content, return raw as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (raw as any) as T
    }
  } catch (err: any) {
    console.warn(`⚠️ redis GET ${key} failed:`, err?.message || err)
    return null
  }
}

async function safeRedisSet(key: string, value: any, ttlSec: number): Promise<void> {
  const client = getRedisInstance()
  if (!client || !isConnected) return
  try {
    const payload = JSON.stringify(value)
    // ioredis set with EX
    await client.set(key, payload, "EX", ttlSec)
  } catch (err: any) {
    console.warn(`⚠️ redis SET ${key} failed:`, err?.message || err)
  }
}

async function safeRedisDel(key: string): Promise<void> {
  const client = getRedisInstance()
  if (!client || !isConnected) return
  try {
    await client.del(key)
  } catch (err: any) {
    console.warn(`⚠️ redis DEL ${key} failed:`, err?.message || err)
  }
}

// SCAN-based key listing (non-blocking)
async function scanKeys(pattern: string): Promise<string[]> {
  const client = getRedisInstance()
  if (!client || !isConnected) return []
  const found: string[] = []
  let cursor = "0"
  do {
    // scan returns [cursor, keys[]]
    // @ts-ignore - ioredis has scan returning [string, string[]]
    const res = await client.scan(cursor, "MATCH", pattern, "COUNT", "1000")
    cursor = res[0]
    const keys = res[1] as string[]
    if (keys && keys.length) found.push(...keys)
  } while (cursor !== "0")
  return found
}

// ---------- Public API (matching your previous usage) ----------

// getAutomation: cache-first loader
export async function getAutomation(workspaceId: string, type: string, postId: string | null, db: Db): Promise<any[]> {
  const cacheKey = `automation:${workspaceId}:${type}:${postId ?? "all"}`
  const cached = await safeRedisGet<any[]>(cacheKey)
  if (cached) return cached

  // Build query
  const q: any = { workspaceId, isActive: true }
  if (type === "story_reply_flow") {
    q.type = "story_reply_flow"
    if (postId) q.selectedStory = postId
  } else if (type === "comment_reply_flow") {
    q.type = { $in: ["comment_to_dm_flow", "comment_reply_flow"] }
    if (postId) q.selectedPost = postId
  } else if (type === "dm_automation") {
    q.type = { $in: ["dm_automation", "generic_dm_automation"] }
  } else {
    q.type = type
  }

  const automations = await db.collection("automations").find(q).toArray()
  // cache result (even empty)
  await safeRedisSet(cacheKey, automations, TTL.AUTOMATION)
  return automations
}

export async function invalidateAutomation(workspaceId: string, type?: string, postId?: string): Promise<void> {
  const pattern = `automation:${workspaceId}:${type ?? "*"}:${postId ?? "*"}`
  const client = getRedisInstance()
  if (!client || !isConnected) return

  try {
    const keys = await scanKeys(pattern)
    if (keys.length > 0) {
      // chunk deletes to avoid very large single DEL
      const CHUNK = 500
      for (let i = 0; i < keys.length; i += CHUNK) {
        const chunk = keys.slice(i, i + CHUNK)
        await client.del(...chunk)
      }
    }
    // notify other workers
    if (pubsubClient) {
      await pubsubClient.publish("cache:invalidate", pattern).catch((e) => {
        console.warn("⚠️ publish cache:invalidate failed:", e?.message || e)
      })
    }
  } catch (err: any) {
    console.warn("⚠️ invalidateAutomation failed:", err?.message || err)
  }
}

// user state caching
export async function getUserState(senderId: string, accountId: string, db: Db): Promise<any> {
  const cacheKey = `user_state:${accountId}:${senderId}`
  const cached = await safeRedisGet<any>(cacheKey)
  if (cached) return cached

  const state = await db.collection("user_states").findOne({ senderId, accountId })
  if (state) await safeRedisSet(cacheKey, state, TTL.USER_STATE)
  return state
}

export async function setUserState(senderId: string, accountId: string, state: any, db: Db): Promise<void> {
  const cacheKey = `user_state:${accountId}:${senderId}`
  await safeRedisSet(cacheKey, state, TTL.USER_STATE)
  // persist to Mongo in background
  db.collection("user_states").updateOne({ senderId, accountId }, { $set: state }, { upsert: true }).catch((e) => {
    console.warn("⚠️ user_states write failed:", e?.message || e)
  })
}

// contact caching
export async function getContact(senderId: string, accountId: string, db: Db): Promise<any> {
  const cacheKey = `contact:${accountId}:${senderId}`
  const cached = await safeRedisGet<any>(cacheKey)
  if (cached) return cached

  const contact = await db.collection("contacts").findOne({ senderId, instagramUserId: accountId })
  if (contact) await safeRedisSet(cacheKey, contact, TTL.CONTACT)
  return contact
}

// workspace/account caching
export async function getWorkspaceByInstagramId(instagramId: string, db: Db): Promise<any> {
  const cacheKey = `workspace:${instagramId}`
  const cached = await safeRedisGet<any>(cacheKey)
  if (cached) return cached

  const account = await db.collection("instagram_accounts").findOne({
    $or: [{ instagramUserId: instagramId }, { instagramProfessionalId: instagramId }],
  })
  if (account) {
    await safeRedisSet(cacheKey, account, TTL.WORKSPACE)
    return account
  }

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
      instagramProfessionalId:
        workspace.instagramProfessionalId || workspace.instagramAccount?.instagramProfessionalId,
      accessToken: workspace.accessToken || workspace.instagramAccount?.accessToken,
      workspaceId: workspace._id,
      username: workspace.name?.replace("@", "") || workspace.username,
    }
    await safeRedisSet(cacheKey, normalized, TTL.WORKSPACE)
    return normalized
  }

  return null
}

// warm cache (safe, indexed queries recommended)
export async function warmCache(db: Db): Promise<void> {
  if (!cacheClient || !isConnected) {
    console.log("⚠️ skipping cache warm (redis disabled)")
    return
  }
  console.log("🔥 warming cache... (this may be IO-heavy)")

  try {
    // load active automations in batches (avoid large memory spikes)
    const cursor = db.collection("automations").find({ isActive: true }).batchSize(500)
    let warmed = 0
    while (await cursor.hasNext()) {
      const auto = await cursor.next()
      if (!auto) continue
      const key = `automation:${auto.workspaceId}:${auto.type}:${auto.selectedPost ?? "all"}`
      await safeRedisSet(key, auto, TTL.AUTOMATION)
      warmed++
    }
    console.log(`✅ warmed ${warmed} automations`)

    // warm workspaces/accounts (indexed query)
    const accCursor = db.collection("instagram_accounts").find({}).batchSize(500)
    let warmedAcc = 0
    while (await accCursor.hasNext()) {
      const acc = await accCursor.next()
      if (!acc) continue
      if (acc.instagramUserId) await safeRedisSet(`workspace:${acc.instagramUserId}`, acc, TTL.WORKSPACE)
      if (acc.instagramProfessionalId)
        await safeRedisSet(`workspace:${acc.instagramProfessionalId}`, acc, TTL.WORKSPACE)
      warmedAcc++
    }
    console.log(`✅ warmed ${warmedAcc} workspaces`)
  } catch (err: any) {
    console.warn("⚠️ warmCache error:", err?.message || err)
  }
}

// monitoring
export async function getCacheStats(): Promise<any> {
  if (!adminClient || !isConnected) return { enabled: false }
  try {
    const info = await adminClient.info()
    const dbsize = await adminClient.dbsize()
    return { enabled: true, connected: isConnected, info, keyCount: dbsize }
  } catch (err: any) {
    return { enabled: true, connected: false, error: err?.message || err }
  }
}

export function isRedisEnabled(): boolean {
  return REDIS_ENABLED && isConnected
}

// ensure graceful shutdown when process ends (but do not force exit)
if (typeof process !== "undefined") {
  const onShutdown = async () => {
    try {
      await closeRedis()
    } catch {}
  }
  process.once("SIGINT", onShutdown)
  process.once("SIGTERM", onShutdown)
}
