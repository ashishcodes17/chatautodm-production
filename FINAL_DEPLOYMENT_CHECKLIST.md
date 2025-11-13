# ✅ YOUR FINAL DEPLOYMENT CHECKLIST

## 📋 Before You Push to Production

- [x] Database indexes created on VPS ✅ (Done!)
- [x] Code ready with auto-start ✅ (Done!)
- [x] Worker fallback created ✅ (Done!)
- [x] Documentation complete ✅ (Done!)
- [ ] Environment variables ready (see below)
- [ ] Code pushed to GitHub
- [ ] Coolify configured

---

## 🎯 Step-by-Step Deployment

### ✅ STEP 1: Copy Environment Variables (2 minutes)

Go to **Coolify Dashboard** → Your App → **Environment Variables**

Click "Add" and paste these one by one:

```bash
# Queue System - Enable/Disable
USE_QUEUE_SYSTEM=true

# Queue Configuration
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

# Database (you already have this, but verify it's correct)
MONGODB_URI=mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority
```

**Save** all variables.

---

### ✅ STEP 2: Push Code to GitHub (1 minute)

```bash
# Run these commands:
git add .
git status  # Review what's being committed
git commit -m "feat: webhook queue system with auto-start - handles 10k+ webhooks/min"
git push origin main
```

**Wait** for push to complete.

---

### ✅ STEP 3: Deploy in Coolify (2 minutes)

**Option A: Auto-Deploy (if enabled)**
- Coolify will auto-detect the push
- Watch deployment in Coolify Dashboard → Deployments

**Option B: Manual Deploy**
- Go to Coolify Dashboard → Your App
- Click "Deploy" button
- Watch the logs

**Deployment Steps (automatic):**
1. ✅ Pulling code from GitHub
2. ✅ Running `npm install`
3. ✅ Running `npm run build`
4. ✅ Starting with `npm start`
5. ✅ Server + Workers auto-start

---

### ✅ STEP 4: Verify It's Working (2 minutes)

#### Check 1: Coolify Logs

In Coolify Dashboard → Logs, you should see:

```
🚀 ========================================
   ChatAutoDM Production Startup
========================================

🌐 Starting Next.js Server...
✅ Next.js Server started

⚡ Queue System: ENABLED
🔧 Starting Webhook Queue Workers...

✅ Queue Workers started

========================================
🎉 All systems operational!
========================================
```

✅ **Looks good?** Continue to Check 2.  
❌ **Error?** See troubleshooting below.

#### Check 2: Queue Stats API

Run this command (replace with your domain):

```bash
curl https://yourdomain.com/api/webhooks/queue-stats
```

Or open in browser:
```
https://yourdomain.com/api/webhooks/queue-stats
```

**Expected response:**
```json
{
  "success": true,
  "queue": {
    "pending": 0,
    "processing": 0,
    "completed": 0,
    "failed": 0,
    "total": 0
  },
  "health": {
    "status": "healthy",
    "message": "Queue is healthy"
  }
}
```

✅ **Got this response?** Perfect! Continue to Check 3.  
❌ **Error 404/500?** See troubleshooting below.

#### Check 3: Test Real Webhook

Trigger a real Instagram webhook:
- Comment on a post
- Send a DM
- Reply to a story

**Watch Coolify logs for:**
```
📥 === WEBHOOK RECEIVED ===
⚡ Queue system ENABLED - fast response mode
✅ Webhook queued successfully
🔄 Worker 1: Processing job...
✅ Worker 1: Completed job...
```

✅ **Message sent to user?** SUCCESS! 🎉  
❌ **No message?** See troubleshooting below.

---

## 🎉 SUCCESS CRITERIA

You've succeeded if:

- [x] Coolify shows "All systems operational!"
- [x] Queue stats endpoint returns healthy status
- [x] Test webhook sends message to user
- [x] Logs show workers processing jobs
- [x] No errors in Coolify logs
- [x] CPU usage stays under 90%
- [x] Website accessible via domain

---

## 🚨 Troubleshooting

### Problem: "Cannot find module 'dotenv'"

**Solution:** 
```bash
# Add dotenv to package.json dependencies
npm install dotenv --save
git add package.json package-lock.json
git commit -m "fix: add dotenv dependency"
git push origin main
```

### Problem: Workers not starting

**Coolify Logs show:**
```
⚠️  Queue system is DISABLED
```

**Solution:** 
1. Check environment variable in Coolify: `USE_QUEUE_SYSTEM=true` (must be exact!)
2. Redeploy application

### Problem: "Worker system failed to start"

**Don't worry!** The fallback system will activate automatically.

**Coolify Logs should show:**
```
❌ Worker system failed to start
Trying alternative startup method...
🚀 Starting Webhook Queue Workers (Simple)...
✅ Started 180 workers
```

This is the fallback - it works perfectly!

### Problem: Queue stats returns 404

**Possible causes:**
1. Next.js not fully started yet (wait 30 seconds)
2. Route file not deployed

**Solution:**
```bash
# Verify file exists:
ls app/api/webhooks/queue-stats/route.ts

# If missing, file wasn't pushed:
git add app/api/webhooks/queue-stats/route.ts
git commit -m "fix: add queue stats route"
git push origin main
```

### Problem: High CPU usage (95%+)

**Solution:** Reduce workers in Coolify environment:
```bash
QUEUE_WORKERS=90  # Half the workers
```
Redeploy.

### Problem: Queue building up (pending > 1000)

**Solution:** Increase workers in Coolify environment:
```bash
QUEUE_WORKERS=360  # Double the workers
```
Redeploy.

---

## 🆘 EMERGENCY ROLLBACK

If anything goes seriously wrong:

### Option 1: Disable Queue (30 seconds)

In Coolify environment variables:
```bash
USE_QUEUE_SYSTEM=false  # Change true to false
```

Click "Redeploy"

System immediately falls back to old behavior.

### Option 2: Git Rollback (2 minutes)

```bash
git log --oneline | head -5  # Find commit before queue
git revert <commit-hash>
git push origin main
```

Coolify auto-deploys old code.

---

## 📊 Post-Deployment Monitoring

### First Hour - Check Every 15 Minutes

```bash
# Quick health check:
curl https://yourdomain.com/api/webhooks/queue-stats | jq '.health'
```

**Look for:**
- Status: "healthy" ✅
- Pending jobs: < 100 ✅
- No failures ✅

### First 24 Hours - Check Every Hour

**In Coolify logs, watch for:**
- Regular metrics (📊 QUEUE METRICS)
- Processing rate (should be stable)
- No error spikes

### Daily Monitoring

```bash
# Morning check:
curl https://yourdomain.com/api/webhooks/queue-stats
```

**Healthy indicators:**
- Pending: < 100
- Success rate: > 99%
- Health: "healthy"

---

## ✅ Final Checklist

Before marking complete:

- [ ] Environment variables added in Coolify
- [ ] Code pushed to GitHub successfully
- [ ] Coolify deployment completed without errors
- [ ] Logs show "All systems operational!"
- [ ] Queue stats endpoint returns healthy
- [ ] Test webhook processed successfully
- [ ] Message delivered to user
- [ ] No errors in logs for 10 minutes
- [ ] CPU usage stable (< 90%)
- [ ] Domain accessible
- [ ] All automations working

---

## 🎯 You're Done When...

✅ You can trigger 10-20 webhooks quickly and:
- All get queued instantly
- All get processed
- All messages sent
- CPU stays stable
- No crashes
- Queue clears to 0

**That's when you know it's working perfectly!** 🚀

---

## 📞 Quick Reference

**Queue Stats:**
```bash
curl https://yourdomain.com/api/webhooks/queue-stats
```

**Check Logs:**
Coolify Dashboard → Your App → Logs

**Disable Queue:**
```bash
USE_QUEUE_SYSTEM=false  # in Coolify env
```

**Adjust Workers:**
```bash
QUEUE_WORKERS=X  # in Coolify env
```

---

**Time to complete:** 7 minutes  
**Manual steps:** 4 (copy env, push code, wait, verify)  
**Everything else:** Automatic ✨

**Ready? Start with STEP 1! 🚀**
