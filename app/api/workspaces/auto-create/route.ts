import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDatabase } from "@/lib/mongodb"

async function getUser(request: NextRequest) {
  const cookieStore = await cookies()
  const userSession = cookieStore.get("user_session")

  if (!userSession) {
    throw new Error("Not authenticated")
  }

  return JSON.parse(userSession.value)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    const { instagramUsername, instagramUserId, accessToken, accountType, mediaCount } = await request.json()

    if (!instagramUsername || !instagramUserId || !accessToken) {
      return NextResponse.json({ error: "Missing required Instagram data" }, { status: 400 })
    }

    const db = await getDatabase()

    const existingAccount = await db.collection("instagram_accounts").findOne({
      instagramUserId,
    })

    if (existingAccount) {
      const existingWorkspace = await db.collection("workspaces").findOne({
        _id: existingAccount.workspaceId,
      })

      if (existingWorkspace) {
        await db.collection("instagram_accounts").updateOne(
          { instagramUserId },
          {
            $set: {
              accessToken,
              tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
              userId: user._id,
            },
          },
        )

        await db.collection("workspaces").updateOne(
          { _id: existingWorkspace._id },
          {
            $set: {
              userId: user._id,
              updatedAt: new Date(),
            },
          },
        )

        return NextResponse.json({
          workspace: existingWorkspace,
          account: existingAccount,
          message: "Instagram account reconnected to existing workspace",
        })
      }
    }

    // Create workspace automatically only if Instagram account doesn't exist
    const workspacesCollection = db.collection("workspaces")
    const newWorkspace = {
      _id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user._id,
      name: `@${instagramUsername}`,
      description: `Workspace for Instagram account @${instagramUsername}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await workspacesCollection.insertOne(newWorkspace)

    // Store the Instagram account
    const instagramAccountsCollection = db.collection("instagram_accounts")
    const newAccount = {
      _id: `ig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workspaceId: newWorkspace._id,
      userId: user._id,
      username: instagramUsername,
      instagramUserId,
      accessToken,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      followersCount: Math.floor(Math.random() * 10000) + 1000,
      mediaCount: mediaCount || 0,
      accountType: accountType || "BUSINESS",
      isConnected: true,
      connectedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await instagramAccountsCollection.insertOne(newAccount)

    return NextResponse.json({
      workspace: newWorkspace,
      account: newAccount,
    })
  } catch (error) {
    console.error("Auto-create workspace error:", error)
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 })
  }
}
