"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUserFixed } from "@/lib/auth"
import { ObjectId } from "mongodb"

// Helpers duplicated from create route to keep schema consistent on update
function ensureHttps(url: string): string {
  if (!url) return url as any
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  return `https://${url}`
}

function transformButtons(buttons: any[], context?: { username?: string }): any[] {
  if (!Array.isArray(buttons)) return []
  return buttons.slice(0, 3).map((button: any, index: number) => {
    if (button?.link) {
      return {
        type: "web_url",
        title: button.text || `Button ${index + 1}`,
        url: ensureHttps(button.link),
      }
    } else if (button?.type === "profile") {
      const profileUrl = context?.username ? `https://instagram.com/${context.username}` : "https://instagram.com"
      return {
        type: "web_url",
        title: button.text || "Visit Profile",
        url: profileUrl,
      }
    } else if (button?.type === "confirm") {
      return {
        type: "postback",
        title: button.text || "I'm following ✅",
        payload: "CONFIRM_FOLLOW",
      }
    } else {
      return {
        type: "postback",
        title: button?.text || `Button ${index + 1}`,
        payload: button?.payload || `BUTTON_${index + 1}`,
      }
    }
  })
}

// 🟢 GET — Fetch single automation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFixed()
    console.log("Current user full object:", user)

    if (!user) {
      console.warn("Unauthorized fetch attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const db = await getDatabase()
    const automation = await db.collection("automations").findOne({ _id: new ObjectId(id) })

    if (!automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 })
    }

    const workspace = await db.collection("workspaces").findOne({
      _id: automation.workspaceId,
      userId: user.userId,
    })

    if (!workspace) {
      console.warn("Access denied: user does not own this workspace")
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    console.log("✅ Automation fetched successfully:", automation._id)
    return NextResponse.json({ success: true, automation })
  } catch (error) {
    console.error("Error fetching automation:", error)
    return NextResponse.json({ error: "Failed to fetch automation" }, { status: 500 })
  }
}

// 🔴 DELETE — Remove automation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFixed()
    console.log("Current user full object:", user)

    if (!user) {
      console.warn("Unauthorized delete attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const db = await getDatabase()

    const automation = await db.collection("automations").findOne({ _id: new ObjectId(id) })
    if (!automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 })
    }

    const workspace = await db.collection("workspaces").findOne({
      _id: automation.workspaceId,
      userId: user.userId,
    })

    if (!workspace) {
      console.warn("Access denied: user does not own this workspace")
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const result = await db.collection("automations").deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete automation" }, { status: 500 })
    }

    console.log("✅ Automation deleted successfully:", id)
    return NextResponse.json({ success: true, message: "Automation deleted successfully" })
  } catch (error) {
    console.error("Error deleting automation:", error)
    return NextResponse.json({ error: "Failed to delete automation" }, { status: 500 })
  }
}

// 🟠 PATCH — Update automation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFixed()
    console.log("Current user full object:", user)

    if (!user) {
      console.warn("Unauthorized update attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const updates = await request.json()
    const db = await getDatabase()

    const automation = await db.collection("automations").findOne({ _id: new ObjectId(id) })
    if (!automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 })
    }

    const workspace = await db.collection("workspaces").findOne({
      _id: automation.workspaceId,
      userId: user.userId,
    })

    if (!workspace) {
      console.warn("Access denied: user does not own this workspace")
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Compute username context for profile buttons
    let username: string | undefined = undefined
    try {
      const account = await db.collection("instagram_accounts").findOne({ workspaceId: automation.workspaceId, userId: workspace.userId })
      username = account?.username || workspace?.username
    } catch (e) {
      // non-fatal
    }

    // Map builder-style payload into persisted schema expected by webhooks
    const setDoc: any = { updatedAt: new Date() }

    if (typeof updates.name === "string") setDoc.name = updates.name
    if (typeof updates.type === "string") setDoc.type = updates.type
    if (Object.prototype.hasOwnProperty.call(updates, "isActive")) setDoc.isActive = !!updates.isActive

    // Map postId -> selectedPost when provided
    if (Object.prototype.hasOwnProperty.call(updates, "postId")) {
      setDoc.selectedPost = updates.postId ?? null
    }

    // Map storyId -> selectedStory when provided
    if (Object.prototype.hasOwnProperty.call(updates, "storyId")) {
      setDoc.selectedStory = updates.storyId ?? null
    }

    // Trigger mapping
    if (updates?.trigger) {
      const anyReply = !!updates.trigger.anyReply
      const keywords = Array.isArray(updates.trigger.keywords) ? updates.trigger.keywords : []
      setDoc.trigger = {
        keywordMode: anyReply ? "any_reply" : "specific_keywords",
        triggerKeywords: keywords,
        keywords,
      }
    }

    // Actions mapping
    if (updates?.actions) {
      const a = updates.actions
      setDoc.actions = {
        reaction: { enabled: !!a.reactHeart },
        publicReply: {
          enabled: !!a.publicReply?.enabled,
          replies: Array.isArray(a.publicReply?.replies) ? a.publicReply.replies : [],
        },
        openingDM: {
          enabled: !!a.openingDM?.enabled,
          message: a.openingDM?.message || "",
          buttons: transformButtons(a.openingDM?.buttons || [], { username }),
        },
        askFollow: {
          enabled: !!a.askFollow,
          message: a.followMessage || "",
          buttons: transformButtons(a.followButtons || [], { username }),
        },
        askEmail: {
          enabled: !!a.askEmail,
          message: a.emailMessage || "Please share your email address so I can send you updates! 📧",
          buttons: transformButtons(a.emailButtons || [], { username }),
        },
        sendDM: {
          enabled: true,
          message: a.sendDM?.message || "",
          buttons: transformButtons(a.sendDM?.buttons || [], { username }),
        },
        // keep followUp if it already exists to avoid accidental removal
        ...(automation.actions?.followUp ? { followUp: automation.actions.followUp } : {}),
      }
    }

    const updateResult = await db.collection("automations").updateOne(
      { _id: new ObjectId(id) },
      { $set: setDoc }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 })
    }

    console.log("✅ Automation updated successfully:", id)
    return NextResponse.json({ success: true, message: "Automation updated successfully" })
  } catch (error) {
    console.error("Error updating automation:", error)
    return NextResponse.json({ error: "Failed to update automation" }, { status: 500 })
  }
}

