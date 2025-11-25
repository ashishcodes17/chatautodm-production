/**
 * Background Action Worker
 * 
 * Processes Instagram API calls in background
 * This keeps webhook queue moving fast
 * 
 * Run separately: node scripts/background-action-worker.js
 */

require('dotenv').config()
const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI
const WORKERS = 20 // High concurrency for API calls
const POLL_INTERVAL = 100

let isShuttingDown = false
let processedCount = 0

async function processAction(db, action) {
  try {
    // Import Instagram API functions dynamically
    const { sendDirectMessage, sendCommentReply, sendPrivateReply, verifyUserFollowsAccount, getUserProfile } = 
      require('../app/api/webhooks/instagram/route')
    
    switch (action.type) {
      case 'send_dm':
        await sendDirectMessage(
          action.data.instagramId,
          action.data.accessToken,
          action.data.recipientId,
          action.data.message
        )
        break
        
      case 'send_comment_reply':
        await sendCommentReply(
          action.data.instagramId,
          action.data.accessToken,
          action.data.commentId,
          action.data.message
        )
        break
        
      case 'send_private_reply':
        await sendPrivateReply(
          action.data.instagramId,
          action.data.accessToken,
          action.data.commentId,
          action.data.message,
          action.data.buttons || [],
          action.data.imageUrl || null
        )
        break
        
      case 'verify_follow':
        const isFollowing = await verifyUserFollowsAccount(
          action.data.instagramId,
          action.data.accessToken,
          action.data.userId
        )
        // Store result if needed
        if (action.data.callback) {
          await db.collection('follow_verification_results').insertOne({
            userId: action.data.userId,
            accountId: action.accountId,
            isFollowing,
            checkedAt: new Date()
          })
        }
        break
        
      case 'get_user_profile':
        const profile = await getUserProfile(
          action.data.instagramId,
          action.data.accessToken,
          action.data.userId
        )
        // Store profile
        await db.collection('user_profiles').updateOne(
          { userId: action.data.userId },
          { $set: { ...profile, updatedAt: new Date() } },
          { upsert: true }
        )
        break
    }
    
    processedCount++
    return true
    
  } catch (error) {
    console.error(`❌ Action ${action._id} failed:`, error.message)
    throw error
  }
}

async function processNextAction(db, workerId) {
  try {
    // Claim an action atomically
    const action = await db.collection('background_actions').findOneAndUpdate(
      {
        status: 'pending',
        scheduledAt: { $lte: new Date() },
        attempts: { $lt: 3 }
      },
      {
        $set: {
          status: 'processing',
          startedAt: new Date(),
          workerId
        },
        $inc: { attempts: 1 }
      },
      {
        sort: { priority: 1, createdAt: 1 },
        returnDocument: 'after'
      }
    )
    
    if (!action) return false
    
    try {
      await processAction(db, action)
      
      // Mark completed
      await db.collection('background_actions').updateOne(
        { _id: action._id },
        {
          $set: {
            status: 'completed',
            completedAt: new Date()
          }
        }
      )
      
      return true
      
    } catch (error) {
      // Retry or fail
      if (action.attempts >= 3) {
        await db.collection('background_actions').updateOne(
          { _id: action._id },
          {
            $set: {
              status: 'failed',
              failedAt: new Date(),
              error: error.message
            }
          }
        )
      } else {
        await db.collection('background_actions').updateOne(
          { _id: action._id },
          {
            $set: {
              status: 'pending',
              scheduledAt: new Date(Date.now() + 5000) // Retry after 5s
            }
          }
        )
      }
      
      return false
    }
    
  } catch (error) {
    console.error(`❌ Worker ${workerId} error:`, error)
    return false
  }
}

async function workerLoop(db, workerId) {
  console.log(`👷 Background worker ${workerId} started`)
  
  while (!isShuttingDown) {
    const processed = await processNextAction(db, workerId)
    
    if (!processed) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
    }
  }
  
  console.log(`👷 Background worker ${workerId} stopped`)
}

async function main() {
  console.log('\n🚀 ========== BACKGROUND ACTION WORKER ==========')
  console.log(`Workers: ${WORKERS}`)
  console.log(`Poll Interval: ${POLL_INTERVAL}ms`)
  console.log('===============================================\n')
  
  const client = await MongoClient.connect(MONGODB_URI)
  const db = client.db()
  
  // Create index
  await db.collection('background_actions').createIndex(
    { status: 1, priority: 1, scheduledAt: 1 },
    { background: true }
  )
  
  // Start workers
  const workers = []
  for (let i = 1; i <= WORKERS; i++) {
    workers.push(workerLoop(db, i))
  }
  
  // Stats logger
  setInterval(() => {
    console.log(`📊 Processed: ${processedCount} actions`)
  }, 30000)
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    isShuttingDown = true
  })
  process.on('SIGINT', () => {
    isShuttingDown = true
  })
  
  await Promise.all(workers)
  await client.close()
}

main().catch(console.error)
