import { type NextRequest, NextResponse } from "next/server"
import { refreshAdminStatsCache } from "@/lib/admin-stats-cache"

// Vercel Cron job to refresh admin stats every minute
// Configure in vercel.json

export async function GET(request: NextRequest) {
  try {
    // Verify request is from Vercel Cron
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      console.error("❌ Unauthorized cron request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔄 Cron: Refreshing admin stats...")

    // Refresh stats cache (force publish)
    await refreshAdminStatsCache(true)

    console.log("✅ Cron: Admin stats refreshed successfully")

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Cron: Failed to refresh admin stats:", error)
    return NextResponse.json(
      {
        error: "Failed to refresh stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
