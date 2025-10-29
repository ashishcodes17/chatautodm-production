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

    const db = await getDatabase()

    // Get all users
    const users = await db.collection("users").find().sort({ createdAt: -1 }).limit(1000).toArray()

    // Enrich user data with workspace and automation counts
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const workspaces = await db.collection("workspaces").countDocuments({ userId: user._id })

        // Get Instagram accounts for this user
        const workspace = await db.collection("workspaces").findOne({ userId: user._id })
        let dmsSent = 0
        let automations = 0

        if (workspace) {
          const instagramAccount = await db.collection("instagram_accounts").findOne({
            $or: [
              { instagramUserId: workspace.instagramUserId },
              { instagramProfessionalId: workspace.instagramUserId },
            ],
          })
          dmsSent = instagramAccount?.dmUsed || 0

          automations = await db.collection("automations").countDocuments({
            $or: [{ instagramUserId: workspace.instagramUserId }, { workspaceId: workspace._id }],
          })
        }

        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          createdAt: user.createdAt,
          workspaces,
          dmsSent,
          automations,
          lastActive: user.lastActive,
        }
      }),
    )

    return NextResponse.json({ users: enrichedUsers })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
