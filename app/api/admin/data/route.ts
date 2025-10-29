import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDatabase } from "@/lib/mongodb"

const ADMIN_EMAILS = [
  "ashishgampala@gmail.com",
  "ashishgamer473@gmail.com",
]

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userSession = cookieStore.get("user_session")

    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userSession.value)

    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const collection = (searchParams.get("collection") || "workspaces").toString()
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "20", 10), 1), 100)

    const db = await getDatabase()

    const allowed = new Set(["workspaces", "instagram_accounts", "automations"])
    if (!allowed.has(collection)) {
      return NextResponse.json({ error: "Invalid collection" }, { status: 400 })
    }

    const col = db.collection(collection)
    const total = await col.countDocuments()
    const items = await col
      .find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()

    return NextResponse.json({
      success: true,
      collection,
      page,
      pageSize,
      total,
      items,
    })
  } catch (error) {
    console.error("Admin data fetch failed:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
