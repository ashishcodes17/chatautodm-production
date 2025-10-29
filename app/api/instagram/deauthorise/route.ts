import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Instagram sends the user's Instagram ID when they deauthorize
    const instagramUserId = body.user_id

    if (!instagramUserId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
    }

    const db = await getDatabase()

    // Find and deactivate the Instagram account
    const result = await db.collection("instagram_accounts").updateOne(
      {
        $or: [{ instagramUserId: instagramUserId }, { instagramProfessionalId: instagramUserId }],
      },
      {
        $set: {
          isConnected: false,
          accessToken: null, // Remove the access token
          deauthorizedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      console.log(`No Instagram account found for user_id: ${instagramUserId}`)
    } else {
      console.log(`Deauthorized Instagram account for user_id: ${instagramUserId}`)
    }

    // Instagram expects a 200 response
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("❌ Instagram Deauthorize Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle GET requests (for webhook verification if needed)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const hubMode = searchParams.get("hub.mode")
  const hubChallenge = searchParams.get("hub.challenge")
  const hubVerifyToken = searchParams.get("hub.verify_token")

  // Verify webhook (optional - Instagram may require this)
  if (hubMode === "subscribe" && hubVerifyToken === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(hubChallenge, { status: 200 })
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
