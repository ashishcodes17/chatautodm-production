import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params
    const db = await getDatabase()

    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    const account = await db.collection("instagram_accounts").findOne({ instagramUserId: workspace.instagramUserId })
    if (!account) {
      return NextResponse.json({ error: "Instagram account not found" }, { status: 404 })
    }

    // Fetch user profile info
    const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${account.accessToken}`)
    const userInfo = await userRes.json()

    // Fetch user insights
    const igRes = await fetch(
      `https://graph.instagram.com/v23.0/${account.instagramUserId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,permalink&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    )

    let posts = []
    if (igRes.ok) {
      const postData = await igRes.json()
      posts = postData.data || []
    }

    return NextResponse.json({
      success: true,
      data: {
        name: account.name || "",
        username: account.username,
        instagramUserId: workspace.instagramUserId,
        workspaceId: workspace._id,
        email: account.email || "",
        profilePic: account.profilePicture || "/placeholder.svg",
        followers: account.followers || 0,
        following: account.following || 0,
        posts,
      },
    })
  } catch (error) {
    console.error("❌ Test API Error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
