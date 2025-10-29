import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const client = await clientPromise
    const db = client.db("instaautodm")

    const logs = await db.collection("webhook_logs").find({}).sort({ timestamp: -1 }).limit(limit).toArray()

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    console.error("Error fetching webhook logs:", error)
    return NextResponse.json({ error: "Failed to fetch webhook logs" }, { status: 500 })
  }
}
