/**
 * Webhook Processing Core Logic
 * 
 * This file contains the main webhook processing logic that can be called
 * directly by workers WITHOUT making HTTP requests.
 * 
 * This is imported by both:
 * - app/api/webhooks/instagram/route.ts (for direct processing)
 * - scripts/simple-worker-fallback.js (for queue processing)
 */

import { getDatabase } from "@/lib/mongodb"

// This will be populated by importing the route file
let processWebhookLogic: ((data: any, db: any) => Promise<void>) | null = null;

/**
 * Process webhook data directly (no HTTP call)
 * This is the core processing logic extracted from route.ts
 */
export async function processWebhookDirect(data: any): Promise<void> {
  console.log("🔧 [WORKER] Processing webhook directly (no HTTP call)");
  
  const db = await getDatabase();
  
  // Import the processing logic dynamically to avoid circular dependencies
  if (!processWebhookLogic) {
    console.log("🔧 [WORKER] Loading processing logic...");
    const routeModule = await import("./instagram/route");
    
    // We'll add a new export to route.ts called processWebhookCore
    if (routeModule.processWebhookCore) {
      processWebhookLogic = routeModule.processWebhookCore;
    } else {
      throw new Error("processWebhookCore not exported from route.ts");
    }
  }
  
  // Call the core processing logic
  await processWebhookLogic(data, db);
  
  console.log("✅ [WORKER] Webhook processed successfully");
}
