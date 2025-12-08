/**
 * Backfill Thumbnails Script
 * 
 * Downloads and caches Instagram post/story thumbnails for all existing automations
 * that have selectedPost or selectedStory fields.
 * 
 * Usage: node scripts/backfill-thumbnails.mjs
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Redis from 'ioredis'
import { MongoClient } from 'mongodb'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI
const REDIS_URL = process.env.REDIS_URL

if (!MONGODB_URI || !REDIS_URL) {
  console.error('Missing required environment variables')
  console.error('MONGODB_URI:', !!MONGODB_URI)
  console.error('REDIS_URL:', !!REDIS_URL)
  process.exit(1)
}

async function fetchThumbnailFromInstagram(postId, accessToken) {
  const url = `https://graph.instagram.com/${postId}?fields=id,media_type,media_url,thumbnail_url&access_token=${accessToken}`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok || data.error) {
      console.error(`Failed to fetch media ${postId}:`, data.error?.message || 'Unknown error')
      return null
    }
    
    if (data.media_type === 'VIDEO') {
      // For videos, use thumbnail_url instead of media_url
      const thumbnailUrl = data.thumbnail_url
      if (!thumbnailUrl) {
        console.log(`No thumbnail available for video ${postId}`)
        return null
      }
      const imageResponse = await fetch(thumbnailUrl)
      if (!imageResponse.ok) {
        console.error(`Failed to download video thumbnail for ${postId}`)
        return null
      }
      const arrayBuffer = await imageResponse.arrayBuffer()
      return Buffer.from(arrayBuffer)
    }
    
    // Fetch the image binary for photos
    const imageResponse = await fetch(data.media_url)
    if (!imageResponse.ok) {
      console.error(`Failed to download image for ${postId}`)
      return null
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error(`Error fetching thumbnail for ${postId}:`, error.message)
    return null
  }
}

async function main() {
  console.log('Starting thumbnail backfill...\n')
  
  // Connect to MongoDB
  const mongoClient = new MongoClient(MONGODB_URI)
  await mongoClient.connect()
  console.log('✓ Connected to MongoDB')
  
  const db = mongoClient.db()
  const automations = db.collection('automations')
  const instagramAccounts = db.collection('instagram_accounts')
  const workspaces = db.collection('workspaces')
  
  // Connect to Redis
  const redisClient = new Redis(REDIS_URL)
  console.log('✓ Connected to Redis\n')
  
  // Find all automations with selectedPost or selectedStory
  const cursor = automations.find({
    $or: [
      { selectedPost: { $exists: true, $ne: null } },
      { selectedStory: { $exists: true, $ne: null } }
    ]
  })
  
  const total = await automations.countDocuments({
    $or: [
      { selectedPost: { $exists: true, $ne: null } },
      { selectedStory: { $exists: true, $ne: null } }
    ]
  })
  
  console.log(`Found ${total} automations with media to process\n`)
  
  let processed = 0
  let succeeded = 0
  let failed = 0
  let skipped = 0
  
  // Cache for workspace -> access token mapping
  const tokenCache = new Map()
  
  for await (const automation of cursor) {
    processed++
    const postId = automation.selectedPost || automation.selectedStory
    const type = automation.selectedPost ? 'post' : 'story'
    const thumbnailKey = `thumbnail:${type}:${postId}`
    
    console.log(`[${processed}/${total}] Processing ${automation.name} (${type}: ${postId})`)
    
    // Check if thumbnail already exists in Redis
    const exists = await redisClient.exists(thumbnailKey)
    if (exists) {
      console.log(`  → Already cached, skipping`)
      skipped++
      continue
    }
    
    // Get access token for this automation's workspace
    const workspaceId = automation.workspaceId
    
    if (!workspaceId) {
      console.log(`  → No workspace ID found, skipping`)
      failed++
      continue
    }
    
    let accessToken = tokenCache.get(workspaceId)
    if (!accessToken) {
      // Find instagram account for this workspace
      const account = await instagramAccounts.findOne({ workspaceId })
      if (account?.accessToken) {
        accessToken = account.accessToken
        tokenCache.set(workspaceId, accessToken)
      } else {
        // Fallback: try workspace.accessToken
        const workspace = await workspaces.findOne({ _id: workspaceId })
        if (workspace?.accessToken) {
          accessToken = workspace.accessToken
          tokenCache.set(workspaceId, accessToken)
        }
      }
    }
    
    if (!accessToken) {
      console.log(`  → No access token found for workspace ${workspaceId}, skipping`)
      failed++
      continue
    }
    
    // Fetch thumbnail from Instagram
    const imageBuffer = await fetchThumbnailFromInstagram(postId, accessToken)
    
    if (!imageBuffer) {
      console.log(`  → Failed to fetch (likely expired token)`)
      failed++
      continue
    }
    
    // Store in Redis
    await redisClient.set(thumbnailKey, imageBuffer)
    
    // Update automation document with thumbnailKey
    await automations.updateOne(
      { _id: automation._id },
      { $set: { thumbnailKey } }
    )
    
    console.log(`  → ✅ Cached ${imageBuffer.length} bytes`)
    succeeded++
    
    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`\n=== Backfill Complete ===`)
  console.log(`Total: ${total}`)
  console.log(`✅ Succeeded: ${succeeded}`)
  console.log(`⏭️  Skipped (already cached): ${skipped}`)
  console.log(`❌ Failed (expired tokens): ${failed}`)
  console.log(`\n💡 Note: Failed automations will get thumbnails when users edit them or create new automations.`)
  
  await redisClient.quit()
  await mongoClient.close()
}

main().catch(console.error)
