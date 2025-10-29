import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // ❌ removed default "story_reply_flow"

    const db = await getDatabase()

    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId } as any)
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // ✅ Build flexible filter
    const filter: any = {
      workspaceId,
      instagramUserId: workspace.instagramUserId,
    }

    if (type) {
      filter.type = type // only filter if explicitly provided
    }

    const automations = await db.collection("automations").find(filter).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      automations,
      user: {
        username: workspace.username,
        instagramUserId: workspace.instagramUserId,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching automations:", error)
    return NextResponse.json({ error: "Failed to fetch automations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params
    const body = await request.json()

    console.log("📥 Received automation data:", JSON.stringify(body, null, 2))

    const db = await getDatabase()
    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId } as any)

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // 🆕 NEXT POST LOGIC: Create media snapshot if this is a "Next Post" automation
    let snapshotId = null
    if (body.isNextPost === true || body.postId === "NEXT_POST") {
      console.log("🔄 [Next Post] Creating media snapshot before automation...")
      console.log("🔄 [Next Post] Workspace data:", { 
        workspaceId, 
        userId: workspace.userId,
        instagramUserId: workspace.instagramUserId,
        hasAccessToken: !!workspace.accessToken 
      })
      
      try {
        // Try to get access token from instagram_accounts or workspace
        const igAccount = await db.collection("instagram_accounts").findOne({
          workspaceId,
          userId: workspace.userId,
        } as any)

        console.log("🔄 [Next Post] IG Account found:", !!igAccount)
        console.log("🔄 [Next Post] IG Account has token:", !!igAccount?.accessToken)

        // Use token from instagram_accounts or fallback to workspace
        const accessToken = igAccount?.accessToken || workspace.accessToken
        const instagramUserId = igAccount?.instagramUserId || workspace.instagramUserId

        if (accessToken && instagramUserId) {
          console.log("🔄 [Next Post] Fetching media with Instagram User ID:", instagramUserId)
          
          // Fetch all current media IDs
          let allMediaIds: string[] = []
          // Use /me/media endpoint (works with user access token)
          let mediaUrl = `https://graph.instagram.com/me/media?fields=id&access_token=${accessToken}`

          while (mediaUrl) {
            console.log("🔄 [Next Post] Fetching page:", mediaUrl.substring(0, 100) + "...")
            const mediaRes = await fetch(mediaUrl)
            const mediaJson = await mediaRes.json()

            if (!mediaJson.error) {
              const mediaIds = (mediaJson.data || []).map((m: any) => m.id)
              allMediaIds = allMediaIds.concat(mediaIds)
              console.log(`🔄 [Next Post] Fetched ${mediaIds.length} media IDs, total: ${allMediaIds.length}`)
              mediaUrl = mediaJson.paging?.next || null
            } else {
              console.error("❌ [Next Post] Instagram API error:", mediaJson.error)
              break
            }
          }

          // Store snapshot
          const snapshot = {
            workspaceId,
            userId: workspace.userId,
            instagramUserId: workspace.instagramUserId,
            media_ids: allMediaIds,
            totalCount: allMediaIds.length,
            createdAt: new Date(),
          }

          const snapshotResult = await db.collection("userMedia").insertOne(snapshot as any)
          snapshotId = snapshotResult.insertedId
          
          console.log(`✅ [Next Post] Created snapshot with ${allMediaIds.length} media IDs (ID: ${snapshotId})`)
          
          // Verify snapshot was actually created
          if (!snapshotId || allMediaIds.length === 0) {
            console.warn("⚠️ [Next Post] Snapshot created but may be empty or invalid")
          }
        } else {
          console.error("❌ [Next Post] Missing accessToken or instagramUserId")
          console.error("❌ [Next Post] accessToken exists:", !!accessToken)
          console.error("❌ [Next Post] instagramUserId:", instagramUserId)
          
          // For Next Post automation, snapshot is REQUIRED
          return NextResponse.json({ 
            success: false, 
            error: "Cannot create Next Post automation: Instagram account not properly connected" 
          }, { status: 400 })
        }
      } catch (snapshotError) {
        console.error("❌ [Next Post] Failed to create snapshot:", snapshotError)
        
        // For Next Post automation, snapshot creation failure should be fatal
        return NextResponse.json({ 
          success: false, 
          error: "Failed to create media snapshot for Next Post automation" 
        }, { status: 500 })
      }
    }

    const instagramAccount = await db.collection("instagram_accounts").findOne({
      workspaceId,
      userId: workspace.userId,
    } as any)

    let workspaceUsername = instagramAccount?.username
    if (!workspaceUsername && workspace.instagramUserId && workspace.accessToken) {
      try {
        const response = await fetch(
          `https://graph.instagram.com/v21.0/${workspace.instagramUserId}?fields=username,name&access_token=${workspace.accessToken}`,
        )
        const userData = await response.json()
        if (response.ok && userData.username) {
          workspaceUsername = userData.username
          await db
            .collection("instagram_accounts")
            .updateOne(
              { workspaceId, userId: workspace.userId } as any,
              { $set: { username: userData.username, updatedAt: new Date() } },
            )
        }
      } catch (error) {
        console.error("❌ Error fetching Instagram username:", error)
      }
    }

    const automationType =
      body.type === "dm_automation"
        ? "dm_automation"
        : body.type || (body.postId ? "comment_reply_flow" : "story_reply_flow")

    const automation = {
      workspaceId,
      instagramUserId: workspace.instagramUserId,
      name:
        body.name ||
        `${automationType === "comment_reply_flow" ? "Comment" : automationType === "dm_automation" ? "DM" : "Story"} Automation ${Date.now()}`,
      type: automationType,
      selectedStory: body.storyId,
      selectedPost: body.postId === "NEXT_POST" ? null : body.postId, // Don't store "NEXT_POST" as selectedPost
      isNextPost: body.isNextPost === true || body.postId === "NEXT_POST", // 🆕 Flag for next post automations
      snapshotId: snapshotId, // 🆕 Link to media snapshot

      trigger: {
        keywordMode: body.trigger?.anyReply ? "any_reply" : "specific_keywords",
        triggerKeywords: body.trigger?.keywords || [],
        keywords: body.trigger?.keywords || [], // Fallback for compatibility
      },

      actions: {
        reaction: {
          enabled: body.actions?.reactHeart || false,
        },

        publicReply: {
          enabled: body.actions?.publicReply?.enabled || false,
          replies: body.actions?.publicReply?.replies || [],
        },

        openingDM: {
          enabled: body.actions?.openingDM?.enabled || false,
          message: body.actions?.openingDM?.message || "",
          image_url: body.actions?.openingDM?.image_url || null, // 🆕 Image URL support
          buttons: transformButtons(body.actions?.openingDM?.buttons || [], { username: workspaceUsername }),
        },

        askFollow: {
          enabled: body.actions?.askFollow || false,
          message: body.actions?.followMessage || "",
          buttons: transformButtons(body.actions?.followButtons || [], { username: workspaceUsername }),
        },

        askEmail: {
          enabled: body.actions?.askEmail || false,
          message: body.actions?.emailMessage || "Please share your email address so I can send you updates! 📧",
          buttons: transformButtons(body.actions?.emailButtons || [], { username: workspaceUsername }),
        },

        sendDM: {
          enabled: true,
          message: body.actions?.sendDM?.message || "",
          image_url: body.actions?.sendDM?.image_url || null, // 🆕 Image URL support
          buttons: transformButtons(body.actions?.sendDM?.buttons || [], { username: workspaceUsername }),
        },

        followUp: {
          enabled: false, // Can be enabled later
          message: "",
          delay: 300000, // 5 minutes default
        },
      },

      isActive: body.isActive ?? true, // respect incoming status
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("🔄 Transformed automation:", JSON.stringify(automation, null, 2))

    const result = await db.collection("automations").insertOne(automation as any)

    return NextResponse.json({
      success: true,
      automationId: result.insertedId,
      automation: { ...automation, _id: result.insertedId },
      snapshotId: snapshotId, // Return snapshot ID for reference
    })
  } catch (error) {
    console.error("❌ Error creating automation:", error)
    return NextResponse.json({ error: "Failed to create automation" }, { status: 500 })
  }
}

// Helper function to transform buttons from story builder format to webhook format
function transformButtons(buttons: any[], workspace?: any): any[] {
  if (!Array.isArray(buttons)) return []

  return buttons.slice(0, 3).map((button, index) => {
    if (button.link) {
      return {
        type: "web_url",
        title: button.text || `Button ${index + 1}`,
        url: ensureHttps(button.link), // Ensure proper URL format
      }
    } else if (button.type === "profile") {
      const profileUrl = workspace?.username ? `https://instagram.com/${workspace.username}` : "https://instagram.com"
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

// Helper function to ensure URLs start with https
function ensureHttps(url: string): string {
  if (!url) return url
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  return `https://${url}`
}
