import * as dotenv from "dotenv"
dotenv.config({ path: ".env" })
dotenv.config({ path: ".env.local" })

import Redis, { type RedisOptions } from "ioredis"

const REDIS_URL = process.env.REDIS_URL
const REDIS_ENABLED = process.env.REDIS_ENABLED === "true" || process.env.REDIS_URL != null

if (!REDIS_URL) {
  console.warn("🔶 redis-factory: REDIS_URL not set. init will no-op.")
}

// Unified role-based client pool for ALL use cases (cache, pubsub, BullMQ)
type Role = "cache" | "pubsub" | "admin" | "bull:client" | "bull:events" | "bull:worker" | "bull:dlq"

const CLIENT_ROLES: Role[] = ["cache", "pubsub", "admin", "bull:client", "bull:events", "bull:worker", "bull:dlq"]

const clients: Partial<Record<Role, Redis>> = {}
let initialized = false
let initPromise: Promise<void> | null = null

/**
 * Optimized Redis options to minimize connection overhead
 * - maxRetriesPerRequest: null (required for BullMQ)
 * - enableOfflineQueue: false (prevents memory bloat during outages)
 * - connectTimeout: 15s (reasonable timeout, not too long)
 * - lazyConnect: false (connect immediately, not on first command)
 */
function redisOptions(): RedisOptions {
  return {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 15000,
    lazyConnect: false,
    retryStrategy(times: number) {
      if (times > 10) return null
      return Math.min(times * 1000, 10000)
    },
    reconnectOnError(err: Error) {
      const msg = err?.message || ""
      if (msg.includes("READONLY")) return true
      if (msg.includes("EPIPE") || msg.includes("ECONNRESET") || msg.includes("ETIMEDOUT")) return true
      return false
    },
  }
}

/**
 * initRedisFactory()
 * - Creates 7 shared singleton Redis clients (no duplicates)
 * - Safe to call multiple times (idempotent via initPromise)
 * - MUST be called once at app startup (see middleware or worker init)
 */
export async function initRedisFactory(): Promise<void> {
  if (initialized) return
  if (initPromise) {
    await initPromise
    return
  }

  if (!REDIS_ENABLED || !REDIS_URL) {
    console.warn("🔶 redis-factory: REDIS disabled or REDIS_URL missing — skipping init.")
    return
  }

  initPromise = initRedisFactoryInternal()
  await initPromise
  initPromise = null
}

async function initRedisFactoryInternal(): Promise<void> {
  try {
    console.log("🔄 redis-factory: initializing shared Redis client pool (7 clients, 1 connection)...")

    const opts = redisOptions()

    // Create all 7 role-based clients from single connection string
    for (const role of CLIENT_ROLES) {
      if (!clients[role]) {
        const r = new Redis(REDIS_URL!, opts)
        r.on("connect", () => console.log(`[redis:${role}] connect`))
        r.on("ready", () => console.log(`[redis:${role}] ready`))
        r.on("error", (e) => console.error(`[redis:${role}] error:`, e?.message || e))
        r.on("close", () => console.warn(`[redis:${role}] close`))
        clients[role] = r
      }
    }

    // Wait for primary client ready
    await waitForReady(clients["cache"]!, 15000)

    // Setup pubsub subscription (non-blocking failure)
    try {
      const pubsub = getClient("pubsub")
      if (pubsub) {
        pubsub.subscribe("cache:invalidate").catch((e) => {
          console.warn("[redis:pubsub] subscribe failed (non-fatal):", e?.message || e)
        })
      }
    } catch (e) {
      console.warn("[redis:pubsub] setup skipped:", (e as any)?.message || e)
    }

    initialized = true
    console.log("✅ redis-factory: shared client pool ready (7 roles, consolidated connection)")
  } catch (err: any) {
    console.error("❌ redis-factory init failed:", err?.message || err)
    await shutdownRedisFactory()
    throw err
  }
}

function waitForReady(client: Redis, timeoutMs = 15000) {
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

    const timer = setTimeout(() => {
      if (!done) {
        done = true
        cleanup()
        reject(new Error("Redis ready timeout"))
      }
    }, timeoutMs)

    // ensure timer cleanup
    const origResolve = resolve
    const origReject = reject
    resolve = ((v?: any) => {
      clearTimeout(timer)
      origResolve(v)
    }) as any
    reject = ((e?: any) => {
      clearTimeout(timer)
      origReject(e)
    }) as any
  })
}

/** Get shared client by role */
export function getClient(role: Role): Redis | null {
  return (clients[role] || null) as Redis | null
}

/** Check if factory is initialized */
export function isFactoryInitialized(): boolean {
  return initialized
}

/** Graceful shutdown of all clients */
export async function shutdownRedisFactory(): Promise<void> {
  const roles = Object.keys(clients) as Role[]
  for (const role of roles) {
    const c = clients[role]
    if (!c) continue
    try {
      await c.quit()
    } catch {
      try {
        c.disconnect()
      } catch {}
    }
    delete clients[role]
  }
  initialized = false
  console.log("✅ redis-factory: all clients closed")
}
