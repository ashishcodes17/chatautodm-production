import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { workspaceId } = params
    const db = await getDatabase()

    const workspace = await db.collection("workspaces").findOne({
      _id: workspaceId,
      userId: user._id,
    })

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Get connected Instagram account
    const igAccount = await db.collection("instagram_accounts").findOne({
      workspaceId,
      isConnected: true,
    })

    return NextResponse.json({
      success: true,
      workspace,
      igAccount,
    })
  } catch (error) {
    console.error("Error fetching workspace:", error)
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { workspaceId } = params
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 })
    }

    const db = await getDatabase()

    const result = await db.collection("workspaces").updateOne(
      { _id: workspaceId, userId: user._id },
      {
        $set: {
          name,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating workspace:", error)
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { workspaceId } = params
    const db = await getDatabase()

    // Delete workspace and all related data
    await Promise.all([
      db.collection("workspaces").deleteOne({ _id: workspaceId, userId: user._id }),
      db.collection("instagram_accounts").deleteMany({ workspaceId }),
      db.collection("automations").deleteMany({ workspaceId }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting workspace:", error)
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 })
  }
}
