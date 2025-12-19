import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getClient, isFactoryInitialized } from "@/lib/redis-factory"

const ADMIN_EMAILS = [
  "ashishgampala@gmail.com",
  "ashishgamer473@gmail.com",
]

// POST - Clear all workspace cache
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userSession = cookieStore.get("user_session")

    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userSession.value)

    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    if (!isFactoryInitialized()) {
      return NextResponse.json({ error: "Redis not initialized" }, { status: 500 })
    }

    const client = getClient("cache")
    if (!client) {
      return NextResponse.json({ error: "Redis client not available" }, { status: 500 })
    }

    // Get all workspace keys
    const workspaceKeys = await client.keys('workspace:*')
    
    console.log(`🗑️ Found ${workspaceKeys.length} workspace cache entries to clear`)
    
    // Delete all workspace keys
    if (workspaceKeys.length > 0) {
      await client.del(workspaceKeys)
      console.log(`✅ Cleared ${workspaceKeys.length} workspace cache entries`)
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${workspaceKeys.length} workspace cache entries`,
      cleared: workspaceKeys.length
    })
  } catch (error) {
    console.error("Failed to clear cache:", error)
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 })
  }
}
