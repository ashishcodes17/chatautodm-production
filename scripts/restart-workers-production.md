# EMERGENCY: Restart Production Workers

## Problem
Workers crashed after deployment. Only 15 out of 30 are alive. Queue backing up.

## BEST SOLUTION: Restart Workers on Coolify

\`\`\`bash
# SSH into your Coolify server
ssh your-server

# Restart all workers (this will restart the entire app including workers)
# Coolify should auto-restart workers when you redeploy or restart the service
\`\`\`

## Alternative: Use Coolify Dashboard
1. Go to Coolify dashboard
2. Find your chatautodm-web application
3. Click "Restart" button
4. This will restart all workers with the new code

## Why This is Better Than Emergency Script
- Workers are ALREADY configured to run (30 workers)
- Workers have retry logic, error handling, metrics
- Emergency script would add load to production API
- Simple restart fixes the issue properly

## After Restart - Monitor Progress
\`\`\`bash
# Run this locally to monitor
node scripts/queue-speed.js
\`\`\`

You should see:
- 30 workers active (check with `node scripts/check-worker-activity.js`)
- Processing speed: 250-400 webhooks/min
- Queue draining: 14,956 → 10,000 → 5,000 → 1,000 → 0
- Time to clear: ~40-60 minutes

## If You Can't Access Coolify
Then we need a different emergency approach - but restarting workers is THE solution.
