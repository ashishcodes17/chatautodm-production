// /api/webhooks/health/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getQueueStats } from "@/lib/webhook-queue"
import { getCacheStats } from "@/lib/redis-cache"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // BullMQ stats (fast)
    const queueStats = await getQueueStats()

    // Redis cache stats
    const cacheStats = await getCacheStats()

    // MongoDB queue fallback stats
    const dbQueueStats = await db
      .collection("webhook_queue")
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const pending = dbQueueStats.find((s) => s._id === "pending")?.count || 0
    const processing = dbQueueStats.find((s) => s._id === "processing")?.count || 0
    const completed = dbQueueStats.find((s) => s._id === "completed")?.count || 0
    const failed = dbQueueStats.find((s) => s._id === "failed")?.count || 0

    const totalProcessed = completed + failed
    const successRate =
      totalProcessed === 0 ? 100 : Number(((completed / totalProcessed) * 100).toFixed(2))

    // Healthy if:
    const isHealthy =
      pending < 1000 &&
      cacheStats.connected !== false &&
      queueStats.ready === true &&
      successRate > 90

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),

        queue: {
          bullmq: queueStats,
          mongodb: {
            pending,
            processing,
            completed,
            failed,
            total: pending + processing + completed + failed,
          },
          health: {
            isBackedUp: pending > 500,
            avgResponse: "~150-250ms",
            estimatedThroughput: "300-450 jobs / min",
          },
        },

        cache: {
          redis: cacheStats,
          health: {
            connected: cacheStats.connected !== false,
            keyCount: cacheStats.keyspace || 0,
          },
        },

        performance: {
          successRate,
          throughput: {
            totalProcessed,
            pendingQueue: pending,
            estimatedJobsPerSecond:
              totalProcessed > 0 ? Number((totalProcessed / 60).toFixed(1)) : 0,
          },
        },

        recommendations: [
          pending > 500 && "Queue backing up — increase workers.",
          failed > 100 && "High failure rate — check Instagram API limits.",
          !cacheStats.connected && "Redis disconnected — fallback to MongoDB active.",
          successRate < 90 && "Low success rate — increase retries or concurrency.",
          queueStats.ready === false && "BullMQ not ready — check Redis connection.",
        ].filter(Boolean),
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
