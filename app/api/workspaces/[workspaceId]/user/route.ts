import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { verifyWorkspaceAccess } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0
export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      console.log("❌ [USER API] No current user found")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = currentUser.userId || currentUser._id || currentUser.id
    console.log("✅ [USER API] Checking access - workspaceId:", workspaceId, "userId:", userId)
    
    const hasAccess = await verifyWorkspaceAccess(workspaceId, userId)
    console.log("🔍 [USER API] Access result:", hasAccess)
    
    if (!hasAccess) {
      console.log("❌ [USER API] Access denied for workspace:", workspaceId)
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const db = await getDatabase()

    // 1. Get workspace
    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId })
    if (!workspace) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 })
    }

    // 2. Get IG account
    const igAccount = await db.collection("instagram_accounts").findOne({
      workspaceId,
      isConnected: true,
    })

    if (!igAccount) {
      return NextResponse.json({ success: false, error: "Instagram account not found" }, { status: 404 })
    }

    const { accessToken, instagramId } = igAccount

    // 3. Fetch user profile
    const userRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,name,account_type,media_count,profile_picture_url&access_token=${accessToken}`,
    )
    const userJson = await userRes.json()

    if (userJson.error) {
      console.error("Instagram user error:", userJson.error)
      return NextResponse.json({ success: false, error: "Failed to fetch user info from Instagram" }, { status: 500 })
    }

    // 4. Fetch all media
    let media: any[] = []
    let mediaUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count,timestamp&access_token=${accessToken}`

    while (mediaUrl) {
      const mediaRes = await fetch(mediaUrl)
      const mediaJson = await mediaRes.json()

      if (mediaJson.error) {
        console.error("Instagram media error:", mediaJson.error)
        return NextResponse.json({ success: false, error: "Failed to fetch media from Instagram" }, { status: 500 })
      }

      media = media.concat(mediaJson.data || [])
      mediaUrl = mediaJson.paging?.next || null
    }

    return NextResponse.json({
      success: true,
      user: {
        username: userJson.username,
        name: userJson.name,
        instagramId: userJson.id,
        accountType: userJson.account_type,
        profilePictureUrl: userJson.profile_picture_url,
        posts: userJson.media_count,
        thumbnails: media.map((m: any) => ({
          id: m.id,
          type: m.media_type,
          caption: m.caption || "",
          permalink: m.permalink,
          mediaUrl: m.media_url,
          thumbnail: m.thumbnail_url || m.media_url,
          likeCount: m.like_count ?? 0,
          commentCount: m.comments_count ?? 0,
          timestamp: m.timestamp,
        })),
      },
    })
  } catch (error) {
    console.error("❌ Error fetching user data:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user info" }, { status: 500 })
  }
}
