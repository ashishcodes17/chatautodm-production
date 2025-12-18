import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  console.log("[GOOGLE CALLBACK] Request received:", {
    code: code ? "EXISTS" : "MISSING",
    error,
    url: request.url
  })

  if (error) {
    console.error("[GOOGLE CALLBACK] OAuth error:", error)
    return NextResponse.redirect(`${baseUrl}/?error=access_denied`)
  }

  if (!code) {
    console.error("[GOOGLE CALLBACK] No code provided")
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
      console.error("[GOOGLE CALLBACK] Failed to create or retrieve user")
      throw new Error("Failed to create or retrieve user")
    }

    console.log("[GOOGLE CALLBACK] User authenticated:", {
      userId: user._id,
      email: user.email
    })
    
    const cookieValue = JSON.stringify(user)
    
    console.log("[GOOGLE CALLBACK] Cookie value length:", cookieValue.length)

    const forwardedHost = request.headers.get("x-forwarded-host")
    const requestUrl = new URL(request.url)
    const actualHost = forwardedHost || requestUrl.hostname

    // Remove www. prefix to make cookie work across www and non-www
    // For Coolify/proxy setups, this ensures cookies work on both www and non-www domains
    const cookieDomain = actualHost.startsWith("www.") 
      ? actualHost.substring(4) 
      : actualHost

    console.log("[GOOGLE CALLBACK] Cookie setup:", {
      forwardedHost,
      requestHost: requestUrl.hostname,
      cookieDomain,
      isLocalhost: cookieDomain === "localhost"
    })

    console.log("[v0] Forwarded host:", forwardedHost)
    console.log("[v0] Request hostname:", requestUrl.hostname)
    console.log("[v0] Setting cookie for domain:", cookieDomain)

    const response = NextResponse.redirect(`${baseUrl}/select-workspace`)

    // Set cookie with proper configuration
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    }

    // Add domain for production (not localhost) to make cookie work across subdomains
    if (cookieDomain !== "localhost") {
      cookieOptions.domain = cookieDomain
    }

    response.cookies.set("user_session", cookieValue, cookieOptions)
    
    console.log("[GOOGLE CALLBACK] Cookie set with options:", cookieOptions)
    console.log("[GOOGLE CALLBACK] Redirecting to:", `${baseUrl}/select-workspace`)

    return response
  } catch (error) {
    console.error("[GOOGLE CALLBACK] Error during OAuth:", error)
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url))
  }
}
