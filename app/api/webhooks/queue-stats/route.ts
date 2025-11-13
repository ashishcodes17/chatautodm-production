import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

/**
 * Webhook Queue Statistics Endpoint
 * 
 * GET /api/webhooks/queue-stats
 * 
 * Returns real-time statistics about the webhook queue:
 * - Queue depth (pending, processing, completed, failed)
 * - Processing rate
 * - Success rate
 * - Recent failures
 */
export async function GET() {
  try {
    const db = await getDatabase()

    // Get queue statistics by status
    const queueStats = await db.collection("webhook_queue").aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    const pending = queueStats.find(s => s._id === "pending")?.count || 0
    const processing = queueStats.find(s => s._id === "processing")?.count || 0
    const completed = queueStats.find(s => s._id === "completed")?.count || 0
    const failed = queueStats.find(s => s._id === "failed")?.count || 0

    // Get processing rate (last hour)
    const oneHourAgo = new Date(Date.now() - 3600000)
    const completedLastHour = await db.collection("webhook_queue").countDocuments({
      status: "completed",
      completedAt: { $gte: oneHourAgo }
    })

    // Get recent failures (last 10)
    const recentFailures = await db.collection("webhook_queue")
      .find({ status: "failed" })
      .sort({ failedAt: -1 })
      .limit(10)
      .project({
        _id: 1,
        error: 1,
        attempts: 1,
        failedAt: 1,
        createdAt: 1
      })
      .toArray()

    // Get average processing time
    const avgProcessingTime = await db.collection("webhook_queue").aggregate([
      {
        $match: {
          status: "completed",
          processingTime: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$processingTime" }
        }
      }
    ]).toArray()

    const avgTime = avgProcessingTime[0]?.avgTime || 0

    // Calculate success rate
    const total = completed + failed
    const successRate = total > 0 ? ((completed / total) * 100).toFixed(2) : "100.00"

    // Get oldest pending job (shows queue delay)
    const oldestPending = await db.collection("webhook_queue")
      .findOne({ status: "pending" }, { sort: { createdAt: 1 } })

    const queueDelay = oldestPending
      ? Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000)
      : 0

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      queue: {
        pending,
        processing,
        completed,
        failed,
        total: pending + processing + completed + failed
      },
      performance: {
        processingRate: `${completedLastHour}/hour`,
        avgProcessingTime: `${Math.floor(avgTime)}ms`,
        successRate: `${successRate}%`,
        queueDelay: `${queueDelay}s`
      },
      recentFailures: recentFailures.map(f => ({
        id: f._id,
        error: f.error,
        attempts: f.attempts,
        failedAt: f.failedAt,
        age: Math.floor((Date.now() - new Date(f.createdAt).getTime()) / 1000) + "s"
      })),
      health: {
        status: pending > 5000 ? "warning" : pending > 10000 ? "critical" : "healthy",
        message: pending > 10000
          ? "Queue backlog is very high"
          : pending > 5000
            ? "Queue is building up"
            : "Queue is healthy"
      }
    })

  } catch (error) {
    console.error("Error fetching queue stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch queue stats" },
      { status: 500 }
    )
  }
}
