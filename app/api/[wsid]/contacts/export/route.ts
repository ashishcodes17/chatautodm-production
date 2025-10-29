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

export async function GET(
  request: NextRequest,
  { params }: { params: { wsid: string } }
) {
  try {
    const user = await getUser(request)
    const { wsid } = params
    const { searchParams } = new URL(request.url)

    const instagramUserId = searchParams.get("instagramUserId")
    const format = searchParams.get("format") || "json"

    if (!instagramUserId) {
      return NextResponse.json(
        { error: "Instagram User ID is required" },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    const contacts = await db
      .collection("contacts")
      .find({
        workspaceId: wsid,
        instagramUserId,
        userId: user._id, // ✅ only fetch user’s data
      })
      .sort({ lastInteraction: -1 })
      .toArray()

    if (format === "csv") {
      // Fixed headers
      const csvHeaders = [
        "Username",
        "Sender ID",
        "First Interaction",
        "Last Interaction",
        "Last Interaction Type",
        "Total Interactions",
        "Last Automation",
      ]

      // Map contacts into rows
      const csvRows = contacts.map((contact) => [
        contact.senderUsername || "N/A",
        contact.senderId,
        contact.firstInteraction
          ? new Date(contact.firstInteraction).toISOString()
          : "N/A",
        contact.lastInteraction
          ? new Date(contact.lastInteraction).toISOString()
          : "N/A",
        contact.lastInteractionType || "N/A",
        contact.totalInteractions ?? 0,
        contact.lastAutomationName || "N/A",
      ])

      // Build CSV string
      const csvData = [
        csvHeaders.join(","), // header row
        ...csvRows.map((row) =>
          row.map((value) => JSON.stringify(value)).join(",")
        ),
      ].join("\n")

      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="contacts-${wsid}.csv"`,
        },
      })
    }

    // Default JSON response
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error in GET /contacts:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
