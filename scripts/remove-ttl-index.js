/**
 * Remove TTL index from automation_runs collection
 * 
 * This removes the auto-deletion index so all runs are kept forever
 * Usage: node scripts/remove-ttl-index.js
 */

require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required")
  process.exit(1)
}

async function removeTTLIndex() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db()
    const runsCollection = db.collection("automation_runs")

    console.log("\n🗑️ Removing TTL index from automation_runs collection...\n")

    // Check if the index exists
    const indexes = await runsCollection.indexes()
    const hasTTL = indexes.some(index => index.name === "createdAt_ttl")

    if (hasTTL) {
      await runsCollection.dropIndex("createdAt_ttl")
      console.log("✅ Removed TTL index: createdAt_ttl")
      console.log("✅ All automation runs will now be kept forever\n")
    } else {
      console.log("ℹ️ TTL index not found - already removed or never created\n")
    }

    // Show remaining indexes
    const remainingIndexes = await runsCollection.indexes()
    console.log("📋 Current indexes on automation_runs:")
    remainingIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`)
    })

  } catch (error) {
    console.error("❌ Error removing TTL index:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("\n✅ MongoDB connection closed")
  }
}

// Run removal
removeTTLIndex()
  .then(() => {
    console.log("\n🎉 All done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  })
