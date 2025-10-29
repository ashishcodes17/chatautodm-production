import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    const db = await getDatabase()

    // Find connected Instagram account for the workspace
    const igAccount = await db.collection("instagram_accounts").findOne({
      workspaceId,
      isConnected: true,
    })

    if (!igAccount) {
      return NextResponse.json({ success: false, error: "Instagram account not found" }, { status: 404 })
    }

    const { accessToken, instagramId } = igAccount

    // Fetch user's media from Instagram API using their specific access token
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&access_token=${accessToken}`,
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("❌ Failed to fetch Instagram posts:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch Instagram posts" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      posts: data.data?.map((post: any) => ({
        id: post.id,
        caption: post.caption,
        mediaType: post.media_type,
        mediaUrl: post.media_url,
        thumbnailUrl: post.thumbnail_url || post.media_url,
        timestamp: post.timestamp,
        permalink: post.permalink,
      })) || [],
    })
  } catch (error) {
    console.error("❌ Error fetching Instagram posts:", error)
    return NextResponse.json({ error: "Failed to fetch Instagram posts" }, { status: 500 })
  }
}
