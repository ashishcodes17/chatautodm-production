/**
 * Worker Connectivity Test
 * 
 * Tests if workers can connect to the webhook processor
 * Run this to diagnose worker connection issues
 * 
 * Usage: node scripts/test-worker-connection.js
 */

require('dotenv').config();

async function testConnection() {
  console.log('\n🔍 ========== WORKER CONNECTION TEST ==========\n');
  
  // Determine the URL workers would use
  const baseUrl = process.env.WEBHOOK_INTERNAL_URL || 
                  process.env.NEXT_PUBLIC_BASE_URL || 
                  'http://localhost:3000';
  
  const url = `${baseUrl}/api/webhooks/instagram`;
  
  console.log(`📍 Testing URL: ${url}\n`);
  
  // Test 1: Basic connectivity
  console.log('Test 1: Basic connectivity...');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Worker': 'true'
      },
      body: JSON.stringify({
        object: 'instagram',
        entry: []
      })
    });
    
    console.log(`✅ Connection successful! Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 100)}\n`);
    
  } catch (error) {
    console.error(`❌ Connection failed!`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'unknown'}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 SOLUTION: The server is not accessible at this URL.\n');
      console.log('   Try these environment variables in Coolify:\n');
      console.log('   WEBHOOK_INTERNAL_URL=http://127.0.0.1:3000');
      console.log('   WEBHOOK_INTERNAL_URL=http://0.0.0.0:3000');
      console.log('   WEBHOOK_INTERNAL_URL=https://www.chatautodm.com\n');
    }
  }
  
  // Test 2: Environment variables check
  console.log('\nTest 2: Environment variables...');
  console.log(`   WEBHOOK_INTERNAL_URL: ${process.env.WEBHOOK_INTERNAL_URL || '❌ NOT SET'}`);
  console.log(`   NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL || '❌ NOT SET'}`);
  console.log(`   USE_QUEUE_SYSTEM: ${process.env.USE_QUEUE_SYSTEM || '❌ NOT SET'}`);
  console.log(`   QUEUE_WORKERS: ${process.env.QUEUE_WORKERS || '❌ NOT SET'}\n`);
  
  // Test 3: Alternative URLs
  const alternatives = [
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000',
    'https://www.chatautodm.com'
  ];
  
  console.log('Test 3: Testing alternative URLs...\n');
  
  for (const altUrl of alternatives) {
    process.stdout.write(`   Testing ${altUrl}... `);
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${altUrl}/api/webhooks/queue-stats`, {
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        console.log('✅ WORKS!');
      } else {
        console.log(`⚠️  Status ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('❌ Timeout');
      } else {
        console.log(`❌ ${error.code || error.message}`);
      }
    }
  }
  
  console.log('\n========================================\n');
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:\n');
  console.log('1. Add the working URL to your Coolify environment:');
  console.log('   WEBHOOK_INTERNAL_URL=<working_url>\n');
  console.log('2. Restart the deployment in Coolify\n');
  console.log('3. Run: node scripts/reset-stuck-jobs.js\n');
  console.log('4. Check queue stats: curl https://www.chatautodm.com/api/webhooks/queue-stats\n');
}

testConnection().catch(console.error);
