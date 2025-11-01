import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  
  // Get the host to determine cookie domain
  const forwardedHost = request.headers.get("x-forwarded-host")
  const requestUrl = new URL(request.url)
  const actualHost = forwardedHost || requestUrl.hostname
  const cookieDomain = actualHost.startsWith("www.") ? actualHost.substring(4) : actualHost

  // Delete cookie with matching properties
  cookieStore.delete("user_session")

  // Create response with explicit cookie deletion
  const response = NextResponse.json({ success: true })
  
  response.cookies.set("user_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
    ...(cookieDomain !== "localhost" && { domain: cookieDomain }),
  })

  return response
}
