/**
 * Backfill totalRuns counts from automation_runs collection
 * 
 * This fixes the count for automations that already have runs
 * Usage: node scripts/backfill-automation-counts.js
 */

require('dotenv').config({ path: '.env.local' })

const { MongoClient, ObjectId } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required")
  process.exit(1)
}

async function backfillCounts() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db()
    
    console.log("\n📊 Calculating actual run counts from automation_runs...\n")

    // Get actual counts from automation_runs collection
    const runCounts = await db.collection("automation_runs").aggregate([
      { $group: { _id: "$automationId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray()

    console.log(`Found ${runCounts.length} automations with runs\n`)

    let updated = 0
    let failed = 0

    for (const item of runCounts) {
      const automationId = item._id
      const actualCount = item.count

      try {
        // Try to convert to ObjectId if it's a valid hex string
        let query
        if (typeof automationId === 'string' && automationId.match(/^[0-9a-fA-F]{24}$/)) {
          query = { _id: new ObjectId(automationId) }
        } else {
          query = { _id: automationId }
        }

        // Get current automation
        const automation = await db.collection("automations").findOne(query)
        
        if (automation) {
          const currentCount = automation.totalRuns || 0
          
          // Update the count
          const result = await db.collection("automations").updateOne(
            query,
            {
              $set: {
                totalRuns: actualCount,
                updatedAt: new Date()
              }
            }
          )

          if (result.modifiedCount > 0) {
            console.log(`✅ Updated ${automation.name}: ${currentCount} → ${actualCount} runs`)
            updated++
          }
        } else {
          console.log(`⚠️ Automation not found: ${automationId}`)
          failed++
        }
      } catch (error) {
        console.error(`❌ Error updating ${automationId}:`, error.message)
        failed++
      }
    }

    console.log(`\n✅ Backfill complete!`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Failed: ${failed}\n`)

  } catch (error) {
    console.error("❌ Backfill error:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("✅ MongoDB connection closed")
  }
}

// Run backfill
backfillCounts()
  .then(() => {
    console.log("\n🎉 All done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  })
