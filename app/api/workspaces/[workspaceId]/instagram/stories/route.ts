import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params
    const db = await getDatabase()

    const account = await db.collection("instagram_accounts").findOne({
      workspaceId,
      isConnected: true,
    })

    if (!account || !account.instagramUserId || !account.accessToken) {
      return NextResponse.json(
        { error: "Instagram account not connected" },
        { status: 400 }
      )
    }

    console.log("📱 Fetching stories for:", account.username)

    const res = await fetch(
      `https://graph.instagram.com/v19.0/${account.instagramUserId}/stories?fields=id,media_type,media_url,thumbnail_url,timestamp,permalink&access_token=${account.accessToken}`
    )

    if (!res.ok) {
      const error = await res.json()
      console.error("❌ Failed to fetch stories:", error)

      if (error.error?.code === 190) {
        return NextResponse.json(
          {
            error:
              "Access token expired. Please reconnect your Instagram account.",
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: "Failed to fetch Instagram stories" },
        { status: 500 }
      )
    }

    const json = await res.json()
    const stories = json.data || []

    return NextResponse.json({
      success: true,
      count: stories.length,
      hasStories: stories.length > 0,
      stories: stories.map((story: any) => ({
        id: story.id,
        media_type: story.media_type,
        media_url: story.media_url,
        thumbnail_url: story.thumbnail_url || story.media_url,
        timestamp: story.timestamp,
        permalink: story.permalink,
        caption: `Story from ${new Date(story.timestamp).toLocaleDateString()}`,
      })),
      user: {
        username: account.username,
        instagramId: account.instagramUserId,
      },
    })
  } catch (error) {
    console.error("💥 IG Stories API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch Instagram stories" },
      { status: 500 }
    )
  }

}
