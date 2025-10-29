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

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const user = await getUser(request)
    const db = await getDatabase()
    const instagramAccountsCollection = db.collection("instagram_accounts")

    const accounts = await instagramAccountsCollection
      .find({
        workspaceId: params.workspaceId,
        userId: user._id,
      })
      .toArray()

    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const user = await getUser(request)
    const { username, accessToken, instagramUserId, followersCount } = await request.json()

    const db = await getDatabase()
    const instagramAccountsCollection = db.collection("instagram_accounts")

    const newAccount = {
      _id: `ig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workspaceId: params.workspaceId,
      userId: user._id,
      username,
      instagramUserId,
      accessToken,
      followersCount: followersCount || 0,
      isConnected: true,
      connectedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      dmUsed: 0,
      commentRepliesUsed: 0,
      plan: "free",
      usageHistory: [],
    }

    await instagramAccountsCollection.insertOne(newAccount)

    return NextResponse.json(newAccount)
  } catch (error) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
}
