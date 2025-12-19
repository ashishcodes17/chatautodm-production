import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code || !state) {
    return htmlError("Instagram authorization failed or was cancelled.")
  }

  try {
    // Step 1: Decode JWT from state
    const decoded = jwt.verify(state, process.env.JWT_SECRET!) as { userId: string }

    // Step 2: Exchange short-lived token
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URL!,
        code,
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error("No token from Instagram")

    // Step 3: Long-lived token
    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`,
    )
    const longTokenData = await longTokenRes.json()
    const accessToken = longTokenData.access_token || tokenData.access_token

    // Step 4: Profile fetch
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,user_id,username,account_type,media_count,profile_picture_url,followers_count,follows_count&access_token=${accessToken}`,
    )
    const igUser = await profileRes.json()
    if (!igUser.id) throw new Error("Failed to fetch IG user")

       // Step: Subscribe IG account to webhooks
         await fetch(
        `https://graph.instagram.com/v23.0/${igUser.id}/subscribed_apps`,
         {
       method: "POST",
       headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
         subscribed_fields: [
        "comments",
        "live_comments",
        "mentions",
        "messages",
       // "message_echoes",
        "message_reactions",
        "messaging_handover",
        "messaging_optins",
       // "messaging_policy_enforcement",
        "messaging_postbacks",
       // "messaging_referral",
        "messaging_seen",
        //"response_feedback",
      //  "standby",
       //  "story_insights"
      ], // add more if needed
             access_token: accessToken, // IG User long-lived token
          }),
         }
      )
  .then(res => res.json())
  .then(data => {
    console.log("✅ Subscribed IG user to webhooks:", data)
  })
  .catch(err => {
    console.error("❌ Failed subscribing IG user:", err)
  })


    // Step 5: Check for existing Instagram account (GLOBAL DEDUPLICATION)
    const db = await getDatabase()

    const existingAccount = await db.collection("instagram_accounts").findOne({
      $or: [
        { instagramUserId: igUser.id },
        { instagramUserId: igUser.user_id },
        { instagramProfessionalId: igUser.user_id },
      ],
    })

    if (existingAccount) {
      const existingWorkspace = await db.collection("workspaces").findOne({
        _id: existingAccount.workspaceId,
      })

      if (existingWorkspace) {
        await db.collection("instagram_accounts").updateOne(
          { instagramUserId: igUser.id },
          {
            $set: {
              accessToken,
              tokenExpiresAt: new Date(Date.now() + (longTokenData.expires_in || 60 * 86400) * 1000),
              updatedAt: new Date(),
              userId: decoded.userId,
            },
          },
        )

        await db.collection("workspaces").updateOne(
          { _id: existingWorkspace._id },
          {
            $set: {
              userId: decoded.userId,
              updatedAt: new Date(),
            },
          },
        )

        return htmlSuccess({ workspaceId: existingWorkspace._id, username: igUser.username })
      }
    }

    // Step 6: Create new workspace and account only if Instagram account doesn't exist
    const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const accountId = `ig_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

    await db.collection("workspaces").insertOne({
      _id: workspaceId,
      userId: decoded.userId,
      name: `@${igUser.username}`,
      instagramUserId: igUser.id, // App-scoped ID
      instagramProfessionalId: igUser.user_id, // Professional account ID (used in webhooks)
      plan: 'freeby', // Default plan for new workspaces
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await db.collection("instagram_accounts").insertOne({
      _id: accountId,
      workspaceId,
      userId: decoded.userId,
      username: igUser.username,
      instagramUserId: igUser.id, // App-scoped ID
      instagramProfessionalId: igUser.user_id, // Professional account ID (used in webhooks)
      accessToken,
      accountType: igUser.account_type,
      mediaCount: igUser.media_count || 0,
      followersCount: igUser.followers_count || 0,
      followsCount: igUser.follows_count || 0,
      profilePictureUrl: igUser.profile_picture_url || null,
      tokenExpiresAt: new Date(Date.now() + (longTokenData.expires_in || 60 * 86400) * 1000),
      isConnected: true,
      plan: 'freeby', // Default plan for new accounts
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return htmlSuccess({ workspaceId, username: igUser.username })
  } catch (err) {
    console.error("❌ IG Callback Error:", err)
    return htmlError("Instagram connection failed.")
  }
}

function htmlSuccess(data: { workspaceId: string; username: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"
  const redirectUrl = `${baseUrl}/connect-instagram?success=1&workspaceId=${data.workspaceId}&username=${encodeURIComponent(data.username)}`
  return NextResponse.redirect(redirectUrl, 302)
}

function htmlError(message: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"
  const redirectUrl = `${baseUrl}/connect-instagram?error=${encodeURIComponent(message)}`
  return NextResponse.redirect(redirectUrl, 302)
}
