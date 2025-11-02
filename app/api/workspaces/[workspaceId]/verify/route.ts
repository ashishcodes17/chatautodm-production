import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { verifyWorkspaceAccess } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * ⚡ FAST endpoint to verify workspace ownership
 * This only checks MongoDB (no Instagram API calls)
 * Used to prevent redirect loops in dashboard
 */
export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized", hasAccess: false }, { status: 401 })
    }

    const userId = currentUser.userId || currentUser._id || currentUser.id
    const hasAccess = await verifyWorkspaceAccess(workspaceId, userId)

    return NextResponse.json({
      success: true,
      hasAccess,
      userId,
    })
  } catch (error) {
    console.error("❌ Error verifying workspace access:", error)
    return NextResponse.json({ success: false, error: "Failed to verify access", hasAccess: false }, { status: 500 })
  }
}
