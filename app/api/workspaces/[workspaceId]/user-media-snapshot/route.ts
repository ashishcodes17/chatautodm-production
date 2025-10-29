import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { verifyWorkspaceAccess } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Creates a snapshot of all current Instagram media IDs for a workspace.
 * This is used for "Next Post" automations to detect brand new posts.
 * 
 * Logic:
 * - Fetches all current media from Instagram Graph API
 * - Stores all media.ids in userMedia collection
 * - Returns the snapshot document ID for reference
 */
export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = currentUser.userId || currentUser._id || currentUser.id
    const hasAccess = await verifyWorkspaceAccess(workspaceId, userId)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const db = await getDatabase()

    // 1. Get workspace
    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId } as any)
    if (!workspace) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 })
    }

    // 2. Get IG account
    const igAccount = await db.collection("instagram_accounts").findOne({
      workspaceId,
      isConnected: true,
    } as any)

    if (!igAccount) {
      return NextResponse.json({ success: false, error: "Instagram account not connected" }, { status: 404 })
    }

    const { accessToken, instagramUserId } = igAccount

    // 3. Fetch ALL media IDs from Instagram
    console.log(`📸 [Snapshot] Fetching all media for workspace: ${workspaceId}`)
    
    let allMediaIds: string[] = []
    let mediaUrl = `https://graph.instagram.com/me/media?fields=id&access_token=${accessToken}`

    while (mediaUrl) {
      const mediaRes = await fetch(mediaUrl)
      const mediaJson = await mediaRes.json()

      if (mediaJson.error) {
        console.error("❌ Instagram media error:", mediaJson.error)
        return NextResponse.json(
          { success: false, error: "Failed to fetch media from Instagram" },
          { status: 500 }
        )
      }

      // Extract just the IDs
      const mediaIds = (mediaJson.data || []).map((m: any) => m.id)
      allMediaIds = allMediaIds.concat(mediaIds)
      
      // Pagination
      mediaUrl = mediaJson.paging?.next || null
    }

    console.log(`📸 [Snapshot] Found ${allMediaIds.length} total media items`)

    // 4. Store snapshot in database
    const snapshot = {
      workspaceId,
      userId: workspace.userId,
      instagramUserId,
      media_ids: allMediaIds,
      totalCount: allMediaIds.length,
      createdAt: new Date(),
    }

    const result = await db.collection("userMedia").insertOne(snapshot as any)

    console.log(`✅ [Snapshot] Created snapshot with ${allMediaIds.length} media IDs`)

    return NextResponse.json({
      success: true,
      snapshotId: result.insertedId,
      mediaCount: allMediaIds.length,
      mediaIds: allMediaIds,
    })
  } catch (error) {
    console.error("❌ Error creating media snapshot:", error)
    return NextResponse.json({ success: false, error: "Failed to create snapshot" }, { status: 500 })
  }
}

/**
 * Get the most recent media snapshot for a workspace
 */
export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = currentUser.userId || currentUser._id || currentUser.id
    const hasAccess = await verifyWorkspaceAccess(workspaceId, userId)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const db = await getDatabase()

    const snapshot = await db
      .collection("userMedia")
      .find({ workspaceId } as any)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray()

    if (snapshot.length === 0) {
      return NextResponse.json({ success: true, snapshot: null })
    }

    return NextResponse.json({
      success: true,
      snapshot: snapshot[0],
    })
  } catch (error) {
    console.error("❌ Error fetching media snapshot:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch snapshot" }, { status: 500 })
  }
}
