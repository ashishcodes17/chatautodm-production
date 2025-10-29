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

export async function GET(request: NextRequest, { params }: { params: { wsid: string } }) {
  try {
    const user = await getUser(request)
    const { wsid } = params

    const db = await getDatabase()

    const workspace = await db.collection("workspaces").findOne({
      _id: wsid,
      userId: user._id,
    })

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    if (!workspace.instagramUserId) {
      return NextResponse.json({ error: "Instagram account not connected to this workspace" }, { status: 400 })
    }

    const instagramUserId = workspace.instagramUserId

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "lastInteraction"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query: any = { instagramUserId }

    if (search) {
      query.$or = [
        { senderUsername: { $regex: search, $options: "i" } },
        { senderId: { $regex: search, $options: "i" } },
        { lastAutomationName: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Get contacts with pagination
    const contacts = await db.collection("contacts").find(query).sort(sort).skip(skip).limit(limit).toArray()

    // Get total count for pagination
    const totalCount = await db.collection("contacts").countDocuments(query)

    // Get interaction stats
    const stats = await db
      .collection("contacts")
      .aggregate([
        { $match: { instagramUserId } },
        {
          $group: {
            _id: null,
            totalContacts: { $sum: 1 },
            totalInteractions: { $sum: "$totalInteractions" },
            avgInteractions: { $avg: "$totalInteractions" },
          },
        },
      ])
      .toArray()

    const contactStats = stats[0] || {
      totalContacts: 0,
      totalInteractions: 0,
      avgInteractions: 0,
    }

    return NextResponse.json({
      contacts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      stats: contactStats,
    })
  } catch (error) {
    console.error("❌ Error fetching contacts:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")
    const instagramUserId = searchParams.get("instagramUserId")

    if (!contactId || !instagramUserId) {
      return NextResponse.json({ error: "Contact ID and Instagram User ID are required" }, { status: 400 })
    }

    const db = await getDatabase()

    const result = await db.collection("contacts").deleteOne({
      _id: contactId,
      instagramUserId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Contact deleted successfully" })
  } catch (error) {
    console.error("❌ Error deleting contact:", error)
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}
