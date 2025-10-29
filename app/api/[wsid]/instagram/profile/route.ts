import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { wsid: string } }) {
  try {
    const { wsid } = params
    const db = await getDatabase()

    // Find workspace and get Instagram account info
    const workspace = await db.collection("workspaces").findOne({ _id: wsid })

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Get Instagram account details
    const account = await db.collection("instagram_accounts").findOne({
      workspaceId: wsid,
    })

    if (!account) {
      return NextResponse.json({ error: "Instagram account not found" }, { status: 404 })
    }

    const profile = {
      id: account.instagramUserId,
      username: account.username,
      name: account.name || account.username,
      profile_picture_url: account.profilePictureUrl,
      account_type: account.accountType || "BUSINESS",
      media_count: account.mediaCount || 0,
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching Instagram profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
