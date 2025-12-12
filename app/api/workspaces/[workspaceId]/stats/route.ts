import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params
    const db = await getDatabase()

    // Get workspace to verify access and get Instagram account
    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    const instagramUserId = workspace.instagramUserId

    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    // Get Instagram account
    const instagramAccount = await db.collection("instagram_accounts").findOne({
      $or: [{ instagramUserId }, { instagramProfessionalId: instagramUserId }],
    })

    if (!instagramAccount) {
      return NextResponse.json({ error: "Instagram account not found" }, { status: 404 })
    }

    // Get monthly DM usage from instagram_accounts
    // If monthlyDmUsed doesn't exist or is from a previous month, it will show 0
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const accountMonth = instagramAccount.currentMonth
    const dmsSent = accountMonth === currentMonth ? (instagramAccount.monthlyDmUsed || 0) : 0

    // Get total contacts (all-time, as this is a cumulative metric)
    const totalContacts = await db.collection("contacts").countDocuments({ instagramUserId })

    // Get active automations count
    const activeAutomations = await db.collection("automations").countDocuments({
      $or: [{ instagramUserId }, { workspaceId }],
      isActive: true,
    })

    const totalAutomations = await db.collection("automations").countDocuments({
      $or: [{ instagramUserId }, { workspaceId }],
    })

    // Calculate conversion rate (comments to DMs) for current month
    const totalComments = await db.collection("comments").countDocuments({
      instagramUserId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
    const conversionRate = totalComments > 0 ? Math.round((dmsSent / totalComments) * 100) : 0

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayMessages = await db.collection("messages").countDocuments({
      instagramUserId,
      createdAt: { $gte: today },
    })

    const todayComments = await db.collection("comments").countDocuments({
      instagramUserId,
      createdAt: { $gte: today },
    })

    // Mock data for new metrics (can be replaced with real data later)
    const newFollowers = Math.floor(Math.random() * 10) // Replace with real follower tracking
    const messagesSeen = Math.floor(dmsSent * 0.8) // Estimate 80% seen rate
    const messagesPressed = Math.floor(dmsSent * 0.3) // Estimate 30% click rate

    return NextResponse.json({
      stats: {
        dmsSent,
        totalContacts,
        activeAutomations,
        totalAutomations,
        conversionRate,
        todayMessages,
        todayComments,
        newFollowers,
        messagesSeen,
        messagesPressed,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
