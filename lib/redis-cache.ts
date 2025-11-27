import type { Db } from "mongodb"
import { getClient, isFactoryInitialized, shutdownRedisFactory, initRedisFactory } from "./redis-factory"

const REDIS_ENABLED = process.env.REDIS_ENABLED === "true"
const REDIS_URL = process.env.REDIS_URL

// TTLs (seconds)
const TTL = {
  AUTOMATION: 3600,
  USER_STATE: 0,
  CONTACT: 300,
  WORKSPACE: 3600,
}

// Safe Redis GET with JSON parsing
async function safeRedisGet<T>(key: string): Promise<T | null> {
  if (!REDIS_ENABLED || !isFactoryInitialized()) return null

  const client = getClient("cache")
  if (!client) return null

  try {
    const raw = await client.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as any as T
    }
  } catch (err: any) {
    console.warn(`⚠️ redis GET ${key} failed:`, err?.message || err)
    return null
  }
}
export async function warmCache(db: Db): Promise<void> {
  if (!REDIS_ENABLED || !isFactoryInitialized()) {
    console.log("⚠️ skipping cache warm (redis disabled)");
    return;
  }

  console.log("🔥 warming cache...");

  try {
    // Warm automations
    const autoCursor = db.collection("automations").find({ isActive: true }).batchSize(500);
    let autoCount = 0;

    while (await autoCursor.hasNext()) {
      const auto = await autoCursor.next();
      if (!auto) continue;
      const key = `automation:${auto.workspaceId}:${auto.type}:${auto.selectedPost ?? "all"}`;
      await safeRedisSet(key, auto, TTL.AUTOMATION);
      autoCount++;
    }

    console.log(`✅ warmed ${autoCount} automations`);

    // Warm accounts
    const accCursor = db.collection("instagram_accounts").find({}).batchSize(500);
    let accCount = 0;

    while (await accCursor.hasNext()) {
      const acc = await accCursor.next();
      if (!acc) continue;

      const normalized = {
        instagramUserId: acc.instagramUserId,
        instagramProfessionalId: acc.instagramProfessionalId,
        accessToken: acc.accessToken,
        workspaceId: acc.workspaceId,
        username: acc.username
      };

      if (acc.instagramUserId)
        await safeRedisSet(`workspace:${acc.instagramUserId}`, normalized, TTL.WORKSPACE);

      if (acc.instagramProfessionalId)
        await safeRedisSet(`workspace:${acc.instagramProfessionalId}`, normalized, TTL.WORKSPACE);

      accCount++;
    }

    console.log(`✅ warmed ${accCount} workspace accounts`);
  } catch (err: any) {
    console.warn("⚠️ warmCache error:", err?.message || err);
  }
}

// Safe Redis SET with TTL
async function safeRedisSet(key: string, value: any, ttlSec: number): Promise<void> {
  if (!REDIS_ENABLED || !isFactoryInitialized()) return

  const client = getClient("cache")
  if (!client) return

  try {
    const payload = JSON.stringify(value)
    await client.set(key, payload, "EX", ttlSec)
  } catch (err: any) {
    console.warn(`⚠️ redis SET ${key} failed:`, err?.message || err)
  }
}

// Safe Redis DEL
async function safeRedisDel(key: string): Promise<void> {
  if (!REDIS_ENABLED || !isFactoryInitialized()) return

  const client = getClient("cache")
  if (!client) return

  try {
    await client.del(key)
  } catch (err: any) {
    console.warn(`⚠️ redis DEL ${key} failed:`, err?.message || err)
  }
}

// SCAN-based key listing (non-blocking)
async function scanKeys(pattern: string): Promise<string[]> {
  if (!REDIS_ENABLED || !isFactoryInitialized()) return []

  const client = getClient("cache")
  if (!client) return []

  const found: string[] = []
  let cursor = "0"

  try {
    do {
      const res = await client.scan(cursor, "MATCH", pattern, "COUNT", "1000")
      cursor = res[0]
      const keys = res[1] as string[]
      if (keys?.length) found.push(...keys)
    } while (cursor !== "0")
  } catch (err: any) {
    console.warn("⚠️ scanKeys failed:", err?.message || err)
  }

  return found
}

// Publish cache invalidation event
async function publishCacheInvalidation(pattern: string): Promise<void> {
  if (!REDIS_ENABLED || !isFactoryInitialized()) return

  const pubsub = getClient("pubsub")
  if (!pubsub) return

  try {
    await pubsub.publish("cache:invalidate", pattern)
  } catch (err: any) {
    console.warn("⚠️ publish cache:invalidate failed:", err?.message || err)
  }
}

// ========== PUBLIC API ==========

export async function getAutomation(workspaceId: string, type: string, postId: string | null, db: Db): Promise<any[]> {
  const cacheKey = `automation:${workspaceId}:${type}:${postId ?? "all"}`
  const cached = await safeRedisGet<any[]>(cacheKey)
  if (cached) return cached

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
  await safeRedisSet(cacheKey, automations, TTL.AUTOMATION)
  return automations
}

export async function invalidateAutomation(workspaceId: string, type?: string, postId?: string): Promise<void> {
  const pattern = `automation:${workspaceId}:${type ?? "*"}:${postId ?? "*"}`
  const keys = await scanKeys(pattern)

  if (keys.length > 0) {
    const CHUNK = 500
    for (let i = 0; i < keys.length; i += CHUNK) {
      const chunk = keys.slice(i, i + CHUNK)
      try {
        const client = getClient("cache")
        if (client && isFactoryInitialized()) {
          await client.del(...chunk)
        }
      } catch (e: any) {
        console.warn("⚠️ redis chunk delete failed:", e?.message || e)
      }
    }
  }

  await publishCacheInvalidation(pattern)
}

export async function getUserState(senderId: string, accountId: string, db: Db): Promise<any> {
  // NEVER use Redis for user_state (fast-changing)
  return db.collection("user_states").findOne({ senderId, accountId })
}


export async function setUserState(senderId: string, accountId: string, state: any, db: Db): Promise<void> {
  // NEVER write user_state to Redis
  db.collection("user_states")
    .updateOne({ senderId, accountId }, { $set: state }, { upsert: true })
    .catch((e) => console.warn("⚠️ user_states write failed:", e?.message || e))
}


export async function getContact(senderId: string, accountId: string, db: Db): Promise<any> {
  const cacheKey = `contact:${accountId}:${senderId}`
  const cached = await safeRedisGet<any>(cacheKey)
  if (cached) return cached

  const contact = await db.collection("contacts").findOne({ senderId, instagramUserId: accountId })
  if (contact) await safeRedisSet(cacheKey, contact, TTL.CONTACT)
  return contact
}

// export async function getWorkspaceByInstagramId(instagramId: string, db: Db): Promise<any> {
//   const cacheKey = `workspace:${instagramId}`
//   const cached = await safeRedisGet<any>(cacheKey)
//   if (cached) return cached

//   const account = await db.collection("instagram_accounts").findOne({
//     $or: [{ instagramUserId: instagramId }, { instagramProfessionalId: instagramId }],
//   })
//   if (account) {
//     await safeRedisSet(cacheKey, account, TTL.WORKSPACE)
//     return account
//   }

//   const workspace = await db.collection("workspaces").findOne({
//     $or: [
//       { instagramUserId: instagramId },
//       { instagramProfessionalId: instagramId },
//       { "instagramAccount.instagramUserId": instagramId },
//       { "instagramAccount.instagramProfessionalId": instagramId },
//     ],
//   })
//   if (workspace) {
//     const normalized = {
//       instagramUserId: workspace.instagramUserId || workspace.instagramAccount?.instagramUserId,
//       instagramProfessionalId: workspace.instagramProfessionalId || workspace.instagramAccount?.instagramProfessionalId,
//       accessToken: workspace.accessToken || workspace.instagramAccount?.accessToken,
//       workspaceId: workspace._id,
//       username: workspace.name?.replace("@", "") || workspace.username,
//     }
//     await safeRedisSet(cacheKey, normalized, TTL.WORKSPACE)
//     return normalized
//   }

//   return null
// }

export async function getWorkspaceByInstagramId(instagramId: string, db: Db): Promise<any> {
  const cacheKey = `workspace:${instagramId}`;
  const cached = await safeRedisGet<any>(cacheKey);
  if (cached) return cached;

  // 1️⃣ Try instagram_accounts first
  const account = await db.collection("instagram_accounts").findOne({
    $or: [
      { instagramUserId: instagramId },
      { instagramProfessionalId: instagramId }
    ]
  });

  if (account) {
    const normalized = {
      instagramUserId: account.instagramUserId,
      instagramProfessionalId: account.instagramProfessionalId,
      accessToken: account.accessToken,
      workspaceId: account.workspaceId,
      username: account.username
    };

    await safeRedisSet(cacheKey, normalized, TTL.WORKSPACE);
    return normalized;
  }

  // 2️⃣ Try workspace lookup
  const workspace = await db.collection("workspaces").findOne({
    $or: [
      { instagramUserId: instagramId },
      { instagramProfessionalId: instagramId },
      { "instagramAccount.instagramUserId": instagramId },
      { "instagramAccount.instagramProfessionalId": instagramId }
    ]
  });

  if (workspace) {
    const normalized = {
      instagramUserId: workspace.instagramUserId || workspace.instagramAccount?.instagramUserId,
      instagramProfessionalId: workspace.instagramProfessionalId || workspace.instagramAccount?.instagramProfessionalId,
      accessToken: workspace.accessToken || workspace.instagramAccount?.accessToken,
      workspaceId: workspace._id,
      username: workspace.name?.replace("@", "") || workspace.username
    };

    await safeRedisSet(cacheKey, normalized, TTL.WORKSPACE);
    return normalized;
  }

  return null;
}



export async function getCacheStats(): Promise<any> {
  if (!REDIS_ENABLED || !isFactoryInitialized()) return { enabled: false }

  const admin = getClient("admin")
  if (!admin) return { enabled: false }

  try {
    const info = await admin.info()
    const dbsize = await admin.dbsize()
    return { enabled: true, connected: true, info, keyCount: dbsize }
  } catch (err: any) {
    return { enabled: true, connected: false, error: err?.message || err }
  }
}

export function isRedisEnabled(): boolean {
  return REDIS_ENABLED && isFactoryInitialized()
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  console.log("⚠️ Note: Redis clients managed by redis-factory.shutdownRedisFactory()")
}

export { initRedisFactory as initRedis }

// Signal handlers for clean shutdown
if (typeof process !== "undefined") {
  const onShutdown = async () => {
    try {
      await shutdownRedisFactory()
    } catch {}
  }
  process.once("SIGINT", onShutdown)
  process.once("SIGTERM", onShutdown)
}
  