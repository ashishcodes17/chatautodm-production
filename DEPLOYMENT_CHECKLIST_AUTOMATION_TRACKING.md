# 🚀 Automation Run Tracking - Deployment Checklist

## Pre-Deployment

- [x] Core tracking function created (`lib/automation-tracking.ts`)
- [x] Webhook integration completed (all automation types)
- [x] API endpoint updated to return stats
- [x] Migration scripts created
- [x] Database indexes script created
- [x] TypeScript compilation verified (no errors)
- [x] Documentation created

## Deployment Steps (Run in Order)

### Step 1: Database Migrations
Run these scripts on your production database:

```bash
# Connect to production environment
# Ensure MONGODB_URI is set

# 1. Initialize totalRuns field for existing automations
node scripts/add-automation-runs-fields.js

# 2. Create performance indexes
node scripts/add-automation-runs-indexes.js
```

**Expected Output:**
- Script 1: Shows count of updated automations
- Script 2: Lists created indexes

### Step 2: Deploy Code
```bash
# Commit changes
git add .
git commit -m "feat: Add automation run tracking system"

# Push to production
git push origin main
```

### Step 3: Verify Deployment

#### 3.1 Check API Response
```bash
# Test automation endpoint
curl https://your-domain.com/api/workspaces/[wsid]/automations
```

Should see:
```json
{
  "automations": [{
    "totalRuns": 0,
    "lastRunAt": null,
    "stats": {
      "totalRuns": 0,
      "last24Hours": 0
    }
  }]
}
```

#### 3.2 Monitor Logs
Watch for these log messages when automations trigger:
- `✅ [TRACKING] Automation run tracked: [id] (opening_dm)`
- `ℹ️ [TRACKING] Duplicate run skipped for user [id]`

#### 3.3 Check Database
```javascript
// MongoDB console
db.automation_runs.find().limit(5)
// Should show run records

db.automations.findOne()
// Should have totalRuns and lastRunAt fields
```

## Post-Deployment Monitoring

### Week 1: Watch for Issues
- [ ] Monitor error logs for `[TRACKING]` errors
- [ ] Verify run counts are incrementing
- [ ] Check automation stats in frontend
- [ ] Ensure no performance degradation

### Week 2: Performance Check
- [ ] Query response times remain fast (<200ms)
- [ ] Database size growth is reasonable
- [ ] Indexes are being used (check query plans)

### Week 4: Data Validation
- [ ] Run counts match expected trigger volume
- [ ] No duplicate counting issues
- [ ] TTL index is cleaning old data

## Rollback Plan

If issues occur:

### Remove Tracking Calls (Emergency)
1. Comment out `trackAutomationRun()` calls in webhook
2. Deploy immediately
3. System continues without tracking

### Remove Stats from API (If needed)
1. Remove stats calculation from GET endpoint
2. Deploy
3. Frontend won't show stats but won't break

## Success Criteria

✅ **Deployment is successful if:**
1. Automation API returns `stats` field
2. `totalRuns` increments when automations trigger
3. No errors in production logs
4. Frontend can display run counts (when integrated)
5. Database queries remain fast

## Support

If you encounter issues:
1. Check `AUTOMATION_RUNS_TRACKING.md` for details
2. Review `[TRACKING]` logs in console
3. Verify indexes: `db.automation_runs.getIndexes()`
4. Check migration ran: `db.automations.findOne({ totalRuns: { $exists: true } })`

## Notes

- ⏰ Tracking is real-time (no delays)
- 🔒 Non-blocking (won't break automations)
- 📊 Deduplication prevents inflated counts
- 🗑️ Auto-cleanup after 90 days
- 🚀 Production-ready and tested

---

**Status:** Ready to Deploy ✅
**Risk Level:** Low (non-breaking changes)
**Estimated Time:** 5-10 minutes
