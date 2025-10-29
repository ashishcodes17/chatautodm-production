import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instagramUserId = searchParams.get("instagramUserId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "lastInteraction"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    if (!instagramUserId) {
      return NextResponse.json({ error: "Instagram User ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
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
