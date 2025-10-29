import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDatabase } from "@/lib/mongodb"

const ADMIN_EMAILS = ["ashishgampala@gmail.com"]

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
    const type = searchParams.get("type") || "users"

    const db = await getDatabase()

    if (type === "users") {
      const users = await db.collection("users").find().toArray()

      // Create CSV
      const headers = ["ID", "Name", "Email", "Created At"]
      const rows = users.map((u) => [u._id, u.name, u.email, new Date(u.createdAt).toISOString()])

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="users-export.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
  } catch (error) {
    console.error("Export failed:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
