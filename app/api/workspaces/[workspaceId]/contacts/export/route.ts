import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instagramUserId = searchParams.get("instagramUserId")
    const format = searchParams.get("format") || "json"

    if (!instagramUserId) {
      return NextResponse.json({ error: "Instagram User ID is required" }, { status: 400 })
    }

    const db = await getDatabase()

    const contacts = await db.collection("contacts").find({ instagramUserId }).sort({ lastInteraction: -1 }).toArray()

    if (format === "csv") {
      // Convert to CSV
      const csvHeaders = [
        "Sender ID",
        "Username",
        "First Interaction",
        "Last Interaction",
        "Last Interaction Type",
        "Last Automation",
        "Total Interactions",
      ]

      const csvRows = contacts.map((contact) => [
        contact.senderId,
        contact.senderUsername || "N/A",
        contact.firstInteraction?.toISOString() || "",
        contact.lastInteraction?.toISOString() || "",
        contact.lastInteractionType || "",
        contact.lastAutomationName || "",
        contact.totalInteractions || 0,
      ])

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n")

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="contacts-${instagramUserId}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Return JSON format
    return NextResponse.json({
      contacts,
      exportedAt: new Date().toISOString(),
      totalCount: contacts.length,
    })
  } catch (error) {
    console.error("❌ Error exporting contacts:", error)
    return NextResponse.json({ error: "Failed to export contacts" }, { status: 500 })
  }
}
