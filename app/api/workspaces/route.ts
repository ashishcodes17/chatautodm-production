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

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    const db = await getDatabase()
    const workspacesCollection = db.collection("workspaces")

    const workspaces = await workspacesCollection.find({ userId: user._id }).sort({ createdAt: -1 }).toArray()

    // Get Instagram accounts for each workspace
    const instagramAccountsCollection = db.collection("instagram_accounts")
    for (const workspace of workspaces) {
      const accounts = await instagramAccountsCollection.find({ workspaceId: workspace._id }).toArray()
      workspace.instagramAccounts = accounts
    }

    return NextResponse.json(workspaces)
  } catch (error) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    const { name, description } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const workspacesCollection = db.collection("workspaces")

    const newWorkspace = {
      _id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user._id,
      name: name.trim(),
      description: description?.trim() || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await workspacesCollection.insertOne(newWorkspace)

    return NextResponse.json({ ...newWorkspace, instagramAccounts: [] })
  } catch (error) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
}
