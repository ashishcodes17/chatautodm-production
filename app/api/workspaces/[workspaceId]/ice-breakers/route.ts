import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser, verifyWorkspaceAccess } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * GET - Retrieve current ice breakers from Instagram
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
    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId } as any)

    if (!workspace) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 })
    }

    // Get Instagram account
    const igAccount = await db.collection("instagram_accounts").findOne({
      workspaceId,
      isConnected: true,
    } as any)

    if (!igAccount) {
      return NextResponse.json({ success: false, error: "Instagram account not connected" }, { status: 404 })
    }

    const { accessToken, instagramUserId } = igAccount

    // Fetch ice breakers from Instagram API
    const response = await fetch(
      `https://graph.instagram.com/v24.0/${instagramUserId}/messenger_profile?fields=ice_breakers&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("❌ Instagram API error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch ice breakers" }, { status: 500 })
    }

    const data = await response.json()

    console.log("✅ [Ice Breakers] Retrieved:", data)

    return NextResponse.json({
      success: true,
      iceBreakers: data?.data?.[0] || null,
    })
  } catch (error) {
    console.error("❌ Error fetching ice breakers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch ice breakers" }, { status: 500 })
  }
}

/**
 * POST - Create/Update ice breakers on Instagram
 */
export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params
    const body = await request.json()

    console.log("📥 [Ice Breakers] Received data:", JSON.stringify(body, null, 2))

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
    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId } as any)

    if (!workspace) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 })
    }

    // Get Instagram account
    const igAccount = await db.collection("instagram_accounts").findOne({
      workspaceId,
      isConnected: true,
    } as any)

    if (!igAccount) {
      return NextResponse.json({ success: false, error: "Instagram account not connected" }, { status: 404 })
    }

    const { accessToken, instagramUserId } = igAccount

    // Prepare payload for Instagram API
    const payload: any = {
      platform: "instagram",
      ice_breakers: [
        {
          call_to_actions: body.call_to_actions,
        },
      ],
    }

    // Add locale if not default
    if (body.locale && body.locale !== "default") {
      payload.ice_breakers[0].locale = body.locale
    }

    console.log("🔄 [Ice Breakers] Sending to Instagram:", JSON.stringify(payload, null, 2))

    // Send to Instagram API
    const response = await fetch(
      `https://graph.instagram.com/v24.0/${instagramUserId}/messenger_profile?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      console.error("❌ Instagram API error:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: responseData.error?.message || "Failed to create ice breakers",
        },
        { status: response.status }
      )
    }

    console.log("✅ [Ice Breakers] Created successfully:", responseData)

    // Store in database for reference
    await db.collection("automations").updateOne(
      {
        workspaceId,
        type: "ice_breakers",
      } as any,
      {
        $set: {
          workspaceId,
          userId: workspace.userId,
          type: "ice_breakers",
          name: "Ice Breakers",
          isActive: true,
          iceBreakers: body,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      } as any,
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("❌ Error creating ice breakers:", error)
    return NextResponse.json({ success: false, error: "Failed to create ice breakers" }, { status: 500 })
  }
}

/**
 * DELETE - Remove ice breakers from Instagram
 */
export async function DELETE(request: NextRequest, { params }: { params: { workspaceId: string } }) {
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
    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId } as any)

    if (!workspace) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 })
    }

    // Get Instagram account
    const igAccount = await db.collection("instagram_accounts").findOne({
      workspaceId,
      isConnected: true,
    } as any)

    if (!igAccount) {
      return NextResponse.json({ success: false, error: "Instagram account not connected" }, { status: 404 })
    }

    const { accessToken, instagramUserId } = igAccount

    // Delete from Instagram API
    const response = await fetch(
      `https://graph.instagram.com/v24.0/${instagramUserId}/messenger_profile?access_token=${accessToken}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: ["ice_breakers"],
        }),
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      console.error("❌ Instagram API error:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: responseData.error?.message || "Failed to delete ice breakers",
        },
        { status: response.status }
      )
    }

    console.log("✅ [Ice Breakers] Deleted successfully")

    // Remove from database
    await db.collection("automations").deleteOne({
      workspaceId,
      type: "ice_breakers",
    } as any)

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("❌ Error deleting ice breakers:", error)
    return NextResponse.json({ success: false, error: "Failed to delete ice breakers" }, { status: 500 })
  }
}
