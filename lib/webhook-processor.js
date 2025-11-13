/**
 * Webhook Processor - HTTP Call to Localhost
 * 
 * Workers call the Next.js API route via HTTP on localhost
 * This works because workers run IN SAME PROCESS so localhost is available
 */

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/instagram';
const TIMEOUT = 30000; // 30 seconds for processing

/**
 * Process webhook by calling Next.js route via HTTP
 */
async function processWebhook(data) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Worker': 'true'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok && response.status !== 200) {
      console.error('❌ [WORKER] Route returned error:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    return { success: true };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ [WORKER] Processing timeout after 30s');
      return { success: false, error: 'Timeout' };
    }
    
    console.error('❌ [WORKER] Processing failed:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  processWebhook
};
