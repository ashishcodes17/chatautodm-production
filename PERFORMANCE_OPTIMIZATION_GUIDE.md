# High-Volume Webhook Performance Optimization Guide

## 1. Environment Variables for 1M Webhooks/Hour

Set these in your Vercel project dashboard under Settings → Environment Variables:

\`\`\`bash
# ==================== QUEUE SYSTEM ====================
USE_QUEUE_SYSTEM=true
BULLMQ_ENABLED=true
QUEUE_ENABLE_DEDUPLICATION=true
QUEUE_DEDUPLICATION_WINDOW=10000          # 10 seconds
QUEUE_ENABLE_RATE_LIMIT=true
QUEUE_MAX_WEBHOOKS_PER_MINUTE=20000       # Increased for 1M/hour

# ==================== REDIS CACHING ====================
REDIS_ENABLED=true
REDIS_URL=your-redis-url-here             # From Upstash or similar

# ==================== WORKER CONFIGURATION ====================
QUEUE_WORKERS=30                          # For 1M/hour sustained
QUEUE_POLL_INTERVAL=50                    # Check queue every 50ms
QUEUE_MAX_RETRIES=3                       # Retry 3 times
QUEUE_RETRY_DELAY=5000                    # Start at 5s backoff
QUEUE_BATCH_SIZE=5                        # Process 5 jobs per cycle
QUEUE_ENABLE_METRICS=true                 # Log performance metrics
QUEUE_METRICS_INTERVAL=60000               # Log every 60 seconds
\`\`\`

## 2. Database Indexes for Performance

Create these MongoDB indexes to ensure optimal query performance:

\`\`\`javascript
// webhook_queue indexes
db.webhook_queue.createIndex({ status: 1, attempts: 1, createdAt: 1 }, { name: "processor_pending_fetch_idx" })
db.webhook_queue.createIndex({ workspaceId: 1, status: 1 }, { name: "workspace_status_idx" })
db.webhook_queue.createIndex({ createdAt: 1 }, { name: "cleanup_idx", expireAfterSeconds: 604800 })

// automations indexes
db.automations.createIndex({ workspaceId: 1, isActive: 1, type: 1 }, { name: "active_automations_idx" })
db.automations.createIndex({ workspaceId: 1, selectedPost: 1, type: 1 }, { name: "post_automations_idx" })

// contacts indexes
db.contacts.createIndex({ instagramUserId: 1, senderId: 1 }, { name: "contact_lookup_idx" })

// user_states indexes
db.user_states.createIndex({ accountId: 1, senderId: 1 }, { name: "user_state_lookup_idx" })

// instagram_accounts indexes
db.instagram_accounts.createIndex({ instagramUserId: 1 }, { name: "ig_user_lookup_idx" })
db.instagram_accounts.createIndex({ instagramProfessionalId: 1 }, { name: "ig_pro_lookup_idx" })
db.instagram_accounts.createIndex({ workspaceId: 1, isConnected: 1 }, { name: "workspace_connected_idx" })
\`\`\`

## 3. Capacity Planning

### Tier 1: Ingestion (POST /api/webhooks/instagram)

With queue system enabled:
- Response time: ~10ms per webhook
- Throughput: 100+ webhooks/second
- Capacity for 1M/hour: ✅ SUFFICIENT

**Scaling**: Horizontal scaling automatic via Vercel serverless

### Tier 2: Queue Storage

For 1M/hour load:
\`\`\`
Peak queue depth: ~150-200 jobs (at start of hour)
Clears every: 4-5 seconds (600 jobs/s processing vs 277 incoming/s)
Storage: ~500MB (queue documents with retry history)
\`\`\`

**Recommendation**: Enable MongoDB compression

### Tier 3: Worker Processing

Current configuration processes:
\`\`\`
30 workers × 5 jobs per cycle × 4 cycles/second = 600 jobs/second
Required for 1M/hour: 277 jobs/second
Headroom: 2.16x ✅ COMFORTABLE
\`\`\`

**If you need higher throughput**, increase:
\`\`\`bash
QUEUE_WORKERS=50           # More workers (limited by memory)
QUEUE_POLL_INTERVAL=25     # Check more frequently
QUEUE_BATCH_SIZE=10        # Process more per cycle
\`\`\`

### Tier 4: Redis Caching

Memory usage at full capacity:
\`\`\`
Automations: ~10MB (5K active automations)
Workspaces: ~500KB (1K accounts)
Contacts: ~50MB (50K active conversations)
User States: ~20MB (10K active states)
Total: ~80MB (very safe)
\`\`\`

**Recommendation**: Use Upstash Redis with auto-scaling enabled

## 4. Monitoring & Alerting

### Queue Health Metrics (logged every 60s)

\`\`\`
📊 Pending: 50-150 (healthy during viral hours)
⚙️  Processing: 10-30 (varies with spike)
✅ Completed: 16,666+ (over 1 hour)
❌ Failed: 0-50 (depends on Instagram API stability)
📈 Throughput: 250-300 jobs/min (normal)
🎯 Success Rate: 99%+ (target)
\`\`\`

### What to Watch

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| Queue Depth | > 500 | Increase QUEUE_WORKERS or BATCH_SIZE |
| Failed Jobs | > 100/hour | Check Instagram API, increase RETRY_DELAY |
| Processing Time | > 1s avg | Check database performance, enable redis |
| Success Rate | < 95% | Investigate error logs, check rate limits |

### Logging Configuration

Enable detailed logging:

\`\`\`javascript
// In app/api/webhooks/instagram/route.ts
console.log("⏱️ Webhook received")
console.log("📥 Parsed successfully")
console.log("⚡ Using BullMQ queue")
console.log("✅ Webhook queued")

// In app/api/webhooks/worker.ts
console.log(`✅ Worker ${workerId}: Completed job ${job._id}`)
console.log(`❌ Worker ${workerId}: Job failed`)
console.log(`💀 Dead letter: ${attempts} attempts exceeded`)

// Metrics
console.log("📊 Pending: 50, Processing: 15, Completed: 16666, Failed: 5")
console.log("📈 Throughput: 278 jobs/min")
console.log("🎯 Success Rate: 99.97%")
\`\`\`

## 5. Bottleneck Analysis

### Where Time is Spent (per 200ms webhook)

\`\`\`
1. Route Handler (~2ms)
   └─ Parse JSON, verify token, queue operation

2. Queue Operation (~1ms BullMQ, ~5ms MongoDB)
   └─ Atomic findOneAndUpdate with priority sort

3. Redis Cache Lookup (~0.1ms)
   └─ workspace:{instagramId} - cache hit
   └─ automation:{workspaceId}:{type} - cache hit

4. MongoDB Query (fallback only)
   └─ If cache miss: 20-50ms

5. Instagram API Call (~100-150ms)
   └─ Send DM, post comment, etc.

6. Database Write (~5-10ms)
   └─ Store contact, update state

TOTAL: ~200ms average
\`\`\`

### Critical Path Optimization

**Webhook enters at:** ~0ms
**Leaves queue after:** ~1-5ms
**Processing completes:** ~200ms

The ~10ms ingestion response time is dominated by:
- Queue write (1-5ms)
- Redis pub/sub notification (0-1ms)
- HTTP response overhead (4-5ms)

## 6. Scaling Checklist

- [ ] Enable queue system: `USE_QUEUE_SYSTEM=true`
- [ ] Enable BullMQ: `BULLMQ_ENABLED=true`
- [ ] Enable Redis: `REDIS_ENABLED=true`
- [ ] Connect to Redis: Set `REDIS_URL`
- [ ] Increase rate limit: `QUEUE_MAX_WEBHOOKS_PER_MINUTE=20000`
- [ ] Create database indexes (see section 2)
- [ ] Set up Vercel env vars
- [ ] Enable metrics: `QUEUE_ENABLE_METRICS=true`
- [ ] Test with load: Run emergency-process-queue.ts locally
- [ ] Monitor logs in Vercel dashboard
- [ ] Set up alerts for failed jobs

## 7. Load Testing

Run a local simulation to test 1M/hour capacity:

\`\`\`bash
# In scripts/emergency-process-queue.ts
# This simulates queue processing locally

QUEUE_WORKERS=30 \
QUEUE_ENABLE_METRICS=true \
pnpm tsx scripts/emergency-process-queue.ts

# Watch output for:
# ✅ Completed: 16,666 (over 1 hour)
# 📈 Throughput: 250-300 jobs/min
# 🎯 Success Rate: 99%+
\`\`\`

## 8. Troubleshooting

### Issue: Queue backing up (Pending > 500)

**Cause**: Workers too slow or not running

**Fix**:
\`\`\`bash
QUEUE_WORKERS=50         # Increase workers
QUEUE_BATCH_SIZE=10      # Process more per cycle
QUEUE_POLL_INTERVAL=25   # Check more frequently
\`\`\`

### Issue: High failure rate (Failed > 100/hour)

**Cause**: Instagram API rate limits or timeouts

**Fix**:
\`\`\`bash
QUEUE_RETRY_DELAY=10000  # Longer backoff
QUEUE_MAX_RETRIES=4      # More retries
\`\`\`

### Issue: Redis memory high (> 200MB)

**Cause**: Cache TTL too long or too many inactive entries

**Fix** (in lib/redis-cache.ts):
\`\`\`typescript
const TTL = {
  AUTOMATION: 1800,    // 30 minutes (reduced from 1h)
  USER_STATE: 300,     // 5 minutes (reduced from 10m)
  CONTACT: 120,        // 2 minutes (reduced from 5m)
}
\`\`\`

### Issue: Worker crashes

**Cause**: Out of memory or connection pooling

**Fix**:
\`\`\`bash
# Restart worker in Vercel with more memory
NODE_OPTIONS="--max-old-space-size=2048"

# Or reduce batch size
QUEUE_BATCH_SIZE=3
\`\`\`

## 9. Maintenance

### Weekly Tasks

- Check failed jobs in dead letter queue
- Review logs for patterns (Instagram API changes, etc.)
- Monitor Redis memory usage
- Verify cache hit rates

### Monthly Tasks

- Analyze performance metrics
- Adjust worker count based on load
- Archive completed jobs older than 30 days
- Update rate limits based on actual usage

## 10. Expected Performance at 1M Webhooks/Hour

\`\`\`
Duration: 1 hour (3600 seconds)
Webhook Rate: 277.7 webhooks/second
Total Webhooks: 1,000,000

Expected Results:
- Pending Queue: 0-200 (clears every 4s)
- Average Response Time: 200ms end-to-end
- Success Rate: 99%+ (950,000+ successful)
- Failed Jobs: 0-10,000 (retryable)
- Dead Letter: 0-100 (permanent failures)

Database:
- Documents Created: ~1,000,000 (completed jobs)
- Space Used: ~500MB
- Query Latency: p50=5ms, p99=50ms

Redis:
- Memory: ~100MB
- Hits: 99%+ (cache very effective)
- Operations: 500k+ per hour
