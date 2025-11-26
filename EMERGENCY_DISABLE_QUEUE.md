# 🚨 EMERGENCY: Disable Queue System

## Problem
18,828 jobs stuck in processing with 0 completed. Workers cannot connect to server.

## IMMEDIATE ACTION - Disable Queue

### In Coolify Dashboard:

**CHANGE this environment variable:**
\`\`\`bash
USE_QUEUE_SYSTEM=false
\`\`\`

### Then:
1. **Save** the environment variable
2. **Redeploy** the application
3. **Wait 2 minutes** for deployment to complete

## What This Does

✅ **Stops workers from running** - no more stuck jobs
✅ **Processes webhooks directly** - your automations will work again
✅ **Gives us time to debug** - we can fix the worker connection properly

## Verify It Worked

After redeploying, run:
\`\`\`bash
curl https://www.chatautodm.com/api/webhooks/queue-stats
\`\`\`

You should see workers have stopped (or the endpoint might return an error since queue is disabled - that's OK).

**Test an automation:**
1. Send a DM to your Instagram account
2. You should get an automated response within 5-10 seconds
3. This confirms automations are working again

## Clean Up Stuck Jobs Later

Once queue is disabled and automations are working, we can clean up:

\`\`\`bash
# SSH to server
ssh your-server

# Navigate to app
cd /path/to/chatautodm-web

# Delete stuck jobs
node scripts/reset-stuck-jobs.js

# Or manually via MongoDB
mongo mongodb://ashish:...@62.72.42.195:27017/instaautodm
use instaautodm
db.webhook_queue.updateMany(
  { status: "processing" },
  { $set: { status: "failed", failedAt: new Date(), error: "Worker connection issue - manual cleanup" } }
)
\`\`\`

## Next Steps (After Disabling)

We'll debug why workers can't connect:
1. Check Coolify networking configuration
2. Test different internal URLs
3. Possibly refactor workers to call processing logic directly instead of HTTP

But FIRST - disable the queue to get your automations working!
