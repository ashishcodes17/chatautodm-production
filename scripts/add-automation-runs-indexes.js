/**
 * Add indexes for automation_runs collection
 * 
 * This ensures fast queries for automation run tracking
 * Usage: node scripts/add-automation-runs-indexes.js
 */

require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required")
  process.exit(1)
}

async function addAutomationRunsIndexes() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db()
    const runsCollection = db.collection("automation_runs")

    console.log("\n📊 Creating indexes for automation_runs collection...\n")

    // Index for finding runs by automationId (most common query)
    await runsCollection.createIndex(
      { automationId: 1, createdAt: -1 },
      { name: "automationId_createdAt" }
    )
    console.log("✅ Created index: automationId_createdAt")

    // Index for deduplication check (automation + user + recent time)
    await runsCollection.createIndex(
      { automationId: 1, userId: 1, createdAt: -1 },
      { name: "automationId_userId_createdAt" }
    )
    console.log("✅ Created index: automationId_userId_createdAt")

    // Index for workspace queries
    await runsCollection.createIndex(
      { workspaceId: 1, createdAt: -1 },
      { name: "workspaceId_createdAt" }
    )
    console.log("✅ Created index: workspaceId_createdAt")

    // Note: TTL index removed - keeping all run data forever for historical tracking

    console.log("\n✅ All indexes created successfully!\n")

    // Show all indexes
    const indexes = await runsCollection.indexes()
    console.log("📋 Current indexes on automation_runs:")
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`)
    })

  } catch (error) {
    console.error("❌ Index creation error:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("\n✅ MongoDB connection closed")
  }
}

// Run index creation
addAutomationRunsIndexes()
  .then(() => {
    console.log("\n🎉 All done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  })
