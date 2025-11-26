// lib/webhook-queue.ts
import { Queue, Worker, QueueEvents, Job } from "bullmq"
import Redis, { RedisOptions } from "ioredis"

const BULLMQ_ENABLED = process.env.BULLMQ_ENABLED === "true"
const REDIS_URL = process.env.REDIS_URL

export const PRIORITY = {
  DM: 1,
  STORY_REPLY: 2,
  COMMENT: 3,
  RETRY: 20,
} as const

const DEFAULT_CONCURRENCY = Number(process.env.WEBHOOK_WORKER_CONCURRENCY || "10")
const DEFAULT_LIMITER_MAX = Number(process.env.WEBHOOK_LIMITER_MAX || "500")
const DEFAULT_LIMITER_DURATION = Number(process.env.WEBHOOK_LIMITER_DURATION || "1000")

let webhookQueue: Queue | null = null
let deadLetterQueue: Queue | null = null
let queueEvents: QueueEvents | null = null
let initPromise: Promise<void> | null = null
let ready = false
let adminRedis: Redis | null = null

function normalizeRedisUrl() {
  if (!REDIS_URL) return null
  return REDIS_URL
}

function createRedisClient(name: string) {
  const url = normalizeRedisUrl()
  if (!url) throw new Error("REDIS_URL not set")
  const opts: RedisOptions = {
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
  const r = new Redis(url, opts)
  r.on("error", (e) => console.error(`[BullMQ:${name}] Redis error: ${e.message}`))
  r.on("connect", () => console.log(`[BullMQ:${name}] Redis connected`))
  return r
}

export async function initQueue() {
  if (initPromise) {
    await initPromise
    return
  }

  if (!BULLMQ_ENABLED) {
    console.log("⚠️ BullMQ disabled (BULLMQ_ENABLED!=true). Using direct processing fallback.")
    ready = false
    return
  }

  if (!REDIS_URL) {
    console.error("❌ REDIS_URL missing - BullMQ disabled")
    ready = false
    return
  }

  initPromise = initQueueInternal()
  await initPromise
  initPromise = null
}

async function initQueueInternal() {
  try {
    console.log("🔄 Initializing BullMQ (TS-compatible)...")

    adminRedis = createRedisClient("admin")

    // Create dedicated clients for each role (avoids createClient typing issues)
    const clientConn = createRedisClient("client")
    const eventsConn = createRedisClient("events")
    const workerConn = createRedisClient("worker")
    const dlqConn = createRedisClient("dlq")

    // NOTE: we cast defaultJobOptions to any to avoid version-specific TS complaints (timeout vs jobTimeout)
    webhookQueue = new Queue("webhooks", {
      connection: clientConn,
      defaultJobOptions: ( {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        // keep the timeout you wanted; some BullMQ versions call this "timeout" and some "jobTimeout"
        timeout: 90000,
        removeOnComplete: { age: 3600, count: 1000 },
        removeOnFail: false,
      } as any ),
    })

    deadLetterQueue = new Queue("webhooks-dead", {
      connection: dlqConn,
      defaultJobOptions: { removeOnComplete: { age: 86400 * 7 } },
    })

    queueEvents = new QueueEvents("webhooks", { connection: eventsConn })

    queueEvents.on("failed", async ({ jobId, failedReason }) => {
      console.error(`❌ QueueEvent failed - job ${jobId}: ${failedReason}`)
    })
    queueEvents.on("stalled", ({ jobId }) => console.warn(`⚠️ Job stalled: ${jobId}`))
    queueEvents.on("error", (err) => console.error("❌ QueueEvents error:", err.message || err))

    await webhookQueue.waitUntilReady()
    await deadLetterQueue.waitUntilReady()

    ready = true
    console.log("✅ BullMQ ready (TS-compatible, dedicated connections)")
    setupGracefulShutdown()
  } catch (err: any) {
    console.error("❌ BullMQ initialization failed:", err?.message || err)
    webhookQueue = null
    deadLetterQueue = null
    queueEvents = null
    ready = false
  }
}

export async function enqueueWebhook(
  data: any,
  priority: number = PRIORITY.DM,
  processWebhookFn?: (data: any) => Promise<void>,
): Promise<boolean> {
  if (!BULLMQ_ENABLED || !webhookQueue || !ready) {
    if (processWebhookFn) {
      try {
        await processWebhookFn(data)
        return true
      } catch (err: any) {
        console.error("❌ Direct fallback processing failed:", err.message || err)
        return false
      }
    }
    return false
  }

  try {
    const webhookType = determineWebhookType(data)
    const jobPriority = typeof priority === "number" ? priority : getPriorityForType(webhookType)

    await webhookQueue.add("process", { data, type: webhookType }, { priority: jobPriority, jobId: generateJobId(data) })
    return true
  } catch (err: any) {
    console.error("⚠️ enqueueWebhook failed:", err.message || err)
    if (processWebhookFn) {
      try {
        await processWebhookFn(data)
        return true
      } catch (e: any) {
        console.error("❌ Fallback direct processing failed:", e.message || e)
        return false
      }
    }
    return false
  }
}

export function createWorker(processWebhookFn: (data: any) => Promise<void>, concurrency = DEFAULT_CONCURRENCY) {
  if (!BULLMQ_ENABLED || !webhookQueue) {
    console.log("⚠️ Worker not created (BullMQ disabled or not initialized)")
    return null
  }

  const workerConnection = createRedisClient("worker-client")

  const worker = new Worker(
    "webhooks",
    async (job: Job) => {
      try {
        await processWebhookFn(job.data.data)
      } catch (err: any) {
        try {
          const attemptsMade = job.attemptsMade ?? 0
          const maxAttempts = (job.opts?.attempts as number) ?? 3
          if (attemptsMade >= maxAttempts) {
            await deadLetterQueue?.add("failed", {
              original: job.data,
              attempts: attemptsMade,
              failedAt: new Date(),
              error: err?.message || String(err),
            })
            console.error(`🛑 Job ${job.id} moved to DLQ after ${attemptsMade} attempts`)
          }
        } catch (dlqErr: any) {
          console.error("❌ Error adding job to DLQ:", dlqErr?.message || dlqErr)
        }
        throw err
      }
    },
    {
      connection: workerConnection,
      concurrency,
      limiter: { max: DEFAULT_LIMITER_MAX, duration: DEFAULT_LIMITER_DURATION },
    },
  )

  worker.on("failed", (job, err) => {
    if (job) {
      console.error(`❌ Worker: job ${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts}): ${err?.message || err}`)
    } else {
      console.error("❌ Worker failed with no job:", err)
    }
  })
  worker.on("error", (err) => console.error("❌ Worker encountered error:", err?.message || err))

  console.log(`✅ Worker started (concurrency=${concurrency})`)
  return worker
}

function determineWebhookType(data: any): string {
  if (!data) return "unknown"
  if (data.entry?.[0]?.messaging) {
    const message = data.entry[0].messaging[0]?.message
    if (message?.reply_to?.story) return "story_reply"
    return "dm"
  }
  if (data.entry?.[0]?.changes?.[0]?.field === "comments") return "comment"
  return "unknown"
}

function getPriorityForType(type: string): number {
  switch (type) {
    case "story_reply":
      return PRIORITY.STORY_REPLY
    case "comment":
      return PRIORITY.COMMENT
    case "dm":
    default:
      return PRIORITY.DM
  }
}

function generateJobId(data: any): string {
  try {
    const entry = data.entry?.[0]
    if (!entry) return `job-${Date.now()}-${Math.random()}`
    const id = entry.id
    const time = entry.time
    const messaging = entry.messaging?.[0]
    const messageId = messaging?.message?.mid
    return `${id}-${time}-${messageId || Math.random()}`.substring(0, 100)
  } catch {
    return `job-${Date.now()}-${Math.random()}`
  }
}

export async function getQueueStats() {
  if (!BULLMQ_ENABLED || !webhookQueue) {
    return { enabled: false }
  }

  try {
    const [
      waiting,
      active,
      completed,
      failed,
      delayed,
      isPaused,
      repeatable,
      sampleJobs,
    ] = await Promise.all([
      webhookQueue.getWaitingCount(),
      webhookQueue.getActiveCount(),
      webhookQueue.getCompletedCount(),
      webhookQueue.getFailedCount(),
      webhookQueue.getDelayedCount(),
      webhookQueue.isPaused(),
      webhookQueue.getRepeatableJobs(),
      webhookQueue.getJobs(["waiting", "active", "delayed"], 0, 20),
    ])

    return {
      enabled: true,
      ready,

      // HIGH-LEVEL queue health
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused: isPaused,
      deadLetter: deadLetterQueue
        ? await deadLetterQueue.getWaitingCount()
        : 0,

      // Repeatable jobs
      repeatableJobsCount: repeatable.length,

      // Job samples (first 20)
      jobs: sampleJobs.map((job: Job<any>) => ({
        id: job.id,
        name: job.name,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        returnValue: job.returnvalue,
        failedReason: job.failedReason,
      })),
    }
  } catch (err: any) {
    return {
      enabled: true,
      ready: false,
      error: err?.message || err,
    }
  }
}


export function isQueueEnabled() {
  return BULLMQ_ENABLED && ready
}

export async function closeQueue() {
  try {
    if (queueEvents) {
      await queueEvents.close().catch((e) => console.warn("⚠️ queueEvents close error:", e?.message || e))
      queueEvents = null
    }
    if (webhookQueue) {
      await webhookQueue.close().catch((e) => console.warn("⚠️ webhookQueue close error:", e?.message || e))
      webhookQueue = null
    }
    if (deadLetterQueue) {
      await deadLetterQueue.close().catch((e) => console.warn("⚠️ deadLetterQueue close error:", e?.message || e))
      deadLetterQueue = null
    }
    if (adminRedis) {
      await adminRedis.quit().catch(() => adminRedis?.disconnect())
      adminRedis = null
    }
    ready = false
    console.log("✅ BullMQ closed gracefully")
  } catch (err) {
    console.error("❌ Error during closeQueue:", (err as any)?.message || err)
  }
}

function setupGracefulShutdown() {
  const onSignal = async (signal: string) => {
    console.log(`🔻 Received ${signal}, closing BullMQ...`)
    try {
      const timeout = setTimeout(() => {
        console.warn("⚠️ Graceful shutdown timed out, exiting process")
        process.exit(1)
      }, 30000)
      await closeQueue()
      clearTimeout(timeout)
      console.log("🔻 Graceful shutdown complete")
    } catch (err) {
      console.error("❌ Error during graceful shutdown:", (err as any)?.message || err)
      process.exit(1)
    }
  }
  process.once("SIGINT", () => onSignal("SIGINT"))
  process.once("SIGTERM", () => onSignal("SIGTERM"))
}
