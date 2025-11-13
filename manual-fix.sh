#!/bin/bash

# Manual Fix Script - Apply Worker Fixes Without Git Push
# Run this on your server if GitHub push fails
# Usage: ssh your-server "bash -s" < manual-fix.sh

echo "🔧 Applying worker fixes manually..."

cd /app # Or your actual app path

# Backup original file
cp scripts/simple-worker-fallback.js scripts/simple-worker-fallback.js.backup

# Apply fixes using sed (or vi/nano if preferred)
echo "📝 Fixing timeout to 5 seconds..."
sed -i 's/setTimeout(() => controller.abort(), 10000)/setTimeout(() => controller.abort(), 5000)/' scripts/simple-worker-fallback.js

echo "📝 Adding retryAt filter..."
# This is complex, so we'll provide the updated query manually

cat > /tmp/worker-fix.txt << 'EOF'
Find this section (around line 120):

    const result = await database.collection('webhook_queue').findOneAndUpdate(
      {
        status: 'pending',
        $or: [
          { attempts: { $lt: MAX_RETRIES } },
          { attempts: { $exists: false } }
        ]
      },

Replace with:

    const result = await database.collection('webhook_queue').findOneAndUpdate(
      {
        status: 'pending',
        $or: [
          { retryAt: { $exists: false } },
          { retryAt: { $lte: new Date() } }
        ],
        $and: [
          {
            $or: [
              { attempts: { $lt: MAX_RETRIES } },
              { attempts: { $exists: false } }
            ]
          }
        ]
      },
EOF

echo "✅ Backup created at: scripts/simple-worker-fallback.js.backup"
echo "📋 Manual edit required - see /tmp/worker-fix.txt"
echo ""
echo "OR just download the latest code from GitHub when it's back up!"
echo ""
echo "🔄 After fixing, restart the app:"
echo "   pm2 restart all  # or your restart command"
