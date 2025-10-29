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

    // Get Instagram account details
    const account = await db.collection("instagram_accounts").findOne({ instagramUserId: workspace.instagramUserId })
    if (!account) {
      return NextResponse.json({ error: "Instagram account not found" }, { status: 404 })
    }

    // Get usage stats
    const dmUsed = account.dmUsed || 0
    const automationsUsed = await db.collection("automations").countDocuments({
      instagramUserId: workspace.instagramUserId,
      isActive: true,
    })

    // Set limits based on plan
    const plan = account.plan || "free"
    let dmLimit = 1000 // Free plan
    let automationsLimit = 5 // Free plan

    if (plan === "pro") {
      dmLimit = 10000
      automationsLimit = 50
    } else if (plan === "elite") {
      dmLimit = 100000
      automationsLimit = 200
    }

    const usage = {
      dmUsed,
      dmLimit,
      automationsUsed,
      automationsLimit,
      plan,
    }

    return NextResponse.json({
      success: true,
      usage,
      workspace: {
        id: workspace._id,
        name: workspace.name,
        instagramUserId: workspace.instagramUserId,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching usage data:", error)
    return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 })
  }
}
