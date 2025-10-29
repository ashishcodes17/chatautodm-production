import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

// how many days to keep logs
const LOG_RETENTION_DAYS = 2

export async function POST() {
  try {
    const db = await getDatabase()

    const cutoffDate = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000)

    const result = await db.collection("webhook_logs").deleteMany({
      timestamp: { $lt: cutoffDate },
    })

    return NextResponse.json({
      success: true,
      message: `🧹 Deleted ${result.deletedCount} webhook logs older than ${LOG_RETENTION_DAYS} days.`,
    })
  } catch (error) {
    console.error("❌ Log cleanup error:", error)
    return NextResponse.json({ success: false, error: "Cleanup failed" }, { status: 500 })
  }
}
