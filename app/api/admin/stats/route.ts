import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminStats } from "@/lib/admin-stats-cache"

const ADMIN_EMAILS = [
  "ashishgampala@gmail.com",
  "ashishgamer473@gmail.com",
  // Add more admin emails here
]

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userSession = cookieStore.get("user_session")

    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userSession.value)

    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Get cached stats (60s TTL) - super fast, no DB hammer
    const stats = await getAdminStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
