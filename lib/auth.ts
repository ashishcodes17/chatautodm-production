import { cookies } from "next/headers"
import { getDatabase } from "@/lib/mongodb"

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const userSession = cookieStore.get("user_session")?.value

    if (!userSession) {
      return null
    }

    // Parse the user data directly from the cookie (Google OAuth system)
    const user = JSON.parse(userSession)
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
export async function getCurrentUserFixed() {
  try {
    const cookieStore = cookies()
    const userSession = cookieStore.get("user_session")?.value

    if (!userSession) return null

    const user = JSON.parse(userSession)

    // Normalize IDs
    const normalizedUser = {
      ...user,
      userId: user.userId || user._id || user.id,
    }

    return normalizedUser
  } catch (error) {
    console.error("Error getting fixed current user:", error)
    return null
  }
}
export async function createSession(userId: string) {
  try {
    const db = await getDatabase()
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await db.collection("sessions").insertOne({
      token: sessionToken,
      userId,
      expiresAt,
      createdAt: new Date(),
    })

    return sessionToken
  } catch (error) {
    console.error("Error creating session:", error)
    return null
  }
}

export async function deleteSession(sessionToken: string) {
  try {
    const db = await getDatabase()
    await db.collection("sessions").deleteOne({ token: sessionToken })
    return true
  } catch (error) {
    console.error("Error deleting session:", error)
    return false
  }
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)

}
export async function verifyWorkspaceAccess(workspaceId: string, userId: string) {
  try {
    const db = await getDatabase()
    console.log("🔍 [VERIFY ACCESS] Looking for workspace:", { _id: workspaceId, userId: userId })
    
    const workspace = await db.collection("workspaces").findOne({
      _id: workspaceId,
      userId: userId, // Verify the user owns this workspace
    })
    
    console.log("🔍 [VERIFY ACCESS] Found workspace:", workspace ? "YES" : "NO")
    if (!workspace) {
      // Let's also check what workspaces exist for this user
      const userWorkspaces = await db.collection("workspaces").find({ userId: userId }).toArray()
      console.log("🔍 [VERIFY ACCESS] User's workspaces:", userWorkspaces.map(w => ({ _id: w._id, userId: w.userId })))
    }
    
    return !!workspace
  } catch (error) {
    console.error("Error verifying workspace access:", error)
    return false
  }
}
