import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

function ensureHttps(url: string): string {
  if (!url) return url
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  return `https://${url}`
}

function transformButtons(buttons: any[], account?: any): any[] {
  if (!Array.isArray(buttons)) return []

  return buttons.slice(0, 3).map((button, index) => {
    if (button.link) {
      return {
        type: "web_url",
        title: button.text || `Button ${index + 1}`,
        url: ensureHttps(button.link),
      }
    } else if (button.type === "profile") {
      const profileUrl = account?.username ? `https://instagram.com/${account.username}` : "https://instagram.com"
      return {
        type: "web_url",
        title: button.text || "Visit Profile",
        url: profileUrl,
      }
    } else if (button.type === "confirm") {
      return {
        type: "postback",
        title: button.text || "I'm following ✅",
        payload: "CONFIRM_FOLLOW",
      }
    } else {
      return {
        type: "postback",
        title: button.text || `Button ${index + 1}`,
        payload: button.payload || `BUTTON_${index + 1}`,
      }
    }
  })
}

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    console.log("DM flow API called with workspaceId:", params.workspaceId)

    const user = await getCurrentUser(request)
    if (!user) {
      console.log("[v0] Unauthorized user")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = params
    const automation = await request.json()

    console.log(" Received automation data:", JSON.stringify(automation, null, 2))

    const db = await getDatabase()

    // ✅ Step 1: Verify workspace ownership
    const workspace = await db.collection("workspaces").findOne({
      _id: workspaceId, // workspace primary key
      userId: user.id,
    })

    if (!workspace) {
      console.log(" Workspace not found for:", workspaceId, "user:", user.id)
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 })
    }

    console.log(" Found workspace:", workspace._id)

    // ✅ Step 2: Get IG account from instagram_accounts
    const account = await db.collection("instagram_accounts").findOne({
      workspaceId,
      userId: user.id,
    })

    if (!account) {
      console.log(" Instagram account not found for workspace:", workspaceId)
      return NextResponse.json({ success: false, error: "Instagram account not found" }, { status: 404 })
    }

    let workspaceUsername = account.username

    // ✅ Step 3: Fallback to Graph API if username missing
    if (!workspaceUsername && account.instagramUserId && account.accessToken) {
      try {
        const response = await fetch(
          `https://graph.instagram.com/v21.0/${account.instagramUserId}?fields=username,name&access_token=${account.accessToken}`,
        )
        const userData = await response.json()
        if (response.ok && userData.username) {
          workspaceUsername = userData.username
          // ✅ FIX: Always update DB with fetched username
          await db
            .collection("instagram_accounts")
            .updateOne({ _id: account._id }, { $set: { username: userData.username, updatedAt: new Date() } })
        }
      } catch (error) {
        console.error("❌ Error fetching Instagram username:", error)
      }
    }

    // ✅ Step 4: Build automation object
    const DMAutomation = {
      ...automation,
      workspaceId,
      instagramUserId: account.instagramUserId, // from instagram_accounts
      type: "dm_reply_flow",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      trigger: {
        keywordMode: automation.keywordMode || "any_comment",
        keywords: automation.keywords || [],
      },
      actions: {
        publicReplies: automation.actions?.publicReplies || { enabled: false, replies: [] },
        sendDM: {
          ...automation.actions?.sendDM,
          buttons: transformButtons(automation.actions?.sendDM?.buttons || [], { username: workspaceUsername }),
        },
        openingDM: {
          ...automation.actions?.openingDM,
          buttons: transformButtons(automation.actions?.openingDM?.buttons || [], { username: workspaceUsername }),
        },
        askFollow: {
          enabled: automation.actions?.askToFollow || false,
          message: automation.actions?.followMessage || "Please follow my account to continue! 🙏",
          buttons: transformButtons(automation.actions?.followButtons || [], { username: workspaceUsername }),
        },
        askEmail: {
          enabled: automation.actions?.askForEmails || false,
          message: automation.actions?.emailMessage || "Please share your email address so I can send you updates! 📧",
          buttons: transformButtons(automation.actions?.emailButtons || [], { username: workspaceUsername }),
        },
        reactHeart: automation.actions?.reactHeart || false,
      },
    }

    console.log(" Saving DM automation:", JSON.stringify(DMAutomation, null, 2))

    // ✅ Step 5: Save automation
    const result = await db.collection("automations").insertOne(DMAutomation)

    console.log("DM automation saved with ID:", result.insertedId)

    return NextResponse.json({
      success: true,
      automationId: result.insertedId,
      message: "DM automation created successfully",
    })
  } catch (error) {
    console.error("[v0] Error creating comment automation:", error)
    return NextResponse.json({ success: false, error: "Failed to create automation" }, { status: 500 })
  }
}
