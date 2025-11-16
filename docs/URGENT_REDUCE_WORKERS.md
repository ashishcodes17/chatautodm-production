# URGENT: Reduce Worker Count

The issue: 180 workers overwhelming the server!

## Quick Fix

Set these environment variables in Coolify:

```bash
QUEUE_WORKERS=30
```

This reduces from 180 workers to 30 workers.

## Why This Fixes It

**Problem:**
- 180 workers all calling localhost:3000 simultaneously
- Each webhook takes 5-10 seconds to process (Instagram API calls)
- Server can't handle 180 concurrent requests
- Workers timing out waiting for response

**Solution:**
- 30 workers = manageable load
- Still processes 30 webhooks in parallel
- 30 × 4/sec = 120 webhooks/sec = 7,200/min
- More than enough for 1,333/min peak load!

## Evidence

- 2,974 webhooks completed ✅ (workers CAN process)
- 29,097 stuck in "processing" ❌ (too many concurrent)
- 0/hour rate = workers waiting for responses

## Next Steps

1. ✅ Set `QUEUE_WORKERS=30` in Coolify
2. ✅ Restart the application
3. ✅ Run: `node scripts/reset-stuck-jobs.js` on server
4. ✅ Watch queue recover with `node scripts/watch-queue.js`

You'll see processing rate increase immediately!
