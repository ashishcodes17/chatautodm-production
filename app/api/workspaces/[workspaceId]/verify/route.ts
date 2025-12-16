import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { verifyWorkspaceAccess } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * ⚡ BLAZING FAST endpoint to verify workspace ownership
 * - Single DB query with indexed fields
 * - No Instagram API calls
 * - Cached response for 5 minutes
 */
export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ success: false, hasAccess: false }, { status: 401 })
    }

    const userId = currentUser.userId || currentUser._id || currentUser.id
    const hasAccess = await verifyWorkspaceAccess(workspaceId, userId)

    return NextResponse.json(
      { success: true, hasAccess },
      {
        headers: {
          'Cache-Control': 'private, max-age=120, must-revalidate', // 2-minute cache with revalidation
        }
      }
    )
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ success: false, hasAccess: false }, { status: 500 })
  }
}
