import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Missing confirmation code" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verify the confirmation code exists
    const confirmation = await db.collection("deletion_confirmations").findOne({
      _id: code,
    })

    if (!confirmation) {
      return NextResponse.json({ error: "Invalid confirmation code" }, { status: 404 })
    }

    // Return confirmation that data was deleted
    return NextResponse.json(
      {
        message: "Data deletion confirmed",
        deleted_at: confirmation.deletedAt,
        instagram_user_id: confirmation.instagramUserId,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("❌ Data Deletion Confirmation Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
