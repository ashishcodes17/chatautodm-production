import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"

// Instagram Webhook endpoint (Meta Graph API)
// High-level map:
// - GET: Verification handshake from Meta (hub.challenge)
// - POST: Receives events for messages, story replies, and comments
//   • Messaging events -> processMessagingEvent -> processDMAutomationsEnhanced
//     - DM Auto Responder (type: "dm_automation")
//     - Generic Template DM (type: "generic_dm_automation")
//   • Story replies -> handleStoryReply -> processStory automations (type: "story_reply_flow")
//   • Comment changes -> handleBusinessLoginComment -> comment-to-DM automations (type: "comment_reply_flow")

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "verify_token_123"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    console.log("📥 Webhook verification:", { mode, token, challenge })

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified successfully")
      return new Response(challenge || "", { status: 200 })
    } else {
      console.error("❌ Invalid verification token or mode")
      return new Response("Verification failed", { status: 403 })
    }
  } catch (error) {
    console.error("❌ Webhook verification error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

// Resolve the business account/workspace given an Instagram ID present in the webhook entry
async function findAccountByInstagramId(instagramId: string, db: any) {
  console.log(`🔍 [DEBUG] Searching for Instagram ID: ${instagramId}`)

  // Try direct account lookup first with both ID fields
  const account = await db.collection("instagram_accounts").findOne({
    $or: [{ instagramUserId: instagramId }, { instagramProfessionalId: instagramId }],
  })

  if (account) {
    console.log(`🔍 [DEBUG] Found account:`, {
      id: account._id,
      instagramUserId: account.instagramUserId,
      instagramProfessionalId: account.instagramProfessionalId,
      username: account.username,
    })
    return account
  }

  // Try workspace lookup as fallback with comprehensive search
  const workspace = await db.collection("workspaces").findOne({
    $or: [
      { instagramUserId: instagramId },
      { instagramProfessionalId: instagramId },
      { "instagramAccount.instagramUserId": instagramId },
      { "instagramAccount.instagramProfessionalId": instagramId },
    ],
  })

  if (workspace) {
    console.log(`🔍 [DEBUG] Found workspace:`, workspace.name)
    return {
      instagramUserId: workspace.instagramUserId || workspace.instagramAccount?.instagramUserId,
      instagramProfessionalId: workspace.instagramProfessionalId || workspace.instagramAccount?.instagramProfessionalId,
      accessToken: workspace.accessToken || workspace.instagramAccount?.accessToken,
      workspaceId: workspace._id,
      username: workspace.name?.replace("@", "") || workspace.username,
    }
  }

  console.log(`❌ No account found for Instagram ID: ${instagramId}`)
  return null
}

// Webhook entrypoint for POST events from Instagram
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    console.log("📥 === WEBHOOK RECEIVED ===")
    console.log("📥 Raw webhook body:", rawBody)

    let data
    try {
      data = JSON.parse(rawBody)
    } catch (parseError) {
      console.error("❌ Failed to parse webhook payload:", parseError)
      return new Response("OK", { status: 200 })
    }

    console.log("📨 Parsed webhook data:", JSON.stringify(data, null, 2))

    const db = await getDatabase()

    // Log webhook to database
    const webhookLog = {
      timestamp: new Date(),
      type: "instagram_webhook",
      data: data,
      processed: false,
      rawBody: rawBody.substring(0, 1000),
      headers: {
        "content-type": request.headers.get("content-type"),
        "user-agent": request.headers.get("user-agent"),
        "x-hub-signature": request.headers.get("x-hub-signature"),
      },
    }

    const webhookResult = await db.collection("webhook_logs").insertOne(webhookLog)
    console.log("📝 Webhook logged to database")

  // Process Instagram webhook
    if (data.object === "instagram" && data.entry) {
      console.log("🚀 Processing Instagram webhook entries:", data.entry.length)

      for (const entry of data.entry) {
        console.log(`📝 Processing entry for account: ${entry.id}`)

        const account = await findAccountByInstagramId(entry.id, db)
        if (!account) {
          console.log(`❌ No account found for Instagram ID: ${entry.id}`)
          continue
        }

        console.log(`✅ Found account: ${account.username} (${account.instagramUserId})`)

  // Handle messaging events
  // These are DMs or replies that come via the Messaging API
        if (entry.messaging) {
          console.log("💬 Found messaging events:", entry.messaging.length)
          for (const messagingEvent of entry.messaging) {
            if (
              messagingEvent.message?.is_echo ||
              messagingEvent.sender?.id === entry.id ||
              messagingEvent.sender?.id === account.instagramUserId ||
              messagingEvent.sender?.id === account.instagramProfessionalId
            ) {
              console.log("⚠️ Skipping echo message or business account message")
              continue
            }

            console.log("💬 Processing messaging event:", JSON.stringify(messagingEvent, null, 2))

            // Check for postback (Button clicks)
            if (messagingEvent.postback) {
              console.log("🔘 Processing postback")
              await handlePostback(messagingEvent, entry.id, db)
            }
            // Check for quick reply
            else if (messagingEvent.message?.quick_reply) {
              console.log("⚡ Processing quick reply")
              await handleQuickReply(messagingEvent, entry.id, db)
            }
            // Check if this is a story reply
            else if (messagingEvent.message?.reply_to?.story) {
              console.log("📱 Processing story reply")
              await handleStoryReply(messagingEvent, entry.id, db)
            } else {
              // Regular DM message (not echo, not postback/quick-reply, not story)
              // -> Downstream, this will evaluate DM automations and trigger either
              //    - plain DM Auto Responder, or
              //    - Generic Template DM (if configured)
              await processMessagingEvent(messagingEvent, entry.id, db)
            }
          }
        }

        // Handle changes (comments)
        // Feed and Reel comment events arrive here under entry.changes
        // If matched and not from the business itself, we route into comment-to-DM logic
        if (entry.changes) {
          console.log("🔄 Found changes:", entry.changes.length)
          for (const change of entry.changes) {
            console.log("🔄 Change:", JSON.stringify(change, null, 2))
            if (change.field === "comments") {
              // Defensive checks to avoid reply loops when our system posts comments
              const from = change?.value?.from || {}
              const fromId = from.id
              const fromUsername = from.username
              const fromSelfScoped = from.self_ig_scoped_id || change?.value?.from?.self_ig_scoped_id
              const isSelfFlag = change?.value?.is_self || from.is_self || false

              const businessIds = [
                account.instagramUserId,
                account.instagramProfessionalId,
                account.instagramAccount?.instagramUserId,
                account.instagramAccount?.instagramProfessionalId,
              ].filter(Boolean)

              // Skip if it's marked self / echo
              if (isSelfFlag) {
                console.log("⚠️ Skipping comment change because it's marked self/is_self")
                continue
              }

              // Skip if from ID matches any known business IDs
              if (fromId && businessIds.includes(fromId)) {
                console.log("⚠️ Skipping comment change authored by business account id:", fromId)
                continue
              }

              // Skip if username matches business username
              if (fromUsername && account.username && fromUsername.toLowerCase() === account.username.toLowerCase()) {
                console.log("⚠️ Skipping comment change authored by business username:", fromUsername)
                continue
              }

              // Skip if self-scoped id matches (some payloads include this)
              if (fromSelfScoped && (fromSelfScoped === account.self_ig_scoped_id || fromSelfScoped === account.instagramProfessionalId)) {
                console.log("⚠️ Skipping comment change authored by business self-scoped id:", fromSelfScoped)
                continue
              }

              console.log("💬 Processing comment change")
              await handleBusinessLoginComment(change.value, entry.id, db)
            }
          }
        }
      }

      // Mark webhook as processed
      await db
        .collection("webhook_logs")
        .updateOne({ _id: webhookResult.insertedId }, { $set: { processed: true, processedAt: new Date() } })
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("💥 Webhook processing error:", error)
    return new Response("OK", { status: 200 })
  }
}

// Handles message.quick_reply payloads (fast responses on buttons)
async function handleQuickReply(messagingEvent: any, accountId: string, db: any) {
  try {
    console.log("⚡ === HANDLING QUICK REPLY ===")
    console.log("⚡ Account ID:", accountId)
    console.log("⚡ Messaging event:", JSON.stringify(messagingEvent, null, 2))

    const senderId = messagingEvent.sender?.id
    const quickReply = messagingEvent.message?.quick_reply
    const messageText = messagingEvent.message?.text || ""

    if (!senderId || !quickReply) {
      console.log("❌ Missing required quick reply data")
      return
    }

    const account = await findAccountByInstagramId(accountId, db)

    if (!account) {
      console.log("❌ No account found for:", accountId)
      return
    }

    // Skip if sender is the business account itself
    if (senderId === account.instagramUserId) {
      console.log("⚠️ Quick reply is from business account, skipping")
      return
    }

    // Store contact for quick reply interaction
    await storeOrUpdateContact(account.instagramUserId, senderId, null, "quick_reply", null, db, account.workspaceId)

    console.log("✅ Quick reply processed successfully")
  } catch (error) {
    console.error("❌ Error handling quick reply:", error)
  }
}

// Generic incoming DM handler (non-story)
// - Checks user state (e.g., awaiting_email)
// - Stores contact
// - Delegates to DM automation engine (processDMAutomationsEnhanced)
async function processMessagingEvent(messagingEvent: any, accountId: string, db: any) {
  try {
    console.log("💬 === PROCESSING MESSAGING EVENT ===")
    console.log("💬 Account ID:", accountId)
    console.log("💬 Messaging event:", JSON.stringify(messagingEvent, null, 2))

    const senderId = messagingEvent.sender?.id
    const messageText = messagingEvent.message?.text || ""

    if (!senderId) {
      console.log("❌ Missing sender ID")
      return
    }

    const account = await findAccountByInstagramId(accountId, db)

    if (!account) {
      console.log("❌ No account found for:", accountId)
      return
    }

    // Skip if sender is the business account itself
    if (senderId === account.instagramUserId) {
      console.log("⚠️ Message is from business account, skipping")
      return
    }

    // Check if user is in a waiting state (e.g., awaiting_email) and handle it before automations
    try {
      const userState = await db.collection("user_states").findOne({ senderId, accountId: account.instagramUserId })
      if (userState && userState.state === "awaiting_email") {
        console.log("📧 Detected awaiting_email state for user, processing email response")
        const messageText = messagingEvent.message?.text?.trim() || ""
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isValidEmail = emailRegex.test(messageText)

        // Load the automation if available
        const automation = userState.automationId
          ? await db.collection("automations").findOne({ _id: userState.automationId })
          : null

        if (isValidEmail) {
          // Store email in contacts
          await db.collection("contacts").updateOne(
            { instagramUserId: account.instagramUserId, senderId },
            {
              $set: {
                email: messageText,
                emailCollectedAt: new Date(),
                updatedAt: new Date(),
              },
            },
            { upsert: true },
          )

          console.log("✅ Valid email stored via awaiting_email handler:", messageText)

          // Send confirmation
          await sendDirectMessage(account.instagramUserId, account.accessToken, senderId, "Thank you! Your email has been saved successfully. 📧")

          // Clear user state
          await db.collection("user_states").deleteOne({ senderId, accountId: account.instagramUserId })

          // Update usage
          try {
            await updateAccountUsage(account, "email_response", automation?.name || "", messageText)
          } catch (e) {
            console.log("⚠️ Failed to update account usage after email:", e)
          }

          // Proceed to main DM if we have the automation
          if (automation) {
            await sendMainDM(automation, account, senderId, db)
          }
        } else {
          // Ask again for a valid email
          console.log("❌ Invalid email received for awaiting_email state:", messageText)
          await sendDirectMessage(
            account.instagramUserId,
            account.accessToken,
            senderId,
            "Please enter a valid email address (e.g., example@email.com) 📧",
          )
          try {
            await updateAccountUsage(account, "email_response", automation?.name || "", messageText)
          } catch (e) {
            console.log("⚠️ Failed to update account usage for invalid email:", e)
          }
        }

        return
      }
    } catch (err) {
      console.error("❌ Error checking user state in processMessagingEvent:", err)
    }

    // Store contact for general message interaction
    // await storeOrUpdateContact(account.instagramUserId, senderId, null, "message", null, db, account.workspaceId)

  // Delegates to DM automations:
  //   • type: "dm_automation" (plain buttons/text)
  //   • type: "generic_dm_automation" (carousel-like Generic Template)
  await processDMAutomationsEnhanced(account, messagingEvent, db)

    console.log("✅ Messaging event processed successfully")
  } catch (error) {
    console.error("❌ Error processing messaging event:", error)
  }
}

// Enhanced Story Reply Handler with new button support
// Enhanced Story Reply handler (story replies from users)
// Routes into story automations (type: "story_reply_flow").
async function handleStoryReply(messagingEvent: any, accountId: string, db: any) {
  try {
    console.log("📱 === HANDLING STORY REPLY ===")
    console.log("📱 Account ID:", accountId)
    console.log("📱 Messaging event:", JSON.stringify(messagingEvent, null, 2))

    const senderId = messagingEvent.sender?.id
    const messageText = messagingEvent.message?.text || ""
    const storyId = messagingEvent.message?.reply_to?.story?.id
    const storyUrl = messagingEvent.message?.reply_to?.story?.url
    const messageId = messagingEvent.message?.mid

    console.log("📱 Extracted data:", {
      senderId,
      messageText,
      storyId,
      storyUrl,
      messageId,
    })

    if (!senderId || !storyId) {
      console.log("❌ Missing required story reply data")
      return
    }

    const account = await findAccountByInstagramId(accountId, db)

    if (!account) {
      console.log("❌ No account found for:", accountId)
      return
    }

    // Skip if sender is the business account itself
    if (senderId === account.instagramUserId) {
      console.log("⚠️ Story reply is from business account, skipping")
      return
    }

    console.log("✅ Found account:", {
      username: account.username,
      instagramUserId: account.instagramUserId,
      plan: account.plan,
    })

    // Store the story reply
    const storyReplyDoc = {
      messageId: messagingEvent.message.mid,
      senderId,
      messageText,
      storyId,
      storyUrl,
      instagramUserId: account.instagramUserId,
      timestamp: new Date(messagingEvent.timestamp || Date.now()),
      processed: false,
      createdAt: new Date(),
    }

    await db.collection("story_replies").insertOne(storyReplyDoc)
    console.log("💾 Story reply stored successfully")

    // Store contact for story reply interaction
    await storeOrUpdateContact(account.instagramUserId, senderId, null, "story_reply", null, db, account.workspaceId)

    // Process story automations with enhanced button support
    await processStoryAutomationsEnhanced(account, messagingEvent, db)
  } catch (error) {
    console.error("❌ Error handling story reply:", error)
  }
}

async function processStoryAutomationsEnhanced(account: any, messagingEvent: any, db: any) {
  try {
    console.log("🔍 === PROCESSING ENHANCED STORY AUTOMATIONS ===")

    const messageText = messagingEvent.message?.text || ""
    const senderId = messagingEvent.sender?.id
    const storyId = messagingEvent.message?.reply_to?.story?.id
    const messageId = messagingEvent.message?.mid

    console.log("🔍 Processing for:", {
      messageText: messageText.substring(0, 50),
      senderId,
      storyId,
      messageId,
      accountId: account.instagramUserId,
    })

    // Find ALL workspaces that contain this Instagram account
    const workspaces: any[] = await db
      .collection("workspaces")
      .find({
        $or: [
          { instagramUserId: account.instagramUserId },
          { instagramProfessionalId: account.instagramUserId },
          { instagramUserId: account.instagramProfessionalId },
          { instagramProfessionalId: account.instagramProfessionalId },
          { "instagramAccount.instagramUserId": account.instagramUserId },
          { "instagramAccount.instagramProfessionalId": account.instagramUserId },
        ],
      })
      .toArray()

    console.log(`✅ Found ${workspaces.length} workspaces for Instagram account`)

    if (workspaces.length === 0) {
      console.log("❌ No workspace found for Instagram account:", account.instagramUserId)
      return
    }

    // Search for automations across ALL workspaces and Instagram IDs
  const workspaceIds = workspaces.map((w: any) => w._id)
    const instagramIds = [
      account.instagramUserId,
      account.instagramProfessionalId,
  ...workspaces.map((w: any) => w.instagramUserId),
  ...workspaces.map((w: any) => w.instagramProfessionalId),
  ...workspaces.map((w: any) => w.instagramAccount?.instagramUserId),
  ...workspaces.map((w: any) => w.instagramAccount?.instagramProfessionalId),
    ].filter(Boolean)

    const storyAutomations = await db
      .collection("automations")
      .find({
        isActive: true,
        $or: [
          { workspaceId: { $in: workspaceIds } },
          { instagramUserId: { $in: instagramIds } },
          { "account.instagramUserId": { $in: instagramIds } },
        ],
        type: "story_reply_flow",
      })
      .toArray()

    console.log(`📋 Found ${storyAutomations.length} total active story automations for account ${account.username}`)
    console.log(`📋 Searching across workspaces: ${workspaceIds.join(", ")}`)
    console.log(`📋 Searching across Instagram IDs: ${instagramIds.join(", ")}`)

    if (storyAutomations.length === 0) {
      console.log("⚠️ No active story automations found")
      return
    }

    const specificStoryAutomations = storyAutomations.filter((automation: any) => automation.selectedStory === storyId)
    const anyStoryAutomations = storyAutomations.filter(
      (automation: any) => !automation.selectedStory || automation.selectedStory === "",
    )

    const automationsToCheck = [...specificStoryAutomations, ...anyStoryAutomations]

    console.log(
      `🎯 Found ${specificStoryAutomations.length} specific story automations and ${anyStoryAutomations.length} any story automations`,
    )

    const keywordSpecificAutomations = []
    const anyReplyAutomations = []

    for (const automation of automationsToCheck) {
      if (automation.trigger?.keywordMode === "specific_keywords") {
        keywordSpecificAutomations.push(automation)
      } else if (automation.trigger?.keywordMode === "any_reply") {
        anyReplyAutomations.push(automation)
      }
    }

    const prioritizedAutomations = [...keywordSpecificAutomations, ...anyReplyAutomations]

    for (const automation of prioritizedAutomations) {
      let shouldTrigger = false

      console.log(`🔍 Checking story automation: ${automation.name} for account: ${account.username}`)
      console.log(`🔍 Automation trigger config:`, JSON.stringify(automation.trigger, null, 2))
      console.log(`🔍 Selected story: ${automation.selectedStory}, Current story: ${storyId}`)

      // Check trigger conditions
      if (automation.trigger?.keywordMode === "any_reply") {
        shouldTrigger = true
        console.log("✅ Story Reply: Triggering on any reply")
      } else if (automation.trigger?.keywordMode === "specific_keywords") {
        const keywords = automation.trigger.triggerKeywords || automation.trigger.keywords || []
        console.log("🔍 Checking keywords:", keywords)
        console.log("🔍 Message text:", messageText)

        shouldTrigger = keywords.some((keyword: string) => {
          const match = messageText.toLowerCase().includes(keyword.toLowerCase())
          console.log(`🔍 Story Reply: Checking keyword "${keyword}" in "${messageText}": ${match}`)
          return match
        })
      }

      if (shouldTrigger) {
        console.log(`🚀 Triggering story reply automation: ${automation.name}`)
  await handleStoryReplyFlowEnhanced(automation, account, senderId, messageText, storyId, messageId, db)
        return // Exit after first match to prevent multiple automations
      }

      console.log(`❌ Story automation ${automation.name} did not trigger`)
    }

    console.log("⚠️ No matching story automations found for reply")
  } catch (error) {
    console.error("❌ Error processing story automations:", error)
  }
}

// Enhanced Story Reply Flow with new button sequence
async function handleStoryReplyFlowEnhanced(
  automation: any,
  account: any,
  senderId: string,
  messageText: string,
  storyId: string,
  messageId: string,
  db: any,
) {
  try {
    console.log("🔄 === HANDLING ENHANCED STORY REPLY FLOW ===")
    console.log("🔄 Automation actions:", JSON.stringify(automation.actions, null, 2))

    let success = false
    let currentStep = 1

    // STEP 1: React to story reply if enabled
    if (automation.actions?.reaction?.enabled) {
      console.log("❤️ STEP 1: Sending reaction to story reply...")
      await sendReaction(account.instagramUserId, account.accessToken, senderId, messageId, "love")
      currentStep++
    }

    // STEP 2: Send opening DM with buttons (if enabled)
    if (automation.actions?.openingDM?.enabled && automation.actions.openingDM.message) {
      console.log("📤 STEP 2: Sending opening DM with buttons...")

      const openingSuccess = await sendDirectMessageWithButtons(
        account.instagramUserId,
        account.accessToken,
        senderId,
        automation.actions.openingDM.message,
        transformButtons(automation.actions.openingDM.buttons) || [],
      )

      console.log("📤 Opening DM result:", openingSuccess)

      if (openingSuccess) {
        success = true
        await updateAccountUsage(account, "opening_dm", automation.name, messageText)

        // Store user state for button flow
        await storeUserState(senderId, account.instagramUserId, automation._id, "awaiting_opening_response", db)

        // Don't proceed to next steps immediately - wait for button click
        await logAutomation(automation, senderId, storyId, messageText, true, account.instagramUserId, db)
        return
      }
      currentStep++
    }

    // STEP 3: Ask follow if enabled (only if no opening DM or opening DM was skipped)
    if (automation.actions?.askFollow?.enabled && automation.actions.askFollow.message) {
      console.log("📤 STEP 3: Asking user to follow...")

      const followSuccess = await sendDirectMessageWithButtons(
        account.instagramUserId,
        account.accessToken,
        senderId,
        automation.actions.askFollow.message,
        transformButtons(automation.actions.askFollow.buttons) || [],
      )

      if (followSuccess) {
        success = true
        await updateAccountUsage(account, "ask_follow", automation.name, messageText)

        // Store user state for follow flow
        await storeUserState(senderId, account.instagramUserId, automation._id, "awaiting_follow_confirmation", db)

        // Don't proceed to main DM immediately - wait for follow confirmation
        await logAutomation(automation, senderId, storyId, messageText, true, account.instagramUserId, db)
        return
      }
      currentStep++
    }

    if (automation.actions?.askEmail?.enabled && automation.actions.askEmail.message) {
      console.log("📧 STEP 4: Asking user for email (plain DM, no buttons)...")

      const askMessage = automation.actions.askEmail.message || "Please share your email address so I can send you the link."

      // Send a plain DM asking for the user's email (no buttons)
      const emailSent = await sendDirectMessage(account.instagramUserId, account.accessToken, senderId, askMessage)

      if (emailSent) {
        success = true
        await updateAccountUsage(account, "ask_email", automation.name, messageText)

        // Store user state for email collection
        await storeUserState(senderId, account.instagramUserId, automation._id, "awaiting_email", db)

        await logAutomation(automation, senderId, storyId, messageText, true, account.instagramUserId, db)
        return
      } else {
        // If sending failed, fall back to main DM
        console.log("⚠️ Failed to send ask-email DM for story flow, falling back to main DM")
      }
    }

    // STEP 4: Send main DM message (always executed if we reach here)
    if (automation.actions?.sendDM?.message) {
      console.log("📤 STEP 4: Sending main DM with buttons...")

      const mainDMSuccess = await sendDirectMessageWithButtons(
        account.instagramUserId,
        account.accessToken,
        senderId,
        automation.actions.sendDM.message,
        transformButtons(automation.actions.sendDM.buttons) || [],
      )

      console.log("📤 Main DM result:", mainDMSuccess)
      success = mainDMSuccess

      if (success) {
        await storeOrUpdateContact(
          account.instagramUserId,
          senderId,
          null,
          "dm_sent",
          automation.name,
          db,
          account.workspaceId,
        )

        await updateAccountUsage(account, "main_dm", automation.name, messageText)

        // Send follow-up message if enabled
        if (automation.actions?.followUp?.enabled && automation.actions.followUp.message) {
          console.log("📤 Scheduling follow-up message...")
          setTimeout(async () => {
            try {
              const followUpSuccess = await sendDirectMessageWithButtons(
                account.instagramUserId,
                account.accessToken,
                senderId,
                automation.actions.followUp.message,
                [],
              )

              if (followUpSuccess) {
                await updateAccountUsage(account, "follow_up", automation.name, "")
              }
            } catch (followUpError) {
              console.error("❌ Error sending follow-up message:", followUpError)
            }
          }, automation.actions.followUp.delay || 300000) // Default 5 minutes delay
        }

        // Send branding message for free users
        await sendBrandingMessageIfNeeded(account, senderId, db, automation.name)
      }
    }

    // Log the automation
    await logAutomation(automation, senderId, storyId, messageText, success, account.instagramUserId, db)
  } catch (error) {
    console.error("❌ Error handling story reply flow:", error)
  }
}

// Enhanced Postback Handler for new button flows
async function handlePostback(messagingEvent: any, accountId: string, db: any) {
  try {
    console.log("🔘 === HANDLING POSTBACK ===")
    console.log("🔘 Account ID:", accountId)
    console.log("🔘 Messaging event:", JSON.stringify(messagingEvent, null, 2))

    const senderId = messagingEvent.sender?.id
    const payload = messagingEvent.postback?.payload
    const title = messagingEvent.postback?.title

    console.log("🔘 Extracted postback data:", {
      senderId,
      payload,
      title,
    })

    if (!senderId || !payload) {
      console.log("❌ Missing required postback data")
      return
    }

    const account = await findAccountByInstagramId(accountId, db)

    if (!account) {
      console.log("❌ No account found for:", accountId)
      return
    }

    console.log("✅ Found account:", account.username)

    // 🧊 Check if this is an ICE BREAKER click (before checking user state)
    // Ice breakers don't have user state yet - they initiate conversations
    const iceBreakersAutomation = await db.collection("automations").findOne({
      workspaceId: account.workspaceId,
      type: "ice_breakers",
      isActive: true,
    })

    if (iceBreakersAutomation) {
      console.log("🧊 [Ice Breaker] Found automation, checking payload match...")
      
      // Check if payload matches any ice breaker question
      const matchingQuestion = iceBreakersAutomation.iceBreakers?.call_to_actions?.find(
        (q: any) => q.payload === payload
      )

      if (matchingQuestion) {
        console.log("🧊 [Ice Breaker] Matched question:", matchingQuestion.question)
        console.log("🧊 [Ice Breaker] Payload:", payload)
        console.log("🧊 [Ice Breaker] Custom response:", matchingQuestion.response)

        // Send the custom response message set by the user
        const responseMessage = matchingQuestion.response || `Thanks for reaching out! You asked: "${matchingQuestion.question}"\n\nLet me help you with that! 😊`

        const sent = await sendDirectMessage(
          account.instagramUserId,
          account.accessToken,
          senderId,
          responseMessage
        )

        if (sent) {
          // Store contact
          await storeOrUpdateContact(
            account.instagramUserId,
            senderId,
            null,
            "ice_breaker_click",
            `Ice Breaker: ${matchingQuestion.question}`,
            db,
            account.workspaceId
          )

          // Update usage
          await updateAccountUsage(account, "ice_breaker", "Ice Breakers", payload)

          console.log("✅ [Ice Breaker] Response sent successfully")
        }

        return // Exit after handling ice breaker
      }
    }

    const userState = await db.collection("user_states").findOne({
      senderId: senderId,
      accountId: account.instagramUserId, // Use correct account ID field
    })

    console.log("🔘 User state:", userState)

    if (!userState) {
      console.log("❌ No user state found for postback handling")
      return
    }

    // Get the automation
    const automation = await db.collection("automations").findOne({
      _id: userState.automationId,
    })

    if (!automation) {
      console.log("❌ No automation found for user state")
      return
    }

    console.log("🔘 Processing postback for automation:", automation.name)

    if (userState.state === "awaiting_opening_response" && payload === "BUTTON_1") {
      console.log("🔘 Handling 'Send me the link' button click")

      // Check if ask follow is enabled
      if (automation.actions?.askFollow?.enabled) {
        console.log("📤 Proceeding to ask follow step")

        const followSuccess = await sendDirectMessageWithButtons(
          account.instagramUserId,
          account.accessToken,
          senderId,
          automation.actions.askFollow.message,
          transformButtons(automation.actions.askFollow.buttons) || [],
        )

        if (followSuccess) {
          await updateUserState(senderId, account.instagramUserId, automation._id, "awaiting_follow_confirmation", db)
          await updateAccountUsage(account, "ask_follow", automation.name, "")
        }
      } else {
        // Skip to main DM
        console.log("📤 Skipping to main DM")
        await sendMainDM(automation, account, senderId, db)
      }
    } else if (userState.state === "awaiting_follow_confirmation") {
      if (payload === "CONFIRM_FOLLOW") {
        console.log("🔘 Handling 'I'm following' button click")

        const isFollowing = await verifyUserFollowsAccount(account.instagramUserId, account.accessToken, senderId)

        if (isFollowing) {
          console.log("✅ User is following, sending main DM")
          await sendMainDM(automation, account, senderId, db)
          await clearUserState(senderId, account.instagramUserId, db)
        } else {
          console.log("❌ User is not following, sending follow reminder")
          await sendDirectMessage(
            account.instagramUserId,
            account.accessToken,
            senderId,
            "I don't see that you're following me yet 😅 Please make sure to follow my account first, then click 'I'm following' again! ✨",
          )
        }
      }
    } else if (userState.state === "awaiting_email") {
      console.log("📧 Processing email response...")

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isValidEmail = emailRegex.test(messagingEvent.message?.text?.trim())
      const messageText = messagingEvent.message?.text || ""

      if (isValidEmail) {
        // Store email in contact
        await db.collection("contacts").updateOne(
          { instagramUserId: account.instagramUserId, senderId },
          {
            $set: {
              email: messageText.trim(),
              emailCollectedAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { upsert: true },
        )

        console.log("✅ Valid email stored:", messageText.trim())

        // Send confirmation and proceed to main DM
        await sendDirectMessage(
          account.instagramUserId,
          account.accessToken,
          senderId,
          "Thank you! Your email has been saved successfully. 📧",
        )

        // Clear user state and proceed to main DM
        await db.collection("user_states").deleteOne({ senderId, accountId: account.instagramUserId })
        await sendMainDM(automation, account, senderId, db)
      } else {
        // Invalid email format - ask again
        console.log("❌ Invalid email format:", messageText)
        await sendDirectMessage(
          account.instagramUserId,
          account.accessToken,
          senderId,
          "Please enter a valid email address (e.g., example@email.com) 📧",
        )
      }

      await updateAccountUsage(account, "email_response", automation.name, messageText)
      return
    }
  } catch (error) {
    console.error("❌ Error handling postback:", error)
  }
}

async function sendMainDM(automation: any, account: any, senderId: string, db: any) {
  if (automation.actions?.sendDM?.message) {
    console.log("📤 Sending main DM with buttons...")

    const mainDMSuccess = await sendDirectMessageWithButtons(
      account.instagramUserId,
      account.accessToken,
      senderId,
      automation.actions.sendDM.message,
      transformButtons(automation.actions.sendDM.buttons) || [],
    )

    if (mainDMSuccess) {
      await storeOrUpdateContact(
        account.instagramUserId,
        senderId,
        null,
        "dm_sent",
        automation.name,
        db,
        account.workspaceId,
      )

      await updateAccountUsage(account, "main_dm", automation.name, "")
      await clearUserState(senderId, account.instagramUserId, db)

      // Send branding message for free users
      await sendBrandingMessageIfNeeded(account, senderId, db, automation.name)
    }
  }
}

// Helper functions for user state management
async function storeUserState(senderId: string, accountId: string, automationId: any, state: string, db: any) {
  await db.collection("user_states").replaceOne(
    { senderId, accountId },
    {
      senderId,
      accountId,
      automationId,
      state,
      timestamp: new Date(),
    },
    { upsert: true },
  )
}

async function updateUserState(senderId: string, accountId: string, automationId: any, state: string, db: any) {
  await db.collection("user_states").updateOne(
    { senderId, accountId },
    {
      $set: {
        automationId,
        state,
        timestamp: new Date(),
      },
    },
  )
}

async function clearUserState(senderId: string, accountId: string, db: any) {
  await db.collection("user_states").deleteOne({
    senderId,
    accountId,
  })
}

function ensureHttps(url: string): string {
  if (!url) return url
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://")
  }
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return `https://${url}`
  }
  return url
}

async function sendDirectMessageWithButtons(
  instagramId: string,
  accessToken: string,
  recipientId: string,
  messageText: string,
  buttons: any[] = [],
): Promise<boolean> {
  try {
    console.log("📤 === SENDING DIRECT MESSAGE WITH BUTTONS ===")
    console.log("📤 Instagram ID:", instagramId)
    console.log("📤 Recipient ID:", recipientId)
    console.log("📤 Message:", messageText.substring(0, 100))
    console.log("📤 Buttons:", JSON.stringify(buttons, null, 2))

    // First try sending with buttons if buttons exist
    if (buttons && buttons.length > 0) {
      const limitedButtons = buttons.slice(0, 3)

      // Get user profile for profile URL replacement
      const userProfile = await getUserProfile(instagramId, accessToken, recipientId)

      const formattedButtons = limitedButtons.map((button) => {
        if (button.type === "web_url" && button.url) {
          // Replace profile URL placeholder with actual profile URL
          if (button.url === "PROFILE_URL_PLACEHOLDER" && userProfile?.profileUrl) {
            return {
              type: "web_url",
              url: ensureHttps(userProfile.profileUrl), // Added URL validation
              title: button.title,
            }
          }
          if (button.url === "PROFILE_URL_PLACEHOLDER" && !userProfile?.profileUrl) {
            console.warn("⚠️ Profile URL placeholder found but no user profile available")
            return {
              type: "web_url",
              url: "https://instagram.com", // Fallback to Instagram homepage
              title: button.title,
            }
          }
          return {
            type: "web_url",
            url: ensureHttps(button.url), // Added URL validation
            title: button.title,
          }
        } else {
          return {
            type: "postback",
            payload: button.payload || "DEFAULT_PAYLOAD",
            title: button.title,
          }
        }
      })

      const buttonPayload = {
        recipient: {
          id: recipientId,
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: messageText,
              buttons: formattedButtons,
            },
          },
        },
      }

      console.log("📤 Button payload:", JSON.stringify(buttonPayload, null, 2))

  const buttonResponse = await fetch(`https://graph.instagram.com/v24.0/${instagramId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(buttonPayload),
      })

      const buttonResponseData = await buttonResponse.json()
      console.log("📥 Button Response:", JSON.stringify(buttonResponseData, null, 2))

      if (buttonResponse.ok) {
        console.log("✅ DM with buttons sent successfully!")
        return true
      } else {
        console.warn("⚠️ Instagram host failed, retrying Facebook host for buttons...")
        try {
          const fbRes = await fetch(`https://graph.facebook.com/v24.0/${instagramId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(buttonPayload),
          })
          const fbData = await fbRes.json()
          console.log("📥 Button Response (facebook host):", JSON.stringify(fbData, null, 2))
          if (fbRes.ok) {
            console.log("✅ DM with buttons sent successfully via facebook host!")
            return true
          }
        } catch (e) {
          console.error("❌ Retry error (facebook host):", e)
        }
        console.error("❌ Failed to send DM with buttons:", buttonResponseData)
      }
    }

    // Send as regular text DM (fallback or no buttons)
    const textPayload = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: messageText,
      },
    }

  const textResponse = await fetch(`https://graph.instagram.com/v24.0/${instagramId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(textPayload),
    })

    const textResponseData = await textResponse.json()
    console.log("📥 Text Response:", JSON.stringify(textResponseData, null, 2))

    if (textResponse.ok) {
      console.log("✅ DM sent successfully!")
      return true
    } else {
      console.warn("⚠️ Instagram host failed, retrying Facebook host for text DM...")
      try {
        const fbRes = await fetch(`https://graph.facebook.com/v24.0/${instagramId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(textPayload),
        })
        const fbData = await fbRes.json()
        console.log("📥 Text Response (facebook host):", JSON.stringify(fbData, null, 2))
        if (fbRes.ok) {
          console.log("✅ DM sent successfully via facebook host!")
          return true
        }
      } catch (e) {
        console.error("❌ Retry error (facebook host):", e)
      }
      console.error("❌ Failed to send DM:", textResponseData)
      return false
    }
  } catch (error) {
    console.error("❌ Error sending DM:", error)
    return false
  }
}

// Sends a "Generic Template" (carousel-like cards with image/title/subtitle/buttons)
// Used by the new Generic DM builder when actions.sendDM.elements[] is provided.
// Each element supports up to 3 buttons (web_url or postback) and optional default_action.
async function sendGenericTemplate(
  instagramId: string,
  accessToken: string,
  recipientId: string,
  elements: any[],
): Promise<boolean> {
  try {
    console.log("📤 === SENDING GENERIC TEMPLATE ===")
    const limitedElements = (elements || []).slice(0, 10).map((el: any) => {
      const cleanedButtons = (el.buttons || []).slice(0, 3).map((b: any, i: number) => {
        // Accept 'link' or 'url' for web_url; 'payload' for postback
        const title = b.text || b.title || `Button ${i + 1}`
        if (b.type === 'web_url' || b.link || b.url) {
          const href = b.link || b.url
          return { type: 'web_url', url: ensureHttps(href), title }
        }
        return { type: 'postback', title, payload: b.payload || `BUTTON_${i + 1}` }
      })
      // Build element with only allowed/non-empty fields
      const element: any = {
        title: el.title || "",
      }
      if (el.subtitle) element.subtitle = el.subtitle
      if (el.image_url) element.image_url = ensureHttps(el.image_url)
      if (el.default_action?.url) {
        element.default_action = { type: el.default_action.type || 'web_url', url: ensureHttps(el.default_action.url) }
      }
      if (cleanedButtons.length > 0) {
        element.buttons = cleanedButtons
      }
      return element
    })

    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: limitedElements,
          },
        },
      },
    }

    console.log("📤 Generic payload:", JSON.stringify(payload, null, 2))

  const res = await fetch(`https://graph.instagram.com/v24.0/${instagramId}/messages?access_token=${encodeURIComponent(accessToken)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    console.log("📥 Generic response:", JSON.stringify(data, null, 2))
    if (res.ok) return true
    console.warn("⚠️ Instagram host failed, retrying Facebook host for generic template...")
    try {
      const fbRes = await fetch(`https://graph.facebook.com/v24.0/${instagramId}/messages?access_token=${encodeURIComponent(accessToken)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const fbData = await fbRes.json()
      console.log("📥 Generic response (facebook host):", JSON.stringify(fbData, null, 2))
      return fbRes.ok
    } catch (e) {
      console.error("❌ Retry error (facebook host):", e)
    }
    return false
  } catch (error) {
    console.error("❌ Error sending generic template:", error)
    return false
  }
}

async function sendDirectMessage(
  instagramId: string,
  accessToken: string,
  recipientId: string,
  messageText: string,
): Promise<boolean> {
  try {
    console.log("📤 === SENDING DIRECT MESSAGE ===")
    console.log("📤 Instagram ID:", instagramId)
    console.log("📤 Recipient ID:", recipientId)
    console.log("📤 Message:", messageText.substring(0, 100))

    const textPayload = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: messageText,
      },
    }

  const textResponse = await fetch(`https://graph.instagram.com/v24.0/${instagramId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(textPayload),
    })

    const textResponseData = await textResponse.json()
    console.log("📥 Text Response:", JSON.stringify(textResponseData, null, 2))

    if (textResponse.ok) {
      console.log("✅ DM sent successfully!")
      return true
    } else {
      console.warn("⚠️ Instagram host failed, retrying Facebook host for text DM...")
      try {
        const fbRes = await fetch(`https://graph.facebook.com/v24.0/${instagramId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(textPayload),
        })
        const fbData = await fbRes.json()
        console.log("📥 Text Response (facebook host):", JSON.stringify(fbData, null, 2))
        if (fbRes.ok) {
          console.log("✅ DM sent successfully via facebook host!")
          return true
        }
      } catch (e) {
        console.error("❌ Retry error (facebook host):", e)
      }
      console.error("❌ Failed to send DM:", textResponseData)
      return false
    }
  } catch (error) {
    console.error("❌ Error sending DM:", error)
    return false
  }
}

// Helper functions (keeping existing implementations)
async function storeOrUpdateContact(
  instagramUserId: string,
  senderId: string,
  senderUsername: string | null,
  interactionType: string,
  automationName: string | null,
  db: any,
  workspaceId?: string,
  email?: string,
) {
  try {
    console.log("👤 === STORING/UPDATING CONTACT ===")

    if (senderId === instagramUserId) {
      console.log("⚠️ Skipping contact storage for business account")
      return
    }

    const now = new Date()
    let finalWorkspaceId = workspaceId
    if (!finalWorkspaceId) {
      const account = await db.collection("instagram_accounts").findOne({
        instagramUserId,
      })
      finalWorkspaceId = account?.workspaceId || "default"
    }

    // Get username if not provided
    let finalUsername = senderUsername
    if (!finalUsername) {
      try {
        const account = await db.collection("instagram_accounts").findOne({
          instagramUserId,
        })
        if (account?.accessToken) {
          const userProfile = await getUserProfile(instagramUserId, account.accessToken, senderId)
          finalUsername = userProfile?.username || null
        }
      } catch (error) {
        console.log("⚠️ Could not fetch username:", error)
      }
    }

    const existingContact = await db.collection("contacts").findOne({
      instagramUserId,
      senderId,
      workspaceId: finalWorkspaceId,
    })

    if (existingContact) {
      const updateData: any = {
        senderUsername: finalUsername || existingContact.senderUsername,
        lastInteraction: now,
        lastInteractionType: interactionType,
        lastAutomationName: automationName,
        updatedAt: now,
      }

      // Add email if provided
      if (email) {
        updateData.email = email
        updateData.emailCollectedAt = now
      }

      await db.collection("contacts").updateOne(
        { _id: existingContact._id },
        {
          $set: updateData,
          $inc: {
            totalInteractions: 1,
          },
          $push: {
            interactionHistory: {
              type: interactionType,
              automationName,
              timestamp: now,
            },
          },
        },
      )
      console.log("✅ Contact updated successfully")
    } else {
      const newContact: any = {
        instagramUserId,
        senderId,
        senderUsername: finalUsername,
        workspaceId: finalWorkspaceId,
        firstInteraction: now,
        lastInteraction: now,
        lastInteractionType: interactionType,
        lastAutomationName: automationName,
        totalInteractions: 1,
        interactionHistory: [
          {
            type: interactionType,
            automationName,
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      }

      // Add email if provided
      if (email) {
        newContact.email = email
        newContact.emailCollectedAt = now
      }

      await db.collection("contacts").insertOne(newContact)
      console.log("✅ New contact created successfully")
    }
  } catch (error) {
    console.error("❌ Error storing/updating contact:", error)
  }
}

async function updateAccountUsage(account: any, triggerType: string, automationName: string, messageText: string) {
  try {
    const db = await getDatabase()

    console.log(`📊 [DEBUG] Updating account usage for: ${account.instagramUserId}`)
    console.log(`📊 [DEBUG] Trigger type: ${triggerType}, Automation: ${automationName}`)

    const updateResult = await db.collection("instagram_accounts").updateOne(
      {
        $or: [{ instagramUserId: account.instagramUserId }, { instagramProfessionalId: account.instagramUserId }],
      },
      {
        $inc: { dmUsed: 1 },
        $set: { lastDMSent: new Date(), updatedAt: new Date() },
        $push: {
          // cast to any due to generic Document typing
          usageHistory: {
            type: "dm_sent",
            timestamp: new Date(),
            count: 1,
            triggeredBy: triggerType,
            messageText: messageText.substring(0, 100),
            automationName: automationName,
          } as any,
        } as any,
      },
    )

    console.log(`📊 [DEBUG] Update result:`, updateResult)

    if (account.workspaceId) {
      await db.collection("workspaces").updateOne(
        { _id: account.workspaceId },
        {
          $inc: { "usage.dmsSent": 1 },
          $set: { "usage.lastUpdated": new Date() },
        },
      )
      console.log(`📊 [DEBUG] Updated workspace usage for: ${account.workspaceId}`)
    }

    // This could be enhanced with WebSocket or Server-Sent Events in the future
    console.log(`✅ [DEBUG] DM count updated successfully for account: ${account.instagramUserId}`)
  } catch (error) {
    console.error("❌ Error updating account usage:", error)
    throw error // Re-throw to ensure calling functions know about the failure
  }
}

async function logAutomation(
  automation: any,
  senderId: string,
  storyId: string,
  messageText: string,
  success: boolean,
  accountId: string,
  db: any,
) {
  const logEntry = {
    automationId: automation._id,
    automationType: "story_reply_flow",
    triggeredBy: senderId,
    storyId,
    messageText,
    success,
    timestamp: new Date(),
    accountId: accountId,
    automationName: automation.name,
  }

  await db.collection("automation_logs").insertOne(logEntry)
  console.log("📝 Story automation logged:", logEntry)
}

async function sendBrandingMessageIfNeeded(account: any, senderId: string, db: any, automationName: string) {
  // Implementation from your existing code
  try {
    if (account.plan !== "free" && account.plan) {
      console.log("⚠️ Skipping branding for paid user")
      return
    }

    console.log("🔍 Checking if branding message should be sent...")

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingBrandingLog = await db.collection("automation_logs").findOne({
      triggeredBy: senderId,
      automationName: "branding_message",
      timestamp: {
        $gte: today,
        $lt: tomorrow,
      },
    })

    if (existingBrandingLog) {
      console.log(`⚠️ Branding message already sent to user ${senderId} today, skipping`)
      return
    }

    console.log("📤 Sending branding message for free user...")

    setTimeout(async () => {
      try {
        const brandingSuccess = await sendDirectMessageWithButtons(
          account.instagramUserId,
          account.accessToken,
          senderId,
          "Sent by ChatAutoDM⚡- Grow your DMs on AutoPilot",
          [],
        )

        if (brandingSuccess) {
          await updateAccountUsage(account, "branding", "branding_message", "")

          await db.collection("automation_logs").insertOne({
            automationId: null,
            automationType: "branding",
            triggeredBy: senderId,
            success: brandingSuccess,
            timestamp: new Date(),
            accountId: account.instagramUserId,
            automationName: "branding_message",
            originalAutomation: automationName,
          })

          console.log("✅ Branding message sent and logged")
        }
      } catch (brandingError) {
        console.error("❌ Error sending branding message:", brandingError)
      }
    }, 3000) // 3 second delay
  } catch (error) {
    console.error("❌ Error in branding message check:", error)
  }
}

async function sendReaction(
  instagramId: string,
  accessToken: string,
  recipientId: string,
  messageId: string,
  reaction = "love",
): Promise<boolean> {
  try {
    console.log("❤️ === SENDING REACTION ===")

    const payload = {
      recipient: {
        id: recipientId,
      },
      sender_action: "react",
      payload: {
        message_id: messageId,
        reaction: reaction,
      },
    }

  const response = await fetch(`https://graph.instagram.com/v24.0/${instagramId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()
    console.log("📥 Reaction Response:", JSON.stringify(responseData, null, 2))

    if (response.ok) {
      console.log("✅ Reaction sent successfully!")
      return true
    } else {
      console.warn("⚠️ Instagram host failed, retrying Facebook host for reaction...")
      try {
        const fbRes = await fetch(`https://graph.facebook.com/v24.0/${instagramId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(payload),
        })
        const fbData = await fbRes.json()
        console.log("📥 Reaction Response (facebook host):", JSON.stringify(fbData, null, 2))
        if (fbRes.ok) {
          console.log("✅ Reaction sent successfully via facebook host!")
          return true
        }
      } catch (e) {
        console.error("❌ Retry error (facebook host):", e)
      }
      console.error("❌ Failed to send reaction:", responseData)
      return false
    }
  } catch (error) {
    console.error("❌ Error sending reaction:", error)
    return false
  }
}

// Enhanced comment handler with better automation processing
async function handleBusinessLoginComment(commentData: any, accountId: string, db: any) {
  try {
    console.log("💬 === HANDLING BUSINESS LOGIN COMMENT ===")
    console.log("💬 Account ID:", accountId)
    console.log("💬 Comment data:", JSON.stringify(commentData, null, 2))

    const commentId = commentData.id
    const commentText = commentData.text || ""
    const commenterId = commentData.from?.id
    const commenterUsername = commentData.from?.username
    const mediaId = commentData.media?.id

    console.log("💬 Extracted data:", {
      commentId,
      commentText: commentText.substring(0, 50),
      commenterId,
      commenterUsername,
      mediaId,
    })

    if (!commentId || !commenterId) {
      console.log("❌ Missing required comment data")
      return
    }

    const account = await findAccountByInstagramId(accountId, db)

    if (!account) {
      console.log("❌ No account found for:", accountId)
      return
    }

    // Skip if commenter is the business account itself
    if (commenterId === account.instagramUserId) {
      console.log("⚠️ Comment is from business account, skipping")
      return
    }

    console.log("✅ Found account:", {
      username: account.username,
      instagramUserId: account.instagramUserId,
      plan: account.plan,
    })

    // Store the comment
    const commentDoc = {
      commentId,
      instagramUserId: account.instagramUserId,
      commenterId,
      commenterUsername,
      text: commentText,
      mediaId,
      timestamp: new Date(),
      processed: false,
      createdAt: new Date(),
    }

    await db.collection("comments").insertOne(commentDoc)
    console.log("💾 Comment stored successfully")

    // Process comment automations
    await processCommentAutomations(account, commentData, db)
  } catch (error) {
    console.error("❌ Error handling business login comment:", error)
  }
}

async function processCommentAutomations(account: any, commentData: any, db: any) {
  try {
    console.log("🔍 === PROCESSING COMMENT AUTOMATIONS ===")

    const commentText = commentData.text || ""
    const commenterId = commentData.from?.id
    const commentId = commentData.id
    const postId = commentData.media?.id

    console.log("🔍 Processing for:", {
      commentText,
      commenterId,
      commentId,
      postId,
      accountId: account.instagramUserId,
    })

    // Find ALL workspaces that contain this Instagram account
    const workspaces = await db
      .collection("workspaces")
      .find({
        $or: [
          { instagramUserId: account.instagramUserId },
          { instagramProfessionalId: account.instagramUserId },
          { instagramUserId: account.instagramProfessionalId },
          { instagramProfessionalId: account.instagramProfessionalId },
        ],
      } as any)
      .toArray()

    console.log(`✅ Found ${workspaces.length} workspaces for Instagram account`)

    // Search for comment automations across ALL workspaces and Instagram IDs
  const workspaceIds = workspaces.map((w: any) => w._id)
    const instagramIds = [
      account.instagramUserId,
      account.instagramProfessionalId,
  ...workspaces.map((w: any) => w.instagramUserId),
  ...workspaces.map((w: any) => w.instagramProfessionalId),
    ].filter(Boolean)

    const commentAutomations = await db
      .collection("automations")
      .find({
        isActive: true,
        $or: [{ workspaceId: { $in: workspaceIds } }, { instagramUserId: { $in: instagramIds } }],
        type: { $in: ["comment_to_dm_flow", "comment_reply_flow"] },
      } as any)
      .toArray()

    console.log(`📋 Found ${commentAutomations.length} active comment automations for account ${account.username}`)
    console.log(`📋 Searching across workspaces: ${workspaceIds.join(", ")}`)

    if (commentAutomations.length === 0) {
      console.log("⚠️ No active comment automations found")
      return
    }

    // 🆕 NEXT POST LOGIC: 3-Step Check
    // Step 1: Check if any automation matches this specific post ID
    let matchedAutomation = null
    
    for (const automation of commentAutomations) {
      console.log(`🔍 Step 1: Checking automation: ${automation.name}`)
      
      // Check if automation matches this specific post
      if (automation.selectedPost === postId) {
        console.log(`✅ Step 1: Found automation for specific post: ${postId}`)
        matchedAutomation = automation
        break
      }
    }

    // Step 2: If no specific post match, check if this is an old post (in snapshot)
    if (!matchedAutomation && postId) {
      console.log("🔍 Step 2: Checking if post exists in media snapshots (old post)...")
      
      // Find the most recent snapshot for any workspace this account belongs to
      const snapshot = await db
        .collection("userMedia")
        .findOne({
          workspaceId: { $in: workspaceIds },
          media_ids: postId, // Check if this postId is in the snapshot
        } as any)

      if (snapshot) {
        console.log(`⚠️ Step 2: Post ${postId} found in snapshot - this is an OLD post, ignoring next_post logic`)
        // Fall through to regular automation matching (non-next-post)
      } else {
        console.log(`🆕 Step 2: Post ${postId} NOT in any snapshot - this might be a NEW post!`)
        
        // Step 3: Look for "Next Post" automation and link it
        const nextPostAutomation = commentAutomations.find((auto: any) => 
          auto.isNextPost === true && !auto.selectedPost // Only unlinked next-post automations
        )
        
        if (nextPostAutomation) {
          console.log(`🚀 Step 3: Found NEXT POST automation: ${nextPostAutomation.name}`)
          console.log(`🔗 Step 3: Linking post ${postId} to automation ${nextPostAutomation._id}`)
          
          // Update the automation to link this new post (atomic operation)
          const updateResult = await db.collection("automations").updateOne(
            { 
              _id: nextPostAutomation._id,
              isNextPost: true, // Double-check it's still in next-post mode
              $or: [
                { selectedPost: { $exists: false } }, // Field doesn't exist
                { selectedPost: null }, // Field is null
                { selectedPost: "" } // Field is empty string
              ]
            } as any,
            {
              $set: {
                selectedPost: postId,
                isNextPost: false, // Deactivate next-post mode after linking
                linkedAt: new Date(),
                updatedAt: new Date(),
              },
            }
          )
          
          if (updateResult.modifiedCount > 0) {
            console.log(`✅ Step 3: Automation updated and linked to new post!`)
            console.log(`✅ Step 3: Update result:`, updateResult)
            matchedAutomation = { ...nextPostAutomation, selectedPost: postId }
          } else {
            console.log(`⚠️ Step 3: Update failed - modifiedCount: ${updateResult.modifiedCount}`)
            console.log(`⚠️ Step 3: Automation state:`, { 
              _id: nextPostAutomation._id, 
              isNextPost: nextPostAutomation.isNextPost,
              selectedPost: nextPostAutomation.selectedPost 
            })
          }
        } else {
          console.log(`⚠️ Step 3: No next-post automation found`)
        }
      }
    }

    // Process automations (existing logic with keyword matching)
    const automationsToCheck = matchedAutomation ? [matchedAutomation] : commentAutomations

    for (const automation of automationsToCheck) {
      console.log(`🔍 Checking comment automation: ${automation.name} for account: ${account.username}`)

      // Check if automation matches this post (if post-specific)
      if (automation.selectedPost && automation.selectedPost !== postId) {
        console.log(`⚠️ Automation is for different post: ${automation.selectedPost} vs ${postId}`)
        continue
      }

      // Check keyword matching
      const trigger = automation.trigger || {}
      let shouldTrigger = false

      if (trigger.keywordMode === "any_comment" || trigger.keywordMode === "any_reply") {
        shouldTrigger = true
        console.log("✅ Comment: Triggering on any comment")
      } else if (trigger.keywordMode === "specific_keywords") {
        const keywords = trigger.triggerKeywords || trigger.keywords || []
        console.log("🔍 Checking keywords:", keywords)
        console.log("🔍 Comment text:", commentText)

        shouldTrigger = keywords.some((keyword: string) => {
          const match = commentText.toLowerCase().includes(keyword.toLowerCase())
          console.log(`🔍 Comment: Checking keyword "${keyword}" in "${commentText}": ${match}`)
          return match
        })
      }

      if (shouldTrigger) {
        console.log(`🚀 Triggering comment automation: ${automation.name}`)
        await handleCommentToDMFlow(automation, account, commenterId, commentText, commentId, postId, db)
        return // Exit after first match
      }

      console.log(`❌ Comment automation ${automation.name} did not trigger`)
    }

    console.log("⚠️ No matching comment automations found")
  } catch (error) {
    console.error("❌ Error processing comment automations:", error)
  }
}

async function handleCommentToDMFlow(
  automation: any,
  account: any,
  commenterId: string,
  commentText: string,
  commentId: string,
  postId: string,
  db: any,
) {
  try {
    console.log("🔄 === HANDLING COMMENT TO DM FLOW ===")
    console.log("🔄 Automation actions:", JSON.stringify(automation.actions, null, 2))

    let success = false
    let currentStep = 1

    // STEP 1: Send public comment reply (if enabled) - NOT private reply
    if (automation.actions?.publicReply?.enabled && automation.actions.publicReply.replies) {
      console.log("💬 STEP 1: Sending public comment reply...")

      const enabledReplies = automation.actions.publicReply.replies.filter((reply: any) => reply.enabled)
      if (enabledReplies.length > 0) {
        const randomReply = enabledReplies[Math.floor(Math.random() * enabledReplies.length)]

        // Send public comment reply
        const publicReplySuccess = await sendCommentReply(
          account.instagramUserId,
          account.accessToken,
          commentId,
          randomReply.text,
        )

        console.log("💬 Public comment reply result:", publicReplySuccess)
        if (publicReplySuccess) {
          success = true
          await updateAccountUsage(account, "comment_reply", automation.name, commentText)
        }
      }
      currentStep++
    }

    // STEP 2: Send opening DM as private reply with buttons (if enabled)
    if (automation.actions?.openingDM?.enabled && automation.actions.openingDM.message) {
      console.log("📤 STEP 2: Sending opening DM as private reply with buttons...")

      const openingSuccess = await sendPrivateReplyWithButtons(
        account.instagramUserId,
        account.accessToken,
        commentId,
        automation.actions.openingDM.message,
        transformButtons(automation.actions.openingDM.buttons) || [],
      )

      console.log("📤 Opening DM private reply result:", openingSuccess)

      if (openingSuccess) {
        success = true
        await updateAccountUsage(account, "opening_dm", automation.name, commentText)

        // Store user state for button flow
        await storeUserState(commenterId, account.instagramUserId, automation._id, "awaiting_opening_response", db)

        // Don't proceed to next steps immediately - wait for button click
        await logAutomation(automation, commenterId, postId, commentText, true, account.instagramUserId, db)
        return
      }
      currentStep++
    }

    // STEP 3: Ask follow as private reply with buttons (if enabled and no opening DM)
    if (
      automation.actions?.askFollow?.enabled &&
      automation.actions.askFollow.message &&
      !automation.actions?.openingDM?.enabled
    ) {
      console.log("📤 STEP 3: Asking user to follow as private reply...")

      const followSuccess = await sendPrivateReplyWithButtons(
        account.instagramUserId,
        account.accessToken,
        commentId,
        automation.actions.askFollow.message,
        transformButtons(automation.actions.askFollow.buttons) || [],
      )

      if (followSuccess) {
        success = true
        await updateAccountUsage(account, "ask_follow", automation.name, commentText)

        // Store user state for follow flow
        await storeUserState(commenterId, account.instagramUserId, automation._id, "awaiting_follow_confirmation", db)

        // Don't proceed to main DM immediately - wait for follow confirmation
        await logAutomation(automation, commenterId, postId, commentText, true, account.instagramUserId, db)
        return
      }
      currentStep++
    }

    if (automation.actions?.askEmail?.enabled) {
      console.log("📧 Proceeding to ask email step (plain message, no buttons)")

      // Send a plain DM asking for the user's email and set state to awaiting_email
      const askMessage = automation.actions.askEmail.message || "Please share your email address so I can send you the link."

      const emailSent = await sendDirectMessage(
        account.instagramUserId,
        account.accessToken,
        commenterId,
        askMessage,
      )

      if (emailSent) {
        // Set user state so subsequent incoming message will be treated as the email response
        await updateUserState(commenterId, account.instagramUserId, automation._id, "awaiting_email", db)
        await updateAccountUsage(account, "ask_email", automation.name, "")
        // Don't proceed to main DM - wait for user's reply
        await logAutomation(automation, commenterId, postId, commentText, true, account.instagramUserId, db)
        return
      } else {
        // If sending failed, fall back to main DM
        console.log("⚠️ Failed to send ask-email DM, falling back to main DM")
        await sendMainDM(automation, account, commenterId, db)
        await logAutomation(automation, commenterId, postId, commentText, true, account.instagramUserId, db)
        return
      }
    }

    // STEP 4: Send main DM as private reply with buttons (if no opening DM or ask follow)
    if (
      automation.actions?.sendDM?.message &&
      !automation.actions?.openingDM?.enabled &&
      !automation.actions?.askFollow?.enabled
    ) {
      console.log("📤 STEP 4: Sending main DM as private reply with buttons...")

      const mainDMSuccess = await sendPrivateReplyWithButtons(
        account.instagramUserId,
        account.accessToken,
        commentId,
        automation.actions.sendDM.message,
        transformButtons(automation.actions.sendDM.buttons) || [],
      )

      console.log("📤 Main DM private reply result:", mainDMSuccess)
      success = mainDMSuccess

      if (success) {
        await storeOrUpdateContact(
          account.instagramUserId,
          commenterId,
          null,
          "dm_sent",
          automation.name,
          db,
          account.workspaceId,
        )

        await updateAccountUsage(account, "main_dm", automation.name, commentText)
        await clearUserState(commenterId, account.instagramUserId, db)

        // Send branding message for free users
        await sendBrandingMessageIfNeeded(account, commenterId, db, automation.name)
      }
    }

    await logAutomation(automation, commenterId, postId, commentText, success, account.instagramUserId, db)
  } catch (error) {
    console.error("❌ Error in comment to DM flow:", error)
    await logAutomation(automation, commenterId, postId, commentText, false, account.instagramUserId, db)
  }
}

async function sendPrivateReplyWithButtons(
  instagramUserId: string,
  accessToken: string,
  commentId: string,
  message: string,
  buttons: any[] = [],
) {
  try {
    console.log("💬 Sending private reply with buttons to comment:", commentId)

    let messagePayload: any

    if (buttons.length > 0) {
      const limitedButtons = buttons.slice(0, 3)

      // Send button template as private reply
      messagePayload = {
        recipient: {
          comment_id: commentId,
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: message,
              buttons: limitedButtons,
            },
          },
        },
      }
    } else {
      // Send text message as private reply
      messagePayload = {
        recipient: {
          comment_id: commentId,
        },
        message: {
          text: message,
        },
      }
    }

  const response = await fetch(`https://graph.instagram.com/v24.0/${instagramUserId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(messagePayload),
    })

    const result = await response.json()
    console.log("💬 Private reply with buttons response:", result)

    if (response.ok && result.recipient_id) {
      console.log("✅ Private reply with buttons sent successfully")
      return true
    } else {
      console.warn("⚠️ Instagram host failed, retrying Facebook host for private reply...")
      try {
        const fbRes = await fetch(`https://graph.facebook.com/v24.0/${instagramUserId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(messagePayload),
        })
        const fbData = await fbRes.json()
        console.log("💬 Private reply response (facebook host):", fbData)
        if (fbRes.ok && fbData.recipient_id) {
          console.log("✅ Private reply sent successfully via facebook host")
          return true
        }
      } catch (e) {
        console.error("❌ Retry error (facebook host):", e)
      }
      console.error("❌ Failed to send private reply with buttons:", result)
      return false
    }
  } catch (error) {
    console.error("❌ Error sending private reply with buttons:", error)
    return false
  }
}

async function sendCommentReply(instagramUserId: string, accessToken: string, commentId: string, message: string) {
  try {
    console.log("💬 Sending public comment reply to:", commentId)

  const response = await fetch(`https://graph.instagram.com/v24.0/${commentId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: message,
      }),
    })

    const result = await response.json()
    console.log("💬 Comment reply response:", result)

    if (response.ok && result.id) {
      console.log("✅ Comment reply sent successfully")
      return true
    } else {
      console.error("❌ Failed to send comment reply:", result)
      return false
    }
  } catch (error) {
    console.error("❌ Error sending comment reply:", error)
    return false
  }
}

async function replyToComment(
  instagramId: string,
  accessToken: string,
  commentId: string,
  replyText: string,
): Promise<boolean> {
  try {
    console.log("💬 === REPLYING TO COMMENT ===")
    console.log("💬 Instagram ID:", instagramId)
    console.log("💬 Comment ID:", commentId)
    console.log("💬 Reply text:", replyText)

    const payload = {
      message: replyText,
    }

    console.log("💬 Reply payload:", JSON.stringify(payload, null, 2))

  const response = await fetch(`https://graph.instagram.com/v24.0/${commentId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()
    console.log("📥 Comment Reply Response Status:", response.status)
    console.log("📥 Comment Reply Response:", JSON.stringify(responseData, null, 2))

    if (response.ok) {
      console.log("✅ Comment reply sent successfully!")
      return true
    } else {
      console.error("❌ Failed to reply to comment")
      console.error("❌ Error:", responseData)
      return false
    }
  } catch (error) {
    console.error("❌ Error replying to comment:", error)
    return false
  }
}

async function verifyUserFollowsAccount(
  instagramUserId: string,
  accessToken: string,
  userScopedId: string,
): Promise<boolean> {
  try {
    console.log("🔍 Verifying if user follows business account...")

    const response = await fetch(
  `https://graph.instagram.com/v24.0/${userScopedId}?fields=is_user_follow_business&access_token=${accessToken}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const data = await response.json()
    console.log("📥 Follow verification response:", JSON.stringify(data, null, 2))

    if (response.ok && data.is_user_follow_business !== undefined) {
      return data.is_user_follow_business
    } else {
      console.error("❌ Failed to verify follow status:", data)
      return false
    }
  } catch (error) {
    console.error("❌ Error verifying follow status:", error)
    return false
  }
}

async function getUserProfile(instagramUserId: string, accessToken: string, senderId: string) {
  try {
    console.log("👤 === GETTING USER PROFILE ===")
    console.log("👤 Instagram ID:", instagramUserId)
    console.log("👤 Sender ID:", senderId)

    const response = await fetch(
  `https://graph.instagram.com/v24.0/${senderId}?fields=username,name&access_token=${accessToken}`,
    )

    const userData = await response.json()
    console.log("👤 User Profile Response:", JSON.stringify(userData, null, 2))

    if (response.ok && userData.username) {
      return {
        username: userData.username,
        name: userData.name,
        profileUrl: `https://instagram.com/${userData.username}`,
      }
    } else {
      console.error("❌ Failed to get user profile:", userData)
      return null
    }
  } catch (error) {
    console.error("❌ Error getting user profile:", error)
    return null
  }
}

function transformButtons(buttons: any[]): any[] {
  if (!Array.isArray(buttons)) return []

  return buttons.slice(0, 3).map((button, index) => {
    // Check if button is already in Instagram format (from database)
    if (button.type === "web_url" && button.url) {
      return {
        type: "web_url",
        title: button.title,
        url: ensureHttps(button.url),
      }
    } else if (button.type === "postback" && button.payload) {
      return {
        type: "postback",
        title: button.title,
        payload: button.payload,
      }
    }
    // Handle UI format (legacy support)
    else if (button.link) {
      return {
        type: "web_url",
        title: button.title || button.text || button.label || `Button ${index + 1}`,
        url: ensureHttps(button.link),
      }
    } else if (button.type === "profile") {
      return {
        type: "web_url",
        title: button.title || button.text || button.label || "Visit Profile",
        url: "PROFILE_URL_PLACEHOLDER",
      }
    } else if (button.type === "confirm") {
      return {
        type: "postback",
        title: button.title || button.text || button.label || "I'm following ✅",
        payload: "CONFIRM_FOLLOW",
      }
    } else {
      return {
        type: "postback",
        title: button.title || button.text || button.label || `Button ${index + 1}`,
        payload: button.payload || `BUTTON_${index + 1}`,
      }
    }
  })
}

async function storeContact(
  senderId: string,
  instagramUserId: string,
  workspaceId?: string,
  senderUsername?: string,
  db?: any,
) {
  if (!db) {
    db = await getDatabase()
  }

  try {
    const now = new Date()
    let finalWorkspaceId = workspaceId
    if (!finalWorkspaceId) {
      const account = await findAccountByInstagramId(instagramUserId, db)
      finalWorkspaceId = account?.workspaceId || "default"
    }

    // Get username if not provided
    let finalUsername = senderUsername
    if (!finalUsername) {
      try {
        const account = await findAccountByInstagramId(instagramUserId, db)
        if (account?.accessToken) {
          const userProfile = await getUserProfile(instagramUserId, account.accessToken, senderId)
          finalUsername = userProfile?.username || null
        }
      } catch (error) {
        console.log("⚠️ Could not fetch username:", error)
      }
    }

    const existingContact = await db.collection("contacts").findOne({
      instagramUserId,
      senderId,
      workspaceId: finalWorkspaceId,
    })

    if (existingContact) {
      await db.collection("contacts").updateOne(
        { _id: existingContact._id },
        {
          $set: {
            senderUsername: finalUsername || existingContact.senderUsername,
            lastInteraction: now,
            updatedAt: now,
          },
          $inc: {
            totalInteractions: 1,
          },
        },
      )
      console.log("✅ Contact updated successfully")
    } else {
      const newContact = {
        instagramUserId,
        senderId,
        senderUsername: finalUsername,
        workspaceId: finalWorkspaceId,
        firstInteraction: now,
        lastInteraction: now,
        totalInteractions: 1,
        createdAt: now,
        updatedAt: now,
      }

      await db.collection("contacts").insertOne(newContact)
      console.log("✅ New contact created successfully")
    }
  } catch (error) {
    console.error("❌ Error storing/updating contact:", error)
  }
}

// DM automations engine:
// - Loads active automations for the account (type in ["dm_automation", "generic_dm_automation"])
// - Prioritizes specific_keywords over any_reply
// - On match, delegates to handleDMAutomationFlowEnhanced
async function processDMAutomationsEnhanced(account: any, messagingEvent: any, db: any) {
  try {
    console.log("🔍 === PROCESSING DM AUTOMATIONS ===")

    const messageText = messagingEvent.message?.text || ""
    const senderId = messagingEvent.sender?.id
    const messageId = messagingEvent.message?.mid

    console.log("🔍 DM context:", {
      messageText: messageText.substring(0, 50),
      senderId,
      messageId,
      accountId: account.instagramUserId,
    })

    // Find all workspaces tied to this account (matches story logic)
    const workspaces = await db
      .collection("workspaces")
      .find({
        $or: [
          { instagramUserId: account.instagramUserId },
          { instagramProfessionalId: account.instagramUserId },
          { instagramUserId: account.instagramProfessionalId },
          { instagramProfessionalId: account.instagramProfessionalId },
          { "instagramAccount.instagramUserId": account.instagramUserId },
          { "instagramAccount.instagramProfessionalId": account.instagramUserId },
        ],
      })
      .toArray()

    // Build search scopes; if no workspaces, fall back to account's workspace/id
    let workspaceIds: any[] = []
    if (workspaces.length === 0) {
      console.log("⚠️ No workspaces found for DM processing via IG lookup; falling back to account workspace")
      if (account.workspaceId) workspaceIds = [account.workspaceId]
    } else {
      workspaceIds = workspaces.map((w: any) => w._id)
    }

    const instagramIds = [
      account.instagramUserId,
      account.instagramProfessionalId,
      ...workspaces.map((w: any) => w.instagramUserId),
      ...workspaces.map((w: any) => w.instagramProfessionalId),
      ...workspaces.map((w: any) => w.instagramAccount?.instagramUserId),
      ...workspaces.map((w: any) => w.instagramAccount?.instagramProfessionalId),
    ].filter(Boolean)

    // Note: includes both plain DM and Generic DM types
    const dmAutomations = await db
      .collection("automations")
      .find({
        isActive: true,
        $or: [
          { workspaceId: { $in: workspaceIds } },
          { instagramUserId: { $in: instagramIds } },
          { "account.instagramUserId": { $in: instagramIds } },
        ],
        type: { $in: ["dm_automation", "generic_dm_automation"] },
      })
      .toArray()

    console.log(`📋 Found ${dmAutomations.length} active DM automations for this account`)

    if (dmAutomations.length === 0) {
      return
    }

    const keywordSpecificAutomations = []
    const anyReplyAutomations = []

    for (const automation of dmAutomations) {
      if (automation.trigger?.keywordMode === "specific_keywords") {
        keywordSpecificAutomations.push(automation)
      } else if (automation.trigger?.keywordMode === "any_reply") {
        anyReplyAutomations.push(automation)
      }
    }

    const prioritizedAutomations = [...keywordSpecificAutomations, ...anyReplyAutomations]

    for (const automation of prioritizedAutomations) {
      let shouldTrigger = false

      if (automation.trigger?.keywordMode === "any_reply") {
        shouldTrigger = true
      } else if (automation.trigger?.keywordMode === "specific_keywords") {
        const keywords = automation.trigger.triggerKeywords || automation.trigger.keywords || []
        const text = (messageText || "").toLowerCase()
        shouldTrigger = keywords.some((kw: string) => {
          const k = (kw || "").toLowerCase()
          const match = k.length > 0 && text.includes(k)
          console.log(`🔎 DM keyword check: message="${messageText}" keyword="${kw}" -> ${match}`)
          return match
        })
      }

      if (shouldTrigger) {
        console.log(`🚀 Triggering DM automation: ${automation.name}`)
        await handleDMAutomationFlowEnhanced(automation, account, senderId, messageText, messageId, db)
        return // prevent multiple automations firing
      }
    }

    console.log("⚠️ No matching DM automations found for message")
  } catch (error) {
    console.error("❌ Error processing DM automations:", error)
  }
}

// Executes the selected DM automation flow step-by-step:
// 1) Optional openingDM with buttons
// 2) Optional askFollow with buttons
// 3) Optional askEmail (waits for email response via user state)
// 4) Main DM:
//    - If actions.sendDM.elements exists and non-empty, send Generic Template (carousel)
//    - Else, send plain DM with optional buttons
async function handleDMAutomationFlowEnhanced(
  automation: any,
  account: any,
  senderId: string,
  messageText: string,
  messageId: string,
  db: any,
) {
  try {
    console.log("🔄 === HANDLING DM AUTOMATION FLOW ===")
    console.log("🔄 Automation actions:", JSON.stringify(automation.actions, null, 2))

    let success = false
    let currentStep = 1

    // STEP 1: Send opening DM with buttons (if enabled)
    if (automation.actions?.openingDM?.enabled && automation.actions.openingDM.message) {
      console.log("📤 STEP 1: Sending opening DM with buttons...")

      const openingSuccess = await sendDirectMessageWithButtons(
        account.instagramUserId,
        account.accessToken,
        senderId,
        automation.actions.openingDM.message,
        transformButtons(automation.actions.openingDM.buttons) || [],
      )

      console.log("📤 Opening DM result:", openingSuccess)

      if (openingSuccess) {
        success = true
        await updateAccountUsage(account, "opening_dm", automation.name, messageText)

        // Store user state for button flow
        await storeUserState(senderId, account.instagramUserId, automation._id, "awaiting_opening_response", db)

        // Don't proceed to next steps immediately - wait for button click
        await logAutomation(automation, senderId, messageId, messageText, true, account.instagramUserId, db)
        return
      }
      currentStep++
    }

    // STEP 2: Ask follow with buttons (if enabled and no opening DM)
    if (
      automation.actions?.askFollow?.enabled &&
      automation.actions.askFollow.message &&
      !automation.actions?.openingDM?.enabled
    ) {
      console.log("📤 STEP 2: Asking user to follow with buttons...")

      const followSuccess = await sendDirectMessageWithButtons(
        account.instagramUserId,
        account.accessToken,
        senderId,
        automation.actions.askFollow.message,
        transformButtons(automation.actions.askFollow.buttons) || [],
      )

      console.log("📤 Ask follow result:", followSuccess)

      if (followSuccess) {
        success = true
        await updateAccountUsage(account, "ask_follow", automation.name, messageText)

        // Store user state for follow flow
        await storeUserState(senderId, account.instagramUserId, automation._id, "awaiting_follow_confirmation", db)

        // Don't proceed to main DM immediately - wait for follow confirmation
        await logAutomation(automation, senderId, messageId, messageText, true, account.instagramUserId, db)
        return
      }
      currentStep++
    }

    // STEP 3: Ask email (if enabled)
    if (automation.actions?.askEmail?.enabled && automation.actions.askEmail.message) {
      console.log("📧 STEP 3: Asking for email...")

      // Fetch workspace Instagram username for profile URL
      let profileUrl = ""
      try {
        const profileResponse = await fetch(
          `https://graph.instagram.com/v24.0/${account.instagramUserId}?fields=username&access_token=${account.accessToken}`,
        )
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          profileUrl = `https://instagram.com/${profileData.username}`
        }
      } catch (error) {
        console.log("⚠️ Could not fetch profile URL for email step:", error)
      }

      const emailButtons =
        automation.actions.askEmail.buttons?.map((button: any) => ({
          ...button,
          url:
            button.type === "web_url" && button.url?.includes("PROFILE_URL_PLACEHOLDER")
              ? button.url.replace("PROFILE_URL_PLACEHOLDER", profileUrl)
              : button.url,
        })) || []

      // Send a plain DM asking for the user's email (no buttons)
      const askMessage = automation.actions.askEmail.message || "Please share your email address so I can send you the link."
      const emailSent = await sendDirectMessage(account.instagramUserId, account.accessToken, senderId, askMessage)

      console.log("📧 Ask email result:", emailSent)

      if (emailSent) {
        success = true
        await updateUserState(senderId, account.instagramUserId, automation._id, "awaiting_email", db)
        await updateAccountUsage(account, "ask_email", automation.name, messageText)

        // Wait for email response
        await logAutomation(automation, senderId, messageId, messageText, true, account.instagramUserId, db)
        return
      } else {
        // Skip to main DM if email step fails
        console.log("📤 Email step failed, proceeding to main DM")
        await sendMainDM(automation, account, senderId, db)
        await logAutomation(automation, senderId, messageId, messageText, true, account.instagramUserId, db)
        return
      }
      currentStep++
    }

    // STEP 4: Send main DM (generic template if elements exist, otherwise buttons/text)
    if (
      (Array.isArray(automation.actions?.sendDM?.elements) && automation.actions.sendDM.elements.length > 0 ||
        !!automation.actions?.sendDM?.message) &&
      !automation.actions?.openingDM?.enabled &&
      !automation.actions?.askFollow?.enabled
    ) {
      console.log("📤 STEP 4: Sending main DM with buttons...")

      let mainDMSuccess = false

      // If generic template elements are provided, prefer sending generic template
      // This is the path used by the new Generic DM builder (type: generic_dm_automation)
      if (Array.isArray(automation.actions.sendDM.elements) && automation.actions.sendDM.elements.length > 0) {
        mainDMSuccess = await sendGenericTemplate(
          account.instagramUserId,
          account.accessToken,
          senderId,
          automation.actions.sendDM.elements,
        )
      }

      // Fallback to button/text template if generic template not sent
      if (!mainDMSuccess) {
        mainDMSuccess = await sendDirectMessageWithButtons(
          account.instagramUserId,
          account.accessToken,
          senderId,
          automation.actions.sendDM.message,
          transformButtons(automation.actions.sendDM.buttons) || [],
        )
      }

      console.log("📤 Main DM result:", mainDMSuccess)
      success = mainDMSuccess

      if (success) {
        await storeOrUpdateContact(
          account.instagramUserId,
          senderId,
          null,
          "dm_sent",
          automation.name,
          db,
          account.workspaceId,
        )

        await updateAccountUsage(account, "main_dm", automation.name, messageText)
        await clearUserState(senderId, account.instagramUserId, db)

        // Send branding message for free users
        await sendBrandingMessageIfNeeded(account, senderId, db, automation.name)
      }
    }

    await logAutomation(automation, senderId, messageId, messageText, success, account.instagramUserId, db)
  } catch (error) {
    console.error("❌ Error in DM automation flow:", error)
    await logAutomation(automation, senderId, messageId, messageText, false, account.instagramUserId, db)
  }
}
