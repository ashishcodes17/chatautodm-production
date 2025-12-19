/**
 * Script to add "plan" field to all workspaces and instagram_accounts
 * 
 * Features:
 * 1. Adds "plan: freeby" to all existing workspaces that don't have a plan field
 * 2. Adds "plan: freeby" to all existing instagram_accounts that don't have a plan field
 * 3. Can upgrade specific creators to "pro" plan to remove branding
 * 
 * Usage:
 * - To add default plan to all: npx tsx scripts/add-plan-to-workspaces.ts
 * - To upgrade specific creators: Edit the CREATORS_TO_UPGRADE array below
 * 
 * ⚠️ PRODUCTION CODE - Run with caution!
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set')
  process.exit(1)
}

// ✅ Add Instagram usernames of creators who requested branding removal
// Example: ['creator_username_1', 'creator_username_2', 'nice_creator']
const CREATORS_TO_UPGRADE: string[] = [
  // Add usernames here
  // 'example_creator',
]

async function addPlanToWorkspaces() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('instaautodm')
    const workspacesCollection = db.collection('workspaces')
    const instagramAccountsCollection = db.collection('instagram_accounts')
    
    console.log('\n🔄 Starting migration...\n')
    
    // ============================================================
    // STEP 1: Add default "freeby" plan to all workspaces without a plan
    // ============================================================
    console.log('📊 Step 1: Adding default plan to workspaces...')
    
    const workspacesResult = await workspacesCollection.updateMany(
      { plan: { $exists: false } },
      { $set: { plan: 'freeby' } }
    )
    
    console.log(`   ✅ Updated ${workspacesResult.modifiedCount} workspaces with default plan "freeby"`)
    
    // ============================================================
    // STEP 2: Add default "freeby" plan to all instagram_accounts without a plan
    // ============================================================
    console.log('\n📊 Step 2: Adding default plan to instagram_accounts...')
    
    const accountsResult = await instagramAccountsCollection.updateMany(
      { plan: { $exists: false } },
      { $set: { plan: 'freeby' } }
    )
    
    console.log(`   ✅ Updated ${accountsResult.modifiedCount} instagram_accounts with default plan "freeby"`)
    
    // ============================================================
    // STEP 3: Upgrade specific creators to "pro" plan
    // ============================================================
    if (CREATORS_TO_UPGRADE.length > 0) {
      console.log('\n📊 Step 3: Upgrading specific creators to "pro" plan...')
      console.log(`   🎯 Creators to upgrade: ${CREATORS_TO_UPGRADE.join(', ')}`)
      
      for (const username of CREATORS_TO_UPGRADE) {
        try {
          // Find instagram account by username
          const account = await instagramAccountsCollection.findOne({ username })
          
          if (!account) {
            console.log(`   ⚠️  Account not found: @${username}`)
            continue
          }
          
          // Update the account to pro
          await instagramAccountsCollection.updateOne(
            { _id: account._id },
            { $set: { plan: 'pro', upgradedAt: new Date() } }
          )
          
          // Update the associated workspace to pro
          if (account.workspaceId) {
            await workspacesCollection.updateOne(
              { _id: account.workspaceId },
              { $set: { plan: 'pro', upgradedAt: new Date() } }
            )
          }
          
          console.log(`   ✅ Upgraded @${username} to PRO plan (branding removed)`)
        } catch (err) {
          console.error(`   ❌ Error upgrading @${username}:`, err)
        }
      }
    } else {
      console.log('\n📊 Step 3: Skipping creator upgrades (no creators specified)')
    }
    
    // ============================================================
    // STEP 4: Summary and verification
    // ============================================================
    console.log('\n📊 Final Statistics:')
    
    const totalWorkspaces = await workspacesCollection.countDocuments()
    const freebyWorkspaces = await workspacesCollection.countDocuments({ plan: 'freeby' })
    const proWorkspaces = await workspacesCollection.countDocuments({ plan: 'pro' })
    
    const totalAccounts = await instagramAccountsCollection.countDocuments()
    const freebyAccounts = await instagramAccountsCollection.countDocuments({ plan: 'freeby' })
    const proAccounts = await instagramAccountsCollection.countDocuments({ plan: 'pro' })
    
    console.log('\n   Workspaces:')
    console.log(`   - Total: ${totalWorkspaces}`)
    console.log(`   - Freeby Plan: ${freebyWorkspaces}`)
    console.log(`   - Pro Plan: ${proWorkspaces}`)
    
    console.log('\n   Instagram Accounts:')
    console.log(`   - Total: ${totalAccounts}`)
    console.log(`   - Freeby Plan: ${freebyAccounts}`)
    console.log(`   - Pro Plan: ${proAccounts}`)
    
    console.log('\n✅ Migration completed successfully!')
    console.log('\n💡 Branding behavior:')
    console.log('   - Freeby plan users: Will see "Sent by ChatAutoDM⚡" branding')
    console.log('   - Pro plan users: No branding messages sent')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await client.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

// ============================================================
// DRY RUN FUNCTION (Safe preview before running actual migration)
// ============================================================
async function dryRun() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('instaautodm')
    
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n')
    
    const workspacesWithoutPlan = await db.collection('workspaces').countDocuments({ plan: { $exists: false } })
    const accountsWithoutPlan = await db.collection('instagram_accounts').countDocuments({ plan: { $exists: false } })
    
    console.log('📊 What will be updated:')
    console.log(`   - ${workspacesWithoutPlan} workspaces will get "freeby" plan`)
    console.log(`   - ${accountsWithoutPlan} instagram_accounts will get "freeby" plan`)
    
    if (CREATORS_TO_UPGRADE.length > 0) {
      console.log(`\n🎯 Creators to upgrade to PRO (${CREATORS_TO_UPGRADE.length}):`)
      for (const username of CREATORS_TO_UPGRADE) {
        const account = await db.collection('instagram_accounts').findOne({ username })
        if (account) {
          console.log(`   ✅ @${username} - FOUND (will be upgraded)`)
        } else {
          console.log(`   ⚠️  @${username} - NOT FOUND (will be skipped)`)
        }
      }
    }
    
    console.log('\n💡 To apply these changes, run the script without --dry-run flag')
    
  } finally {
    await client.close()
  }
}

// ============================================================
// Run the script
// ============================================================
const isDryRun = process.argv.includes('--dry-run')

if (isDryRun) {
  console.log('🔍 Running in DRY RUN mode...\n')
  dryRun().catch(console.error)
} else {
  console.log('⚠️  PRODUCTION MODE - Changes will be applied!\n')
  addPlanToWorkspaces().catch(console.error)
}
