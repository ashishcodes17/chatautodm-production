# Workspace Plan Migration Script

This script adds a `plan` field to all workspaces and Instagram accounts in the database, and allows upgrading specific creators to "pro" plan to remove branding.

## 📋 Overview

### What it does:
1. **Adds default plan**: Sets `plan: "freeby"` to all workspaces and instagram_accounts that don't have a plan field
2. **Upgrades creators**: Allows upgrading specific creators to `plan: "pro"` to remove branding
3. **Safe operation**: Includes dry-run mode to preview changes before applying

### Branding Behavior:
- **Freeby plan** (`plan: "freeby"`): Users will see "Sent by ChatAutoDM⚡- Grow your DMs on AutoPilot" branding message
- **Pro plan** (`plan: "pro"`): No branding messages sent (see webhook code at line 2058 in `app/api/webhooks/instagram/route.ts`)

## 🚀 Usage

### 1. Dry Run (Safe Preview)

Always run this first to see what will change:

```bash
npx tsx scripts/add-plan-to-workspaces.ts --dry-run
```

This will show:
- How many workspaces will be updated
- How many instagram_accounts will be updated
- Which creators will be upgraded (if any are specified)
- Which creators were not found

### 2. Apply Changes

Once you're satisfied with the dry run results:

```bash
npx tsx scripts/add-plan-to-workspaces.ts
```

## 👥 Upgrading Creators to Pro

To remove branding for specific creators who asked nicely:

1. Open `scripts/add-plan-to-workspaces.ts`
2. Find the `CREATORS_TO_UPGRADE` array (around line 20)
3. Add Instagram usernames:

```typescript
const CREATORS_TO_UPGRADE: string[] = [
  'nice_creator_username',
  'another_creator',
  'polite_user',
]
```

4. Run the script (dry run first!)

```bash
npx tsx scripts/add-plan-to-workspaces.ts --dry-run
npx tsx scripts/add-plan-to-workspaces.ts
```

## 🔍 Verification

After running the script, verify the changes:

### Check a specific user's plan:
```javascript
// In MongoDB shell or Compass
db.instagram_accounts.findOne({ username: "creator_username" }, { plan: 1, username: 1 })
```

### Count by plan:
```javascript
// Workspaces
db.workspaces.countDocuments({ plan: "freeby" })
db.workspaces.countDocuments({ plan: "pro" })

// Instagram Accounts
db.instagram_accounts.countDocuments({ plan: "freeby" })
db.instagram_accounts.countDocuments({ plan: "pro" })
```

### Find all pro users:
```javascript
db.instagram_accounts.find({ plan: "pro" }, { username: 1, plan: 1 })
```

## 📝 Database Schema Changes

### Before:
```typescript
// Workspaces and instagram_accounts had no plan field
{
  _id: "ws_123",
  userId: "user_123",
  name: "@creator",
  // ... other fields
}
```

### After:
```typescript
// Default users
{
  _id: "ws_123",
  userId: "user_123",
  name: "@creator",
  plan: "freeby",  // ✅ NEW - will show branding
  // ... other fields
}

// Upgraded users
{
  _id: "ws_456",
  userId: "user_456",
  name: "@nice_creator",
  plan: "pro",  // ✅ NEW - no branding
  upgradedAt: ISODate("2025-12-19T..."),  // ✅ NEW - timestamp of upgrade
  // ... other fields
}
```

## 🔄 How Branding Works

Check the webhook code at [app/api/webhooks/instagram/route.ts](../app/api/webhooks/instagram/route.ts):

```typescript
async function sendBrandingMessageIfNeeded(account: any, senderId: string, db: any, automationName: string) {
  try {
    // ✅ Check if user has pro plan - if yes, skip branding
    if (account.plan !== "free" && account.plan) {
      console.log("⚠️ Skipping branding for paid user")
      return
    }

    // ... rest of branding logic for freeby users
    console.log("📤 Sending branding message for free user...")
    // Sends: "Sent by ChatAutoDM⚡- Grow your DMs on AutoPilot"
  }
}
```

**Branding is sent when:**
- User has `plan: "freeby"` OR
- User has no plan field (before migration) OR  
- User has `plan: "free"`

**Branding is NOT sent when:**
- User has `plan: "pro"` ✅
- User has `plan: "elite"`
- User has any other non-free plan value

## 🛠 Future Creators

To add new creators to pro plan after initial migration:

1. Update the `CREATORS_TO_UPGRADE` array in the script
2. Run: `npx tsx scripts/add-plan-to-workspaces.ts --dry-run`
3. If looks good: `npx tsx scripts/add-plan-to-workspaces.ts`

The script is idempotent - it won't downgrade existing pro users to freeby.

## ⚠️ Important Notes

1. **Backup First**: Although the script is safe (only adds fields, doesn't delete), consider backing up your database before running in production
2. **Check Dry Run**: Always run with `--dry-run` first
3. **Production Code**: This is production code that affects live users
4. **Case Sensitive**: Instagram usernames in `CREATORS_TO_UPGRADE` are case-sensitive
5. **Both Collections**: The script updates both `workspaces` AND `instagram_accounts` collections

## 📊 Example Output

```
✅ Connected to MongoDB

🔄 Starting migration...

📊 Step 1: Adding default plan to workspaces...
   ✅ Updated 145 workspaces with default plan "freeby"

📊 Step 2: Adding default plan to instagram_accounts...
   ✅ Updated 145 instagram_accounts with default plan "freeby"

📊 Step 3: Upgrading specific creators to "pro" plan...
   🎯 Creators to upgrade: nice_creator, polite_user
   ✅ Upgraded @nice_creator to PRO plan (branding removed)
   ✅ Upgraded @polite_user to PRO plan (branding removed)

📊 Final Statistics:

   Workspaces:
   - Total: 145
   - Freeby Plan: 143
   - Pro Plan: 2

   Instagram Accounts:
   - Total: 145
   - Freeby Plan: 143
   - Pro Plan: 2

✅ Migration completed successfully!

💡 Branding behavior:
   - Freeby plan users: Will see "Sent by ChatAutoDM⚡" branding
   - Pro plan users: No branding messages sent

🔌 Disconnected from MongoDB
```

## 🔐 Rollback

If you need to rollback (remove plan field from all documents):

```typescript
// In MongoDB shell - USE WITH CAUTION
db.workspaces.updateMany({}, { $unset: { plan: "", upgradedAt: "" } })
db.instagram_accounts.updateMany({}, { $unset: { plan: "", upgradedAt: "" } })
```

## 📚 Related Files

- Main webhook logic: `app/api/webhooks/instagram/route.ts` (line 2055-2120)
- Account creation: `app/api/instagram/callback/route.ts` (line 143+)
- Usage API: `app/api/workspaces/[workspaceId]/usage/route.ts`
