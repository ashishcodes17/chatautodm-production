import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDatabase } from "@/lib/mongodb"

type WorkspaceDoc = {
  _id: string
  userId: string
  name?: string
  createdAt?: Date
}

type FeedbackDoc = {
  _id: string
  message: string
  userId: string
  username: string
  workspaceId: string | null
  createdAt: Date
  meta?: {
    userAgent?: string
    referer?: string
  }
}

function getUserFromCookie() {
  const cookieStore = cookies()
  const userSession = cookieStore.get("user_session")
  if (!userSession) return null
  try {
    return JSON.parse(userSession.value)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { message, workspaceId }: { message?: string; workspaceId?: string | null } = await request.json()
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Determine workspace: use provided one if it belongs to user, else pick latest user's workspace
    let finalWorkspaceId: string | null = null
    const workspacesCol = db.collection<WorkspaceDoc>("workspaces")
    if (workspaceId) {
      const own = await workspacesCol.findOne({ _id: workspaceId, userId: user._id } as Partial<WorkspaceDoc>)
      if (own) finalWorkspaceId = own._id
    }
    if (!finalWorkspaceId) {
      const latest = await workspacesCol
        .find({ userId: user._id } as Partial<WorkspaceDoc>)
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray()
      if (latest[0]?._id) finalWorkspaceId = latest[0]._id
    }

    const payload: FeedbackDoc = {
      _id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      message: message.trim(),
      userId: String(user._id),
      username: String(user.name || user.email || "user"),
      workspaceId: finalWorkspaceId,
      createdAt: new Date(),
      meta: {
        userAgent: request.headers.get("user-agent") || undefined,
        referer: request.headers.get("referer") || undefined,
      },
    }

    await db.collection<FeedbackDoc>("feedback").insertOne(payload)
    return NextResponse.json({ success: true, id: payload._id })
  } catch (e) {
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
  }
}
