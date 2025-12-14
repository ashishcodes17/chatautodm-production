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
    
    // Fetch workspaces and Instagram accounts in parallel (much faster!)
    const [workspaces, allInstagramAccounts] = await Promise.all([
      db.collection("workspaces")
        .find({ userId: user._id })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection("instagram_accounts")
        .find({ userId: user._id })
        .toArray()
    ])

    // Map Instagram accounts to workspaces (in-memory, super fast)
    const accountsByWorkspace = new Map()
    allInstagramAccounts.forEach(account => {
      const wsId = account.workspaceId
      if (!accountsByWorkspace.has(wsId)) {
        accountsByWorkspace.set(wsId, [])
      }
      accountsByWorkspace.get(wsId).push(account)
    })

    // Attach accounts to workspaces
    workspaces.forEach(workspace => {
      const workspaceId = workspace._id
      const accounts = accountsByWorkspace.get(workspaceId) || []
      workspace.instagramAccounts = accounts
    })

    // Add cache headers for browser caching (1 minute)
    return NextResponse.json(workspaces, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30'
      }
    })
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
