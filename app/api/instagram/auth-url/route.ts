import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get("workspaceId")

  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace ID required" }, { status: 400 })
  }

  // Instagram Business Login URL
  const instagramAuthUrl = new URL("https://www.instagram.com/oauth/authorize")

  instagramAuthUrl.searchParams.set("client_id", process.env.INSTAGRAM_APP_ID || "demo_app_id")
  instagramAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}/api/instagram/callback`)
  instagramAuthUrl.searchParams.set("response_type", "code")
  instagramAuthUrl.searchParams.set(
    "scope",
    "instagram_business_basic,instagram_business_manage_insights,instagram_business_manage_comments,instagram_business_manage_messages",
  )
  instagramAuthUrl.searchParams.set("state", workspaceId)

  return NextResponse.json({ authUrl: instagramAuthUrl.toString() })
}
