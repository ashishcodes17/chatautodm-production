/**
 * Test Webhook Queue System
 * 
 * This script helps you test the queue system is working correctly
 * Run this AFTER deploying and enabling the queue
 * 
 * Usage:
 *   node scripts/test-queue.js
 */

const https = require('https');
const http = require('http');

const SERVER_URL = process.env.SERVER_URL || 'https://www.chatautodm.com';

async function getQueueStats() {
  return new Promise((resolve, reject) => {
    const url = `${SERVER_URL}/api/webhooks/queue-stats`;
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testQueue() {
  console.log('\n🧪 Testing Webhook Queue System...\n');
  
  try {
    const stats = await getQueueStats();
    
    console.log('📊 Queue Statistics:');
    console.log('===================');
    console.log(`Pending:    ${stats.queue.pending}`);
    console.log(`Processing: ${stats.queue.processing}`);
    console.log(`Completed:  ${stats.queue.completed}`);
    console.log(`Failed:     ${stats.queue.failed}`);
    console.log(`Total:      ${stats.queue.total}`);
    console.log('');
    console.log('⚡ Performance:');
    console.log('===================');
    console.log(`Processing Rate: ${stats.performance.processingRate}`);
    console.log(`Avg Time:        ${stats.performance.avgProcessingTime}`);
    console.log(`Success Rate:    ${stats.performance.successRate}`);
    console.log(`Queue Delay:     ${stats.performance.queueDelay}`);
    console.log('');
    console.log('🏥 Health:');
    console.log('===================');
    console.log(`Status:  ${stats.health.status}`);
    console.log(`Message: ${stats.health.message}`);
    console.log('');
    
    // Interpret results
    console.log('✅ RESULTS:');
    console.log('===========');
    
    if (stats.queue.total === 0) {
      console.log('⚠️  No webhooks processed yet. Trigger some webhooks to test.');
    } else if (stats.health.status === 'healthy') {
      console.log('✅ Queue system is HEALTHY and working correctly!');
    } else if (stats.health.status === 'warning') {
      console.log('⚠️  Queue is building up. Consider increasing workers.');
    } else {
      console.log('🚨 Queue backlog is critical! Increase workers immediately.');
    }
    
    if (stats.queue.failed > 0) {
      console.log(`\n❌ ${stats.queue.failed} failed jobs detected.`);
      console.log('Check dead letter queue for details:');
      console.log('mongo > use instaautodm > db.webhook_dead_letter.find().limit(10)');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Failed to fetch queue stats:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Server not running');
    console.error('2. Queue system not enabled (USE_QUEUE_SYSTEM=false)');
    console.error('3. Endpoint not deployed yet');
    console.error('\nCheck: ' + SERVER_URL + '/api/webhooks/queue-stats');
  }
}

// Run test
testQueue();
