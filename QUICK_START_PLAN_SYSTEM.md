# Quick Start Guide - Plan System

## 🚀 What You Need to Do

### 1. Run the Migration Script

This adds the `plan` field to all existing workspaces and accounts:

```bash
# First, preview what will change (SAFE - no changes)
npx tsx scripts/add-plan-to-workspaces.ts --dry-run

# Then, apply the changes (PRODUCTION)
npx tsx scripts/add-plan-to-workspaces.ts
```

### 2. Upgrade Specific Creators (When Asked)

When a creator politely asks to remove branding:

**Step 1:** Edit `scripts/add-plan-to-workspaces.ts`

**Step 2:** Add their Instagram username to the array (around line 20):

```typescript
const CREATORS_TO_UPGRADE: string[] = [
  'their_instagram_username',  // Add this
]
```

**Step 3:** Run the script:

```bash
npx tsx scripts/add-plan-to-workspaces.ts --dry-run
npx tsx scripts/add-plan-to-workspaces.ts
```

Done! They won't see branding anymore.

## ✅ What's Already Done

1. ✅ Migration script created and ready
2. ✅ All new accounts get `plan: "freeby"` automatically
3. ✅ Branding system already working (checks `account.plan`)
4. ✅ Documentation created

## 🔍 How to Verify

Check if a user has pro plan (no branding):

```javascript
// In MongoDB
db.instagram_accounts.findOne(
  { username: "creator_name" }, 
  { username: 1, plan: 1 }
)
```

## 📊 Branding Logic

**File:** `app/api/webhooks/instagram/route.ts` (Line 2058)

```typescript
// If plan is NOT "free" and exists → No branding
if (account.plan !== "free" && account.plan) {
  console.log("⚠️ Skipping branding for paid user")
  return
}
```

| Plan | Branding? |
|------|-----------|
| `freeby` | ✅ Yes - Shows branding |
| `pro` | ❌ No - No branding |
| No plan | ✅ Yes - Shows branding |

## 📁 Files Created/Modified

**New Files:**
- `scripts/add-plan-to-workspaces.ts` - Migration script
- `scripts/PLAN_MIGRATION_README.md` - Detailed docs
- `PLAN_IMPLEMENTATION_SUMMARY.md` - Complete summary

**Modified Files:**
- `app/api/instagram/callback/route.ts` - Adds plan to new OAuth accounts
- `app/api/workspaces/route.ts` - Adds plan to new workspaces
- `app/api/workspaces/auto-create/route.ts` - Adds plan to auto-created accounts

**Unchanged (Already Working):**
- `app/api/webhooks/instagram/route.ts` - Branding logic

## 🎯 TL;DR

1. Run: `npx tsx scripts/add-plan-to-workspaces.ts`
2. All users get `plan: "freeby"` (shows branding)
3. To remove branding for nice creators: Add username to array, run script
4. That's it! ✨
