import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_EMAILS = [
  "ashishgampala@gmail.com",
  "ashishgamer473@gmail.com",
  // Add more admin emails here
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

    return NextResponse.json({ authorized: true })
  } catch (error) {
    console.error("Admin verification failed:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
