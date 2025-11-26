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

    // Get ice breakers from database (includes response field)
    const automation = await db.collection("automations").findOne({
      workspaceId,
      type: "ice_breakers",
    } as any)

    if (!automation) {
      return NextResponse.json({ success: true, iceBreakers: null })
    }

    console.log("✅ [Ice Breakers] Retrieved from DB:", automation.iceBreakers)

    return NextResponse.json({
      success: true,
      iceBreakers: automation.iceBreakers || null,
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
  console.log("🧊🧊🧊 ICE_BREAKER_API_START 🧊🧊🧊")
  try {
    const { workspaceId } = params
    console.log("🧊 WORKSPACE_ID:", workspaceId)

    const body = await request.json()
    console.log("🧊 RECEIVED_PAYLOAD:", JSON.stringify(body, null, 2))

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

    // Prepare ice breakers - try DIRECT format (question, payload) as per error message
    // Instagram error says: "keysets must be of the form (question, payload) or (call_to_actions, locale)"
    const iceBreakers = body.call_to_actions.map((q: any) => ({
      question: q.question,
      payload: q.payload,
    }))

    const payload = {
      platform: "instagram",
      ice_breakers: iceBreakers, // Direct array of {question, payload} objects
    }

    console.log("🧊 INSTAGRAM_PAYLOAD:", JSON.stringify(payload, null, 2))

    // Send to Instagram API
    const response = await fetch(
      `https://graph.instagram.com/v24.0/${instagramUserId}/messenger_profile?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    )

    const responseData = await response.json()

    if (!response.ok) {
      console.error("🧊❌ INSTAGRAM_API_ERROR:", JSON.stringify(responseData, null, 2))
      return NextResponse.json(
        {
          success: false,
          error: responseData.error?.message || responseData.error?.error_user_msg || "Failed to create ice breakers",
          errorDetails: responseData.error,
          instagramError: responseData,
        },
        { status: response.status },
      )
    }

    console.log("🧊✅ SUCCESS:", responseData)

    // Store in database for reference (with full data including response field)
    // We need the response field for webhook handling
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
          iceBreakers: {
            locale: body.locale,
            call_to_actions: body.call_to_actions, // Store with response field for webhook use
          },
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      } as any,
      { upsert: true },
    )

    try {
      const { invalidateAutomation } = await import("@/lib/redis-cache")
      await invalidateAutomation(workspaceId, "ice_breakers")
      console.log("🔄 Cache invalidated for ice breakers")
    } catch (cacheError: any) {
      console.warn("⚠️ Cache invalidation failed (non-fatal):", cacheError.message)
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error: any) {
    console.error("🧊💥 EXCEPTION:", error?.message || error)
    console.error("🧊💥 STACK:", error?.stack)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create ice breakers",
        exception: String(error),
      },
      { status: 500 },
    )
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
      },
    )

    const responseData = await response.json()

    if (!response.ok) {
      console.error("❌ Instagram API error:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: responseData.error?.message || "Failed to delete ice breakers",
        },
        { status: response.status },
      )
    }

    console.log("✅ [Ice Breakers] Deleted successfully")

    // Remove from database
    await db.collection("automations").deleteOne({
      workspaceId,
      type: "ice_breakers",
    } as any)

    try {
      const { invalidateAutomation } = await import("@/lib/redis-cache")
      await invalidateAutomation(workspaceId, "ice_breakers")
      console.log("🔄 Cache invalidated for deleted ice breakers")
    } catch (cacheError: any) {
      console.warn("⚠️ Cache invalidation failed (non-fatal):", cacheError.message)
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("❌ Error deleting ice breakers:", error)
    return NextResponse.json({ success: false, error: "Failed to delete ice breakers" }, { status: 500 })
  }
}
