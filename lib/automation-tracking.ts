import { getDatabase } from "@/lib/mongodb"

/**
 * Track an automation run
 * 
 * What counts as a "run":
 * - Comment-to-DM Flow: When ANY of these trigger: comment reply, opening DM, follow check, main DM
 * - Story Reply Flow: When ANY of these trigger: opening DM, follow check, main DM
 * - DM Auto Responder: When ANY of these trigger: opening DM, follow check, main DM
 * 
 * Note: All runs are stored forever for historical tracking
 * 
 * @param automationId - The automation ID
 * @param workspaceId - The workspace ID
 * @param triggerType - The trigger type (e.g., "comment_reply", "opening_dm", "ask_follow", "main_dm")
 * @param userId - The Instagram user ID who triggered it
 * @param metadata - Additional metadata (optional)
 */
export async function trackAutomationRun(
  automationId: string,
  workspaceId: string,
  triggerType: string,
  userId: string,
  metadata?: {
    messageText?: string
    postId?: string
    storyId?: string
    conversationId?: string
  }
) {
  try {
    const db = await getDatabase()
    
    // Check if we've already tracked this run for this user (dedup within same conversation)
    const existingRun = await db.collection("automation_runs").findOne({
      automationId,
      userId,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Within last hour
    })
    
    // If this is the first trigger in this conversation, count it as a run
    if (!existingRun) {
      await db.collection("automation_runs").insertOne({
        automationId,
        workspaceId,
        triggerType,
        userId,
        metadata: metadata || {},
        createdAt: new Date(),
      })
      
      // Increment the run count on the automation document
      await db.collection("automations").updateOne(
        { _id: automationId } as any,
        {
          $inc: { totalRuns: 1 },
          $set: { lastRunAt: new Date(), updatedAt: new Date() }
        }
      )
      
      console.log(`✅ [TRACKING] Automation run tracked: ${automationId} (${triggerType})`)
      return true
    } else {
      console.log(`ℹ️ [TRACKING] Duplicate run skipped for user ${userId} (already tracked in last hour)`)
      return false
    }
  } catch (error) {
    console.error("❌ [TRACKING] Error tracking automation run:", error)
    // Don't throw - tracking failure shouldn't break the automation
    return false
  }
}

/**
 * Get automation run statistics
 */
export async function getAutomationRunStats(automationId: string) {
  try {
    const db = await getDatabase()
    
    const totalRuns = await db.collection("automation_runs").countDocuments({ automationId })
    
    const last24Hours = await db.collection("automation_runs").countDocuments({
      automationId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    
    const last7Days = await db.collection("automation_runs").countDocuments({
      automationId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    
    return {
      totalRuns,
      last24Hours,
      last7Days
    }
  } catch (error) {
    console.error("❌ [TRACKING] Error getting automation stats:", error)
    return {
      totalRuns: 0,
      last24Hours: 0,
      last7Days: 0
    }
  }
}
