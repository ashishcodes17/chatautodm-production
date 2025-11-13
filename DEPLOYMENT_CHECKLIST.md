# ✅ Deployment Checklist - Webhook Queue System

## Pre-Deployment (Local)

- [x] Database indexes created on VPS MongoDB ✅
- [ ] Code reviewed and understood
- [ ] Environment variables prepared
- [ ] Team notified about deployment

## Deployment Steps

### Step 1: Backup (5 minutes)
```bash
# On VPS - Backup current code
cd /path/to/chatautodm-web
git branch backup-before-queue-$(date +%Y%m%d)
git push origin backup-before-queue-$(date +%Y%m%d)

# Backup database (optional but recommended)
mongodump --uri="mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm" --out=/tmp/backup-$(date +%Y%m%d)
```

### Step 2: Deploy Code (10 minutes)
```bash
# On local machine:
git add .
git status  # Review changes
git commit -m "feat: add webhook queue system with feature flag (disabled by default)"
git push origin main

# On VPS:
cd /path/to/chatautodm-web
git pull origin main
pnpm install
pnpm build
```

### Step 3: Update Environment Variables (2 minutes)
```bash
# On VPS:
nano .env  # or vim .env

# Add these lines at the end:
USE_QUEUE_SYSTEM=false
QUEUE_WORKERS=180
QUEUE_POLL_INTERVAL=1000
QUEUE_MAX_RETRIES=3
QUEUE_RETRY_DELAY=5000
QUEUE_ENABLE_DEDUPLICATION=true
QUEUE_DEDUPLICATION_WINDOW=10000
QUEUE_ENABLE_RATE_LIMIT=true
QUEUE_MAX_WEBHOOKS_PER_MINUTE=10000
QUEUE_ENABLE_METRICS=true
QUEUE_METRICS_INTERVAL=60000

# Save and exit
```

### Step 4: Restart Server (1 minute)
```bash
# On VPS:
pm2 restart chatautodm

# Verify it's running:
pm2 status
pm2 logs chatautodm --lines 50
```

- [ ] Server restarted successfully
- [ ] No errors in logs
- [ ] Can access website

### Step 5: Test Queue Endpoint (1 minute)
```bash
# On VPS or local:
curl http://your-vps-ip:3000/api/webhooks/queue-stats | jq

# Or on local machine:
node scripts/test-queue.js
```

- [ ] Queue stats endpoint works
- [ ] Shows healthy status

### Step 6: Enable Queue System (5 minutes - CAREFUL!)
```bash
# On VPS:
nano .env

# Change this line:
USE_QUEUE_SYSTEM=true  # ⚠️ Changed from false to true

# Save and exit

# Restart Next.js:
pm2 restart chatautodm

# Start workers:
pm2 start scripts/start-workers.js --name "webhook-workers"

# Save PM2 config:
pm2 save
```

- [ ] Queue system enabled
- [ ] Workers started
- [ ] Both processes running (chatautodm + webhook-workers)

### Step 7: Verify Workers (2 minutes)
```bash
# Check worker logs:
pm2 logs webhook-workers --lines 50

# Should see:
# "🚀 Started 180 workers"
# "👷 Worker X started"
```

- [ ] Workers started successfully
- [ ] No errors in worker logs

### Step 8: Send Test Webhook (5 minutes)
```bash
# Trigger a real webhook:
# - Comment on an Instagram post
# - Send a DM
# - Reply to a story

# Watch logs:
pm2 logs chatautodm --lines 0 &
pm2 logs webhook-workers --lines 0 &

# Check queue stats:
curl http://localhost:3000/api/webhooks/queue-stats | jq
```

- [ ] Webhook received (logs show "✅ Webhook queued successfully")
- [ ] Worker processed it (logs show "🔄 Worker X: Processing job")
- [ ] Job completed (logs show "✅ Worker X: Completed job")
- [ ] Message sent to user
- [ ] Queue stats show 1 completed job

### Step 9: Spike Test (10 minutes - IMPORTANT!)
```bash
# Trigger 10-20 webhooks quickly:
# - Have multiple people comment
# - Or use Instagram's test webhooks feature
# - Or reply to multiple stories

# Monitor:
pm2 monit  # Watch CPU and memory
curl http://localhost:3000/api/webhooks/queue-stats | jq -r '.queue | to_entries | .[] | "\(.key): \(.value)"'

# Watch logs in real-time:
pm2 logs --lines 100
```

- [ ] All webhooks queued successfully
- [ ] Workers processing in parallel
- [ ] CPU stays under 90%
- [ ] No crashes or errors
- [ ] All messages sent to users
- [ ] Queue clears (pending goes back to 0)

### Step 10: Monitor for 1 Hour (60 minutes)
```bash
# Set up monitoring (run in tmux/screen):
watch -n 60 'curl -s http://localhost:3000/api/webhooks/queue-stats | jq'

# Keep logs visible:
pm2 logs --lines 50
```

**Watch for:**
- [ ] Queue stays healthy (pending < 100)
- [ ] Success rate > 99%
- [ ] No memory leaks (memory stable)
- [ ] CPU normal (40-80%)
- [ ] No failed jobs

## Post-Deployment Monitoring

### First 24 Hours - Check Every Hour
```bash
# Quick health check:
curl http://localhost:3000/api/webhooks/queue-stats | jq '.health'

# If status is "warning" or "critical":
# 1. Check worker logs: pm2 logs webhook-workers
# 2. Increase workers if needed
# 3. Check for errors in dead letter queue
```

### Daily Monitoring
```bash
# Morning check:
pm2 status
curl http://localhost:3000/api/webhooks/queue-stats | jq

# Check for failed jobs:
mongo
> use instaautodm
> db.webhook_dead_letter.countDocuments()
```

## Rollback Plan (If Needed)

### OPTION 1: Disable Queue (30 seconds)
```bash
nano .env
# Change: USE_QUEUE_SYSTEM=false
pm2 restart chatautodm
pm2 stop webhook-workers
```

### OPTION 2: Git Rollback (2 minutes)
```bash
git log --oneline | head -5  # Find commit before queue
git revert <commit-hash>
pnpm build
pm2 restart chatautodm
pm2 stop webhook-workers
```

### OPTION 3: Full Restore (5 minutes)
```bash
git checkout backup-before-queue-YYYYMMDD
pnpm install
pnpm build
pm2 restart chatautodm
pm2 stop webhook-workers
```

## Success Criteria ✅

- [ ] Website accessible and working normally
- [ ] Webhooks being processed (check automation logs)
- [ ] Messages being sent to users
- [ ] Queue stats showing healthy
- [ ] CPU usage stable (40-85%)
- [ ] No errors in logs
- [ ] Workers running continuously
- [ ] Can handle 100+ webhooks without issues
- [ ] Success rate > 99%
- [ ] Response time < 100ms

## Troubleshooting

### Workers not processing jobs
```bash
# Check if workers are running:
pm2 status

# Restart workers:
pm2 restart webhook-workers

# Check MongoDB connection:
mongo mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm
```

### Queue building up (pending > 1000)
```bash
# Increase workers:
nano .env
# Change: QUEUE_WORKERS=360
pm2 restart webhook-workers
```

### High CPU usage
```bash
# Reduce workers:
nano .env
# Change: QUEUE_WORKERS=90
pm2 restart webhook-workers
```

### Memory leak
```bash
# Restart workers periodically:
pm2 restart webhook-workers --cron "0 */6 * * *"
```

## Emergency Contacts

- Queue Stats: `curl http://localhost:3000/api/webhooks/queue-stats`
- Worker Logs: `pm2 logs webhook-workers`
- Server Logs: `pm2 logs chatautodm`
- System Monitor: `pm2 monit`

## Notes

- Date Deployed: _______________
- Deployed By: _______________
- Initial Queue Workers: 180
- Any Issues: _______________
- Performance: _______________

---

**Remember:** You can ALWAYS disable the queue instantly by setting `USE_QUEUE_SYSTEM=false` and restarting. No data will be lost.
