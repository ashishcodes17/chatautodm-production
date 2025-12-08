/**
 * Migration Script: Add totalRuns and lastRunAt fields to existing automations
 * 
 * Run this once to initialize tracking fields for existing automations
 * Usage: node scripts/add-automation-runs-fields.js
 */

require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required")
  process.exit(1)
}

async function migrateAutomationFields() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db()
    const automationsCollection = db.collection("automations")

    // Find all automations without totalRuns field
    const automationsToUpdate = await automationsCollection
      .find({
        totalRuns: { $exists: false }
      })
      .toArray()

    console.log(`\n📊 Found ${automationsToUpdate.length} automations to update\n`)

    if (automationsToUpdate.length === 0) {
      console.log("✅ All automations already have tracking fields")
      return
    }

    // Update each automation
    let updated = 0
    for (const automation of automationsToUpdate) {
      const result = await automationsCollection.updateOne(
        { _id: automation._id },
        {
          $set: {
            totalRuns: 0,
            lastRunAt: null,
            updatedAt: new Date()
          }
        }
      )

      if (result.modifiedCount > 0) {
        updated++
        console.log(`✅ Updated automation: ${automation.name} (${automation._id})`)
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updated} automations\n`)

  } catch (error) {
    console.error("❌ Migration error:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("✅ MongoDB connection closed")
  }
}

// Run migration
migrateAutomationFields()
  .then(() => {
    console.log("\n🎉 All done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  })
