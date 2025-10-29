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

    // Get Instagram account for DM usage
    const instagramAccount = await db.collection("instagram_accounts").findOne({
      $or: [{ instagramUserId }, { instagramProfessionalId: instagramUserId }],
    })

    const dmsSent = instagramAccount?.dmUsed || 0

    // Get total contacts
    const totalContacts = await db.collection("contacts").countDocuments({ instagramUserId })

    // Get active automations count
    const activeAutomations = await db.collection("automations").countDocuments({
      $or: [{ instagramUserId }, { workspaceId }],
      isActive: true,
    })

    const totalAutomations = await db.collection("automations").countDocuments({
      $or: [{ instagramUserId }, { workspaceId }],
    })

    // Calculate conversion rate (comments to DMs)
    const totalComments = await db.collection("comments").countDocuments({ instagramUserId })
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
