// lib/webhook-queue.ts
import { Queue, Worker, QueueEvents, type Job } from "bullmq"
import type RedisType from "ioredis"

import { initRedisFactory, getClient, isFactoryInitialized } from "./redis-factory"

const BULLMQ_ENABLED = process.env.BULLMQ_ENABLED === "true"

export const PRIORITY = {
  DM: 1,
  STORY_REPLY: 2,
  COMMENT: 3,
  RETRY: 20,
} as const

// Calculation: 1,000,000 / 3600 = 278 webhooks/sec
// With 30 workers @ 50 concurrency each = 1500 jobs/sec capacity (5x buffer)
const DEFAULT_CONCURRENCY = Number(process.env.WEBHOOK_WORKER_CONCURRENCY || "50")
const DEFAULT_LIMITER_MAX = Number(process.env.WEBHOOK_LIMITER_MAX || "1000")
const DEFAULT_LIMITER_DURATION = Number(process.env.WEBHOOK_LIMITER_DURATION || "1000")

const ENABLE_IDLE_BACKOFF = process.env.WEBHOOK_ENABLE_IDLE_BACKOFF !== "false"
const IDLE_CHECK_INTERVAL = Number(process.env.WEBHOOK_IDLE_CHECK_INTERVAL || "10000")

let webhookQueue: Queue | null = null
let deadLetterQueue: Queue | null = null
let queueEvents: QueueEvents | null = null
let initPromise: Promise<void> | null = null
let ready = false
let currentWorker: any = null
let idleCheckTimer: NodeJS.Timeout | null = null

/**
 * initQueue()
 * - uses shared redis clients from redis-factory
 */
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

  initPromise = initQueueInternal()
  await initPromise
  initPromise = null
}

async function initQueueInternal() {
  try {
    console.log("🔄 Initializing BullMQ with shared Redis clients...")

    // Ensure factory is initialized (idempotent)
    if (!isFactoryInitialized()) {
      await initRedisFactory()
    }

    const clientConn = getClient("bull:client") as unknown as RedisType
    const eventsConn = getClient("bull:events") as unknown as RedisType
    const workerConn = getClient("bull:worker") as unknown as RedisType
    const dlqConn = getClient("bull:dlq") as unknown as RedisType

    if (!clientConn || !eventsConn || !workerConn || !dlqConn) {
      throw new Error("Missing shared Redis clients for BullMQ")
    }

    webhookQueue = new Queue("webhooks", {
      connection: clientConn,
      defaultJobOptions: {
        attempts: Number(process.env.QUEUE_MAX_RETRIES ?? 2), // Reduced from 3 for faster throughput
        backoff: { type: "exponential", delay: 1000 }, // Faster backoff for high throughput
        timeout: 60000, // Reduced from 90s to keep queue fresh (webhooks are typically <5s)
        removeOnComplete: { age: 1800, count: 5000 }, // Aggressive cleanup (30min, 5k jobs)
        removeOnFail: false,
      } as any,
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

    // wait until queue created and ready
    await webhookQueue.waitUntilReady()
    await deadLetterQueue.waitUntilReady()

    ready = true
    console.log(
      `✅ BullMQ ready for 1M webhooks/hr (concurrency=${DEFAULT_CONCURRENCY}, limiter=${DEFAULT_LIMITER_MAX}/${DEFAULT_LIMITER_DURATION}ms)`,
    )
    setupGracefulShutdown()
  } catch (err: any) {
    console.error("❌ BullMQ initialization failed:", err?.message || err)
    webhookQueue = null
    deadLetterQueue = null
    queueEvents = null
    ready = false
    throw err
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

    await webhookQueue.add(
      "process",
      { data, type: webhookType },
      { priority: jobPriority, jobId: generateJobId(data) },
    )
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

  const workerConnection = getClient("bull:worker") as unknown as RedisType
  if (!workerConnection) {
    console.error("❌ Worker connection missing - aborting worker creation")
    return null
  }

  const worker = new Worker(
    "webhooks",
    async (job: Job) => {
      try {
        await processWebhookFn(job.data.data)
      } catch (err: any) {
        try {
          const attemptsMade = job.attemptsMade ?? 0
          const maxAttempts = (job.opts?.attempts as number) ?? 2
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
      console.error(
        `❌ Worker: job ${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts}): ${err?.message || err}`,
      )
    } else {
      console.error("❌ Worker failed with no job:", err)
    }
  })
  worker.on("error", (err) => console.error("❌ Worker encountered error:", err?.message || err))

  if (ENABLE_IDLE_BACKOFF) {
    setupIdleBackoff(worker)
  }

  currentWorker = worker
  console.log(`✅ Worker started (concurrency=${concurrency}, idle-backoff=${ENABLE_IDLE_BACKOFF})`)
  return worker
}

function setupIdleBackoff(worker: any) {
  if (idleCheckTimer) clearInterval(idleCheckTimer)

  const checkInterval = Number(process.env.WEBHOOK_IDLE_CHECK_INTERVAL || "10000")

  idleCheckTimer = setInterval(async () => {
    try {
      if (!webhookQueue) return

      const waiting = await webhookQueue.getWaitingCount()
      const active = await webhookQueue.getActiveCount()
      const delayed = await webhookQueue.getDelayedCount()

      if (waiting === 0 && active === 0 && delayed === 0) {
        if (!worker.isPaused) {
          console.log("😴 Queue idle - pausing worker to save CPU")
          await worker.pause()
        }
      } else {
        if (worker.isPaused) {
          console.log("🔄 Queue has jobs - resuming worker")
          await worker.resume()
        }
      }
    } catch (err) {
      console.warn("[idle-backoff] check failed:", (err as any)?.message || err)
    }
  }, checkInterval)
}

export async function getQueueStats() {
  if (!BULLMQ_ENABLED || !webhookQueue) {
    return { enabled: false };
  }

  try {
    const [
      waiting,
      active,
      completed,
      failed,
      delayed,
      isPaused,
      deadLetterCount,
      jobs
    ] = await Promise.all([
      webhookQueue.getWaitingCount(),
      webhookQueue.getActiveCount(),
      webhookQueue.getCompletedCount(),
      webhookQueue.getFailedCount(),
      webhookQueue.getDelayedCount(),
      webhookQueue.isPaused(),
      deadLetterQueue?.getWaitingCount() ?? 0,
      webhookQueue.getJobs(
        ["waiting", "active", "completed", "failed", "delayed"],
        0,
        20
      )
    ]);

    const totalProcessed = completed + failed;
    const successRate =
      totalProcessed === 0
        ? 100
        : Number(((completed / totalProcessed) * 100).toFixed(2));

    return {
      enabled: true,
      ready,

      // 🔥 KEY METRICS (you asked for)
      pending: waiting,
      processing: active,
      completed,
      failed,
      delayed,
      paused: isPaused,
      deadLetter: deadLetterCount,
      totalProcessed,
      successRate,

      // optional detailed list
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        returnValue: job.returnvalue,
        failedReason: job.failedReason
      }))
    };
  } catch (err) {
    return {
      enabled: true,
      ready: false,
      error: (err as any)?.message || err
    };
  }
}

export function isQueueEnabled() {
  return BULLMQ_ENABLED && ready
}

export async function closeQueue() {
  if (idleCheckTimer) {
    clearInterval(idleCheckTimer)
    idleCheckTimer = null
  }

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

    currentWorker = null
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
