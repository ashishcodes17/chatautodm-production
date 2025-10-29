import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userSession = cookieStore.get("user_session")

    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userSession.value)

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    })

    const forwardedHost = request.headers.get("x-forwarded-host")
    const requestUrl = new URL(request.url)
    const actualHost = forwardedHost || requestUrl.hostname
    const cookieDomain = actualHost.startsWith("www.") ? actualHost.substring(4) : actualHost

    const response = NextResponse.json({ ...user, token })

    response.cookies.set("user_session", userSession.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      ...(cookieDomain !== "localhost" && { domain: cookieDomain }),
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }
}
