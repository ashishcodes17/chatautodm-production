# ✅ Admin Stats - Production Deployment Checklist

## Overview
Optimized admin stats system that handles **20K-200K DMs/day** without DB/Redis hammering.

---

## Pre-Deployment Setup

### 1. Environment Variables

Add to `.env` or Vercel environment:

```bash
# Required - Generate with: openssl rand -base64 32
CRON_SECRET=your-random-secret-here

# Already configured
REDIS_URL=redis://...
MONGODB_URI=mongodb://...
```

### 2. Generate Cron Secret

```bash
# Generate secure secret
openssl rand -base64 32

# Add to Vercel dashboard:
# Project Settings → Environment Variables → CRON_SECRET
```

---

## Deployment Steps

### Step 1: Deploy Code

```bash
git add .
git commit -m "feat: optimize admin stats for high volume (200K DMs/day)"
git push origin main
```

### Step 2: Verify Vercel Cron

Vercel automatically enables crons from `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/refresh-admin-stats",
    "schedule": "* * * * *"  // Every minute
  }]
}
```

**Check:** Vercel Dashboard → Settings → Cron Jobs
- Should show: `refresh-admin-stats` running every minute

### Step 3: Test Cron Endpoint

```bash
# Test locally first
curl http://localhost:3000/api/cron/refresh-admin-stats \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Should return:
# {"success":true,"timestamp":"2025-12-12T..."}

# Test production
curl https://your-domain.com/api/cron/refresh-admin-stats \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Step 4: Monitor Logs

```bash
# Vercel logs
vercel logs --follow

# Look for:
✅ Cron: Admin stats refreshed successfully
📡 Admin stats update published via Pub/Sub
```

---

## Architecture Overview

```
┌─────────────────────┐
│ Vercel Cron         │  Every 60s
│ (Background Job)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Refresh Stats       │  Compute from DB
│ - estimatedCount    │  Cache in Redis
│ - $sum aggregation  │  Publish to Pub/Sub
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
    ┌──────────┐      ┌──────────┐
    │  Cache   │      │ Pub/Sub  │
    │  Redis   │      │  Redis   │
    └──────────┘      └────┬─────┘
           │               │
           │               ▼
           │        ┌─────────────┐
           │        │ Admin SSE   │ × N connections
           │        │ Streams     │
           │        └─────────────┘
           │               │
           └───────────────┘
                   │
                   ▼
            ┌──────────┐
            │ Browser  │
            │ Updates  │
            └──────────┘
```

---

## Performance Characteristics

### At 200K DMs per 3 days:

| Metric | Value | Notes |
|--------|-------|-------|
| **DM Webhook Overhead** | 0 | No notifications per DM |
| **DB Queries** | 6/min | Only from cron job |
| **Redis Publishes** | 1/min | Rate-limited |
| **SSE Updates** | 1 per 5-30s | Debounced per client |
| **Cache Hit Rate** | 95%+ | Most requests cached |
| **Update Latency** | 5-30s | Acceptable for admin |

---

## Monitoring

### Key Logs to Watch

```bash
# Success indicators
✅ Cron: Admin stats refreshed successfully
✅ Admin stats from cache
📡 Admin stats update published via Pub/Sub

# Rate limiting (normal)
⏱️ Admin stats Pub/Sub rate limited (too frequent)
⏱️ SSE update debounced (too frequent)

# Errors (investigate)
❌ Cron: Failed to refresh admin stats
❌ Error getting admin stats
❌ Redis subscribe error
```

### Health Check

```bash
# Check cache is working
redis-cli get admin:stats:global

# Should return JSON with stats

# Check Pub/Sub subscribers
redis-cli PUBSUB NUMSUB admin:stats:updated

# Should show active SSE connections
```

---

## Scaling Configuration

### For Higher Volume (1M+ DMs/day)

```typescript
// lib/admin-stats-cache.ts
const CACHE_TTL = 120 // Increase to 2 minutes
const MIN_PUBLISH_INTERVAL = 30000 // Increase to 30 seconds
```

```json
// vercel.json - reduce frequency
{
  "crons": [{
    "schedule": "*/2 * * * *"  // Every 2 minutes
  }]
}
```

### For Lower Latency (< 1M DMs/day)

```typescript
// lib/admin-stats-cache.ts
const CACHE_TTL = 30 // Decrease to 30 seconds
const MIN_PUBLISH_INTERVAL = 5000 // Decrease to 5 seconds
```

```json
// vercel.json - increase frequency
{
  "crons": [{
    "schedule": "*/1 * * * *"  // Every minute (already set)
  }]
}
```

---

## Troubleshooting

### Stats Not Updating?

1. **Check cron is running:**
   ```bash
   curl https://your-domain.com/api/cron/refresh-admin-stats \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

2. **Check Redis connection:**
   ```bash
   redis-cli ping
   redis-cli get admin:stats:global
   ```

3. **Check logs for errors:**
   ```bash
   vercel logs --follow | grep "admin stats"
   ```

### Too Frequent Updates?

**Increase rate limits:**
```typescript
const MIN_PUBLISH_INTERVAL = 30000 // 30s
const CLIENT_DEBOUNCE = 10000 // 10s
```

### Too Slow Updates?

**Decrease cache TTL:**
```typescript
const CACHE_TTL = 30 // 30s
```

**Or trigger manual refresh after major events:**
```typescript
import { refreshAdminStatsCache } from "@/lib/admin-stats-cache"
await refreshAdminStatsCache(true) // Force immediate update
```

---

## Rollback Plan

If issues occur:

### Quick Fix - Disable Cron
```bash
# In vercel.json, comment out crons
{
  // "crons": [...]
}
git push
```

### Full Rollback
```bash
git revert HEAD
git push origin main
```

Stats will fall back to:
- ✅ Direct DB queries (slower but works)
- ✅ No caching (higher load but stable)
- ✅ Polling-only SSE (no Pub/Sub)

---

## Post-Deployment Verification

### ✅ Checklist

- [ ] Cron job appears in Vercel dashboard
- [ ] Test endpoint returns success
- [ ] Redis cache is populated (`redis-cli get admin:stats:global`)
- [ ] Admin dashboard loads quickly (< 100ms)
- [ ] SSE updates appear in browser console
- [ ] No errors in Vercel logs
- [ ] Stats update within 60 seconds of DM sent

### Test Commands

```bash
# 1. Test cron
curl https://your-domain.com/api/cron/refresh-admin-stats \
  -H "Authorization: Bearer $CRON_SECRET"

# 2. Check cache
redis-cli get admin:stats:global

# 3. Test SSE
curl -N https://your-domain.com/api/admin/stats/stream

# 4. Load admin dashboard
open https://your-domain.com/admin
```

---

## Performance Benchmarks

### Expected Response Times

```
/api/admin/stats
├─ Cache HIT:  5-20ms   (95%+ of requests)
└─ Cache MISS: 150-300ms (every 60s)

/api/admin/stats/stream
├─ Initial:    20-50ms
└─ Updates:    5-30s latency (via Pub/Sub)

Cron Job
├─ Execution:  150-300ms
└─ Frequency:  Every 60s
```

### Resource Usage

```
MongoDB: 6 queries per minute (constant regardless of DM volume)
Redis:   1 publish per minute + N cache reads
CPU:     Minimal (< 5% during cron)
Memory:  ~50MB for cache + SSE connections
```

---

## Success Criteria

Your deployment is successful if:

✅ Admin dashboard loads in < 100ms
✅ Stats update within 60 seconds
✅ No errors in logs for 24 hours
✅ Cache hit rate > 95%
✅ Handles 200K DMs/day smoothly
✅ Multiple admins can view simultaneously

---

## Support

For issues:
1. Check `docs/HIGH_VOLUME_ADMIN_STATS.md` for detailed architecture
2. Review `docs/REAL_TIME_ADMIN_STATS.md` for Pub/Sub details
3. Monitor Vercel logs: `vercel logs --follow`
4. Check Redis health: `redis-cli ping`

---

**Your admin stats are now production-ready for massive scale! 🚀**
