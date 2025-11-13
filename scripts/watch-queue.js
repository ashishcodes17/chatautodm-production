#!/usr/bin/env node

/**
 * Watch Queue Progress in Real-Time
 * 
 * Monitors the queue stats endpoint and shows progress
 * Run: node scripts/watch-queue.js
 */

const STATS_URL = 'https://www.chatautodm.com/api/webhooks/queue-stats';
const INTERVAL = 5000; // Check every 5 seconds

let lastCompleted = 0;
let startTime = Date.now();

async function fetchStats() {
  try {
    const response = await fetch(STATS_URL);
    const data = await response.json();
    
    const { queue, performance } = data;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const newCompleted = queue.completed - lastCompleted;
    
    console.clear();
    console.log('📊 QUEUE MONITOR');
    console.log('════════════════════════════════════════');
    console.log(`🕐 Running for: ${elapsed}s`);
    console.log('');
    console.log('📦 Queue Status:');
    console.log(`   Pending:     ${queue.pending.toLocaleString()}`);
    console.log(`   Processing:  ${queue.processing.toLocaleString()}`);
    console.log(`   Completed:   ${queue.completed.toLocaleString()} (+${newCompleted} in last 5s)`);
    console.log(`   Failed:      ${queue.failed.toLocaleString()}`);
    console.log('');
    console.log('⚡ Performance:');
    console.log(`   Rate:        ${performance.processingRate}`);
    console.log(`   Avg Time:    ${performance.avgProcessingTime}`);
    console.log(`   Success:     ${performance.successRate}`);
    console.log('');
    console.log(`🏁 Total Remaining: ${(queue.pending + queue.processing).toLocaleString()}`);
    
    if (queue.pending + queue.processing === 0) {
      console.log('');
      console.log('🎉 ALL WEBHOOKS PROCESSED!');
      process.exit(0);
    }
    
    lastCompleted = queue.completed;
    
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error.message);
  }
}

console.log('🚀 Starting queue monitor...\n');
console.log(`📡 Watching: ${STATS_URL}`);
console.log(`⏱️  Update interval: ${INTERVAL/1000}s\n`);

// Fetch immediately, then poll
fetchStats();
setInterval(fetchStats, INTERVAL);
