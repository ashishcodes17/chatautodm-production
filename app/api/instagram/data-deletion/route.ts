import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Instagram sends the user's Instagram ID for data deletion
    const instagramUserId = body.user_id

    if (!instagramUserId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
    }

    const db = await getDatabase()

    // Find the Instagram account to get workspace info
    const instagramAccount = await db.collection("instagram_accounts").findOne({
      $or: [{ instagramUserId: instagramUserId }, { instagramProfessionalId: instagramUserId }],
    })

    if (instagramAccount) {
      const workspaceId = instagramAccount.workspaceId

      // Delete the Instagram account data
      await db.collection("instagram_accounts").deleteOne({
        _id: instagramAccount._id,
      })

      // Delete the associated workspace
      await db.collection("workspaces").deleteOne({
        _id: workspaceId,
      })

      // Delete any other related data (posts, analytics, etc.)
      // Add more collections as needed based on your data structure
      await db.collection("instagram_posts").deleteMany({
        workspaceId: workspaceId,
      })

      await db.collection("instagram_analytics").deleteMany({
        workspaceId: workspaceId,
      })

      console.log(`Deleted all data for Instagram user_id: ${instagramUserId}`)
    } else {
      console.log(`No data found for Instagram user_id: ${instagramUserId}`)
    }

    // Generate a confirmation URL that Instagram can use to verify deletion
    const confirmationCode = `del_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/data-deletion/confirm?code=${confirmationCode}`

    // Optionally store the confirmation code in database for verification
    await db.collection("deletion_confirmations").insertOne({
      _id: confirmationCode,
      instagramUserId: instagramUserId,
      deletedAt: new Date(),
      confirmed: true,
    })

    // Instagram expects this response format
    return NextResponse.json(
      {
        url: confirmationUrl,
        confirmation_code: confirmationCode,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("❌ Instagram Data Deletion Error:", error)
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
