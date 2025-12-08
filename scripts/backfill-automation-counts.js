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

    // Get all automations first
    const automations = await db.collection("automations").find({}).toArray()
    
    console.log(`Found ${automations.length} total automations\n`)

    let updated = 0
    let failed = 0
    let skipped = 0

    for (const automation of automations) {
      try {
        const automationId = automation._id
        
        // Count runs for this automation (check both string and ObjectId formats)
        const stringId = automationId.toString()
        const actualCount = await db.collection("automation_runs").countDocuments({
          $or: [
            { automationId: stringId },
            { automationId: automationId }
          ]
        })

        if (actualCount === 0) {
          skipped++
          continue
        }

        const currentCount = automation.totalRuns || 0
        
        // Only update if the count changed
        if (currentCount !== actualCount) {
          const result = await db.collection("automations").updateOne(
            { _id: automationId },
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
          skipped++
        }
      } catch (error) {
        console.error(`❌ Error updating ${automation._id}:`, error.message)
        failed++
      }
    }

    console.log(`\n✅ Backfill complete!`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped (no change or no runs): ${skipped}`)
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
