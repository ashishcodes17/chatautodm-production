/**
 * Background job to refresh admin stats cache periodically
 * Runs every 60 seconds to keep stats fresh
 * 
 * Deploy this as a separate process or cron job for production
 */

import { refreshAdminStatsCache } from "./admin-stats-cache"

const REFRESH_INTERVAL = 60000 // 60 seconds

async function startAdminStatsCacheRefresher() {
  console.log("🔄 Starting admin stats cache refresher...")
  console.log(`📊 Refresh interval: ${REFRESH_INTERVAL / 1000}s`)

  // Initial refresh
  try {
    await refreshAdminStatsCache(true) // Skip rate limit on startup
    console.log("✅ Initial admin stats cached")
  } catch (error) {
    console.error("❌ Initial refresh failed:", error)
  }

  // Periodic refresh
  setInterval(async () => {
    try {
      console.log("🔄 Refreshing admin stats cache...")
      await refreshAdminStatsCache(true) // Force publish (scheduled job)
    } catch (error) {
      console.error("❌ Scheduled refresh failed:", error)
    }
  }, REFRESH_INTERVAL)

  console.log("✅ Admin stats cache refresher started")
}

// Auto-start if running as main module
if (require.main === module) {
  startAdminStatsCacheRefresher()
    .then(() => {
      console.log("🚀 Admin stats refresher is running")
    })
    .catch((error) => {
      console.error("💥 Failed to start refresher:", error)
      process.exit(1)
    })
}

export { startAdminStatsCacheRefresher }
