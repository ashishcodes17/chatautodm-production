import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params
    const db = await getDatabase()

    // Find workspace
    const workspace = await db.collection("workspaces").findOne({
      workspaceId: workspaceId,
    })

    if (!workspace) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 })
    }

    // Find Instagram account
    const instagramAccount = await db.collection("instagram_accounts").findOne({
      workspaceId: workspaceId,
    })

    if (!instagramAccount) {
      return NextResponse.json({ success: false, error: "Instagram account not found" }, { status: 404 })
    }

    // Return profile data
    const profile = {
      id: instagramAccount.instagramUserId,
      username: instagramAccount.username,
      name: instagramAccount.name || instagramAccount.username,
      profile_picture_url: instagramAccount.profile_picture_url || "/placeholder.svg",
      followers_count: instagramAccount.followers_count || 0,
      media_count: instagramAccount.media_count || 0,
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error("Error fetching Instagram profile:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 })
  }
}
