import Redis from "ioredis"

let redisClient: Redis | null = null

/**
 * Get Redis client (singleton)
 */
function getRedisClient(): Redis {
  if (redisClient && redisClient.status === "ready") {
    return redisClient
  }

  try {
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
    console.log("✅ Redis connected for thumbnails")
    return redisClient
  } catch (error) {
    console.error("❌ Redis connection error:", error)
    throw error
  }
}

/**
 * Fetch thumbnail from Instagram and store in Redis
 * @param postId - Instagram media ID
 * @param accessToken - Instagram access token
 * @param type - 'post' or 'story'
 * @returns Redis key for the thumbnail
 */
export async function fetchAndStoreThumbnail(
  postId: string,
  accessToken: string,
  type: 'post' | 'story' = 'post'
): Promise<string | null> {
  try {
    const redis = getRedisClient()

    const redisKey = `thumbnail:${type}:${postId}`

    // Check if already cached
    const exists = await redis.exists(redisKey)
    if (exists) {
      console.log(`✅ Thumbnail already cached: ${redisKey}`)
      return redisKey
    }

    // Fetch media from Instagram API
    console.log(`📥 Fetching thumbnail for ${type} ${postId}...`)
    const response = await fetch(
      `https://graph.instagram.com/${postId}?fields=id,media_type,media_url,thumbnail_url&access_token=${accessToken}`
    )

    if (!response.ok) {
      console.error(`❌ Instagram API error: ${response.status}`)
      return null
    }

    const mediaData = await response.json()
    
    // Get thumbnail URL (use thumbnail_url for videos, media_url for images)
    const thumbnailUrl = mediaData.thumbnail_url || mediaData.media_url
    
    if (!thumbnailUrl) {
      console.error(`❌ No thumbnail URL found for ${postId}`)
      return null
    }

    // Download the image
    const imageResponse = await fetch(thumbnailUrl)
    if (!imageResponse.ok) {
      console.error(`❌ Failed to download thumbnail: ${imageResponse.status}`)
      return null
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBytes = Buffer.from(imageBuffer)

    // Store in Redis as binary (no expiry - forever)
    // ioredis automatically stores Buffer as binary
    await redis.set(redisKey, imageBytes as any)
    
    console.log(`✅ Stored thumbnail in Redis: ${redisKey} (${(imageBytes.length / 1024).toFixed(1)} KB)`)
    
    return redisKey

  } catch (error) {
    console.error("❌ Error fetching and storing thumbnail:", error)
    return null
  }
}

/**
 * Get thumbnail from Redis
 * @param redisKey - Redis key (e.g., "thumbnail:post:12345")
 * @returns Image buffer or null
 */
export async function getThumbnailFromRedis(redisKey: string): Promise<Buffer | null> {
  try {
    const redis = getRedisClient()

    const imageData = await redis.getBuffer(redisKey)
    
    if (!imageData) {
      console.log(`⚠️ Thumbnail not found: ${redisKey}`)
      return null
    }

    return imageData

  } catch (error) {
    console.error("❌ Error getting thumbnail from Redis:", error)
    return null
  }
}

/**
 * Delete thumbnail from Redis
 * @param redisKey - Redis key
 */
export async function deleteThumbnailFromRedis(redisKey: string): Promise<boolean> {
  try {
    const redis = getRedisClient()

    await redis.del(redisKey)
    console.log(`🗑️ Deleted thumbnail: ${redisKey}`)
    return true

  } catch (error) {
    console.error("❌ Error deleting thumbnail:", error)
    return false
  }
}

/**
 * Get Redis memory stats
 */
export async function getThumbnailStats() {
  try {
    const redis = await getRedisClient()
    if (!redis) return null

    const keys = await redis.keys("thumbnail:*")
    const info = await redis.info("memory")
    
    return {
      thumbnailCount: keys.length,
      memoryInfo: info,
    }

  } catch (error) {
    console.error("❌ Error getting stats:", error)
    return null
  }
}
