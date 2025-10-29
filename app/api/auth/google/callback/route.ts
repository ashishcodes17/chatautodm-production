import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.chatautodm.com"

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=access_denied`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=no_code`)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error("No access token received")
    }

    // Get user info from Google
    const userResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`,
    )
    const googleUser = await userResponse.json()

    // Store/update user in database
    const db = await getDatabase()
    const usersCollection = db.collection("users")

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await usersCollection.updateOne(
      { email: googleUser.email },
      {
        $set: {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          googleId: googleUser.id,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          _id: userId,
          plan: "free",
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    const user = await usersCollection.findOne({ email: googleUser.email })

    if (!user) {
      throw new Error("Failed to create or retrieve user")
    }

    console.log("[v0] User object being stored in cookie:", JSON.stringify(user, null, 2))

    const cookieValue = JSON.stringify(user)
    console.log("[v0] Cookie value being set:", cookieValue)

    const forwardedHost = request.headers.get("x-forwarded-host")
    const requestUrl = new URL(request.url)
    const actualHost = forwardedHost || requestUrl.hostname

    // Remove www. prefix to make cookie work across www and non-www
    const cookieDomain = actualHost.startsWith("www.") ? actualHost.substring(4) : actualHost

    console.log("[v0] Forwarded host:", forwardedHost)
    console.log("[v0] Request hostname:", requestUrl.hostname)
    console.log("[v0] Setting cookie for domain:", cookieDomain)

    const response = NextResponse.redirect(`${baseUrl}/select-workspace`)

    response.cookies.set("user_session", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      // Only set domain if not localhost (for development)
      ...(cookieDomain !== "localhost" && { domain: cookieDomain }),
    })

    console.log("[v0] Cookie set successfully, redirecting to:", `${baseUrl}/select-workspace`)

    return response
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url))
  }
}
