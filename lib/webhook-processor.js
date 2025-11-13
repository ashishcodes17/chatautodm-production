/**
 * Webhook Processor - Node.js Module
 * 
 * This module contains the webhook processing logic extracted from route.ts
 * Workers can call this directly (same process, no HTTP needed!)
 * 
 * CRITICAL: This gets compiled from TypeScript at build time
 * Next.js builds .ts files into .js in the .next folder
 */

/**
 * Process webhook by dynamically importing the compiled Next.js route
 * 
 * Next.js compiles TypeScript files at build time into .next/server/
 * We can import those compiled .js files directly!
 */
async function processWebhook(data) {
  try {
    console.log('🔧 [WORKER] Processing webhook via compiled route');
    
    // Try to import the compiled Next.js route handler
    // Next.js puts compiled API routes in .next/server/app/api/...
    const routePath = '../.next/server/app/api/webhooks/instagram/route.js';
    
    try {
      const routeModule = await import(routePath);
      
      if (!routeModule || !routeModule.POST) {
        throw new Error('Route module or POST handler not found');
      }
      
      // Create a mock NextRequest object
      const mockRequest = {
        method: 'POST',
        headers: new Map([
          ['X-Internal-Worker', 'true'],
          ['content-type', 'application/json']
        ]),
        json: async () => data,
        text: async () => JSON.stringify(data),
      };
      
      // Add the get method for headers
      mockRequest.headers.get = function(name) {
        return this.get(name);
      };
      
      console.log('✅ [WORKER] Calling POST handler directly');
      const response = await routeModule.POST(mockRequest);
      
      if (!response || (!response.ok && response.status !== 200)) {
        console.error('❌ [WORKER] POST handler returned error:', response?.status);
        return { success: false, error: `HTTP ${response?.status}` };
      }
      
      console.log('✅ [WORKER] Webhook processed successfully');
      return { success: true };
      
    } catch (importError) {
      console.error('❌ [WORKER] Failed to import compiled route:', importError.message);
      console.error('   This usually means Next.js hasn\'t compiled the route yet');
      console.error('   or workers started before Next.js build completed');
      throw importError;
    }
    
  } catch (error) {
    console.error('❌ [WORKER] Processing failed:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  processWebhook
};
