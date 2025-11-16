/**
 * Test if workers can reach localhost:3000
 */

require('dotenv').config();

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/instagram';

const testData = {
  object: "instagram",
  entry: [{
    id: "TEST_ACCOUNT_ID",
    time: Date.now(),
    messaging: [{
      sender: { id: "TEST_USER" },
      recipient: { id: "TEST_ACCOUNT_ID" },
      timestamp: Date.now(),
      message: { text: "TEST MESSAGE" }
    }]
  }]
};

async function testCall() {
  console.log('🧪 Testing worker -> localhost call...\n');
  console.log(`📡 URL: ${WEBHOOK_URL}`);
  console.log(`📦 Data: ${JSON.stringify(testData).substring(0, 100)}...\n`);
  
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout after 5 seconds!');
      controller.abort();
    }, 5000);
    
    console.log('📤 Sending request...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Worker': 'true'
      },
      body: JSON.stringify(testData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const elapsed = Date.now() - startTime;
    
    console.log(`\n✅ Response received in ${elapsed}ms`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   OK: ${response.ok}`);
    
    const text = await response.text();
    console.log(`   Body: ${text.substring(0, 100)}`);
    
    if (response.ok || response.status === 200) {
      console.log('\n🎉 SUCCESS! Workers can call localhost:3000');
    } else {
      console.log('\n❌ FAILED! Non-200 response');
    }
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    
    console.log(`\n❌ FAILED after ${elapsed}ms`);
    console.log(`   Error: ${error.name}`);
    console.log(`   Message: ${error.message}`);
    
    if (error.name === 'AbortError') {
      console.log('\n⚠️  TIMEOUT! Server not responding within 5 seconds');
      console.log('   This means workers are waiting forever for response');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  CONNECTION REFUSED! Server not listening on localhost:3000');
    } else {
      console.log(`\n⚠️  Unknown error: ${error.code || error.name}`);
    }
  }
}

testCall();
