# 🚨 URGENT: Worker Fix Deployment

## Problem Identified

Workers are **starting but not processing** because:
1. Workers call `http://localhost:3000` which doesn't work in all environments
2. Workers might be re-queueing their own requests (infinite loop)

## What Was Fixed

### 1. **Dynamic URL Detection** (`scripts/simple-worker-fallback.js`)
- Workers now check environment variables for correct URL
- Falls back to localhost:3000 if not set
- Added better error logging

### 2. **Infinite Loop Prevention** (`app/api/webhooks/instagram/route.ts`)
- Workers send `X-Internal-Worker: true` header
- Route skips queueing if request comes from worker
- Prevents workers from creating infinite queue loops

### 3. **New Environment Variable**
```bash
WEBHOOK_INTERNAL_URL=http://localhost:3000
```

## Deployment Steps

### Option A: Quick Fix (If server is accessible on localhost)
Just add this environment variable in Coolify:
```
WEBHOOK_INTERNAL_URL=http://localhost:3000
```

Then push the code (already done automatically if you pushed).

### Option B: If localhost doesn't work
Try these alternatives in Coolify:
```bash
# Try 1: Use 127.0.0.1
WEBHOOK_INTERNAL_URL=http://127.0.0.1:3000

# Try 2: Use 0.0.0.0
WEBHOOK_INTERNAL_URL=http://0.0.0.0:3000

# Try 3: Use your actual domain (less ideal)
WEBHOOK_INTERNAL_URL=https://yourdomain.com
```

## Verify Fix

After Coolify redeploys, check logs for:

✅ **Good signs:**
```
🔗 Calling webhook processor: http://localhost:3000/api/webhooks/instagram
🔄 Worker 1: Processing job 507f1f77bcf86cd799439011
✅ Worker 1: Completed job 507f1f77bcf86cd799439011
```

❌ **Bad signs:**
```
❌ Worker 1: Fatal error: Cannot connect to http://localhost:3000
❌ Worker 1: Error: ECONNREFUSED
```

If you see ECONNREFUSED, try the alternatives in Option B above.

## Testing

```bash
# 1. Check queue stats
curl https://yourdomain.com/api/webhooks/queue-stats

# 2. Trigger a test webhook (send a DM to your Instagram)

# 3. Check logs in Coolify - should see worker processing messages
```

## Rollback Plan

If this doesn't work, disable queue system temporarily:
```
USE_QUEUE_SYSTEM=false
```

This will process webhooks directly (old behavior, slower but functional).
