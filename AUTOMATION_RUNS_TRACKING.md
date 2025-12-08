# Automation Run Tracking System

## Overview

This system tracks automation runs to provide analytics on how many times each automation has been triggered.

## What Counts as a "Run"?

An automation run is counted when **any of the first actions trigger**:

### Comment-to-DM Flow
A run is counted when ANY of these happen:
- ✅ Comment reply sent
- ✅ Opening DM sent
- ✅ Follow check sent (if no opening DM)
- ✅ Main DM sent (if no opening DM or follow check)

### Story Reply Flow
A run is counted when ANY of these happen:
- ✅ Opening DM sent
- ✅ Follow check sent (if no opening DM)
- ✅ Main DM sent (if no opening DM or follow check)

### DM Auto Responder
A run is counted when ANY of these happen:
- ✅ Opening DM sent
- ✅ Follow check sent (if no opening DM)
- ✅ Main DM sent (if no opening DM or follow check)

## Database Schema

### Collection: `automation_runs`
```javascript
{
  _id: ObjectId,
  automationId: String,        // Reference to automations._id
  workspaceId: String,          // Reference to workspaces._id
  triggerType: String,          // "opening_dm", "ask_follow", "main_dm", "comment_reply"
  userId: String,               // Instagram user ID who triggered it
  metadata: {
    messageText?: String,       // The message that triggered it
    postId?: String,            // For comment-to-DM flows
    storyId?: String,           // For story reply flows
    conversationId?: String     // Instagram conversation ID
  },
  createdAt: Date
}
```

### Updated: `automations` collection
Added fields:
```javascript
{
  totalRuns: Number,           // Total number of times this automation has run
  lastRunAt: Date,             // Timestamp of last run
  // ... existing fields
}
```

## Implementation Details

### Deduplication
- Runs are deduplicated per user within a 1-hour window
- If the same user triggers the same automation within 1 hour, it's not counted as a separate run
- This prevents inflated counts from multiple messages in the same conversation

### Performance
- Run counting uses the `totalRuns` field on automation documents (O(1) read)
- Historical data is in `automation_runs` collection with indexed queries
- TTL index auto-deletes runs older than 90 days to prevent DB bloat

## API Updates

### GET `/api/workspaces/[workspaceId]/automations`

**Response now includes:**
```json
{
  "success": true,
  "automations": [
    {
      "_id": "auto_123",
      "name": "Welcome Flow",
      "type": "dm_automation",
      "totalRuns": 152,
      "lastRunAt": "2025-12-08T10:30:00Z",
      "stats": {
        "totalRuns": 152,
        "last24Hours": 12
      },
      // ... other fields
    }
  ]
}
```

## Setup Instructions

### 1. Run Migration (One-time)
Initialize tracking fields for existing automations:
```bash
node scripts/add-automation-runs-fields.js
```

### 2. Create Indexes (One-time)
Add performance indexes to automation_runs collection:
```bash
node scripts/add-automation-runs-indexes.js
```

### 3. Deploy
The tracking is automatically enabled in production once deployed.

## Monitoring

### Check Automation Stats
```javascript
// In Node.js/API
const { getAutomationRunStats } = require('@/lib/automation-tracking')

const stats = await getAutomationRunStats(automationId)
// Returns: { totalRuns, last24Hours, last7Days }
```

### Query Run History
```javascript
// Get all runs for an automation
const runs = await db.collection("automation_runs")
  .find({ automationId: "auto_123" })
  .sort({ createdAt: -1 })
  .limit(100)
  .toArray()
```

## Frontend Integration

Automation stats are automatically included in the automation list response.

Example usage in React:
```tsx
{automations.map(automation => (
  <div key={automation._id}>
    <h3>{automation.name}</h3>
    <p>Total Runs: {automation.stats.totalRuns}</p>
    <p>Last 24h: {automation.stats.last24Hours}</p>
    <p>Last Run: {automation.lastRunAt 
      ? new Date(automation.lastRunAt).toLocaleString() 
      : 'Never'
    }</p>
  </div>
))}
```

## Important Notes

⚠️ **Production Considerations:**
- Tracking is designed to be non-blocking (doesn't throw errors)
- Failed tracking won't break automation execution
- Indexes ensure queries remain fast even with millions of runs
- TTL index auto-cleans old data (90 days retention)

🔍 **Troubleshooting:**
- If counts seem low, check console logs for `[TRACKING]` messages
- Verify indexes are created: `db.automation_runs.getIndexes()`
- Check for deduplication: same user in 1 hour = single run

## Future Enhancements

Potential additions:
- ✨ Success/failure tracking per run
- ✨ Conversion tracking (did user complete flow?)
- ✨ A/B testing support
- ✨ Real-time analytics dashboard
- ✨ Export run data to CSV/Excel
