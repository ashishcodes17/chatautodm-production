import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDatabase } from "@/lib/mongodb"

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

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"

    const db = await getDatabase()

    // Calculate date range
    let dateFilter = {}
    const now = new Date()
    if (range !== "all") {
      const daysMap: { [key: string]: number } = {
        "24h": 1,
        "7d": 7,
        "30d": 30,
        "90d": 90,
      }
      const days = daysMap[range] || 7
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      dateFilter = { createdAt: { $gte: startDate } }
    }

    // Get total users
    const totalUsers = await db.collection("users").countDocuments()

    // Get total workspaces
    const totalWorkspaces = await db.collection("workspaces").countDocuments()

    // Get total DMs sent
    const instagramAccounts = await db.collection("instagram_accounts").find().toArray()
    const totalDMsSent = instagramAccounts.reduce((sum, acc) => sum + (acc.dmUsed || 0), 0)

    // Get total contacts
    const totalContacts = await db.collection("contacts").countDocuments()

    // Get total automations
    const totalAutomations = await db.collection("automations").countDocuments()
    const activeAutomations = await db.collection("automations").countDocuments({ isActive: true })

    // Calculate growth metrics (comparing to previous period)
    const previousPeriodStart = new Date(now.getTime() - (range === "7d" ? 14 : 60) * 24 * 60 * 60 * 1000)
    const currentPeriodStart = new Date(now.getTime() - (range === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000)

    const previousUsers = await db
      .collection("users")
      .countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } })
    const currentUsers = await db.collection("users").countDocuments({ createdAt: { $gte: currentPeriodStart } })

    const userGrowth = previousUsers > 0 ? Math.round(((currentUsers - previousUsers) / previousUsers) * 100) : 0

    // Calculate DM growth (simplified)
    const dmGrowth = 15 // Placeholder - implement actual calculation

    // Calculate averages
    const avgDMsPerUser = totalUsers > 0 ? totalDMsSent / totalUsers : 0
    const avgAutomationsPerUser = totalUsers > 0 ? totalAutomations / totalUsers : 0

    return NextResponse.json({
      totalUsers,
      totalWorkspaces,
      totalDMsSent,
      totalContacts,
      totalAutomations,
      activeAutomations,
      userGrowth,
      dmGrowth,
      avgDMsPerUser,
      avgAutomationsPerUser,
    })
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}