// app/api/admin/stats/stream/route.ts
import { NextRequest } from "next/server";
import { getAdminStats, refreshAdminStatsCache } from "@/lib/admin-stats-cache";
import { getClient } from "@/lib/redis-factory";

// Force dynamic since we are using SSE
export const dynamic = "force-dynamic";

// SSE handler
export async function GET(_request: NextRequest) {
  const encoder = new TextEncoder();
  const redis = getClient("pubsub");
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial stats immediately from cache
      try {
        const initialStats = await getAdminStats();
        controller.enqueue(encoder.encode(`event: sync\ndata: ${JSON.stringify(initialStats)}\n\n`));
      } catch (err) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "stats_error" })}\n\n`));
      }

      let pollInterval: NodeJS.Timeout | null = null;
      
      let lastUpdateTime = Date.now();
      
      // Real-time updates via Redis Pub/Sub (if available)
      if (redis) {
        console.log("📡 SSE using Redis Pub/Sub for real-time updates");
        
        // Subscribe to stats update events
        redis.subscribe("admin:stats:updated", (err) => {
          if (err) {
            console.error("❌ Redis subscribe error:", err);
          }
        });

        // Listen for published updates with debouncing
        redis.on("message", async (channel, message) => {
          if (channel === "admin:stats:updated") {
            // Debounce: Only send if 5s passed since last update (prevents spam to client)
            const now = Date.now();
            if (now - lastUpdateTime < 5000) {
              console.log("⏱️ SSE update debounced (too frequent)");
              return;
            }
            lastUpdateTime = now;
            
            try {
              const stats = await getAdminStats();
              controller.enqueue(encoder.encode(`event: sync\ndata: ${JSON.stringify(stats)}\n\n`));
            } catch (err) {
              console.error("❌ Error sending stats update:", err);
            }
          }
        });

        // Fallback: Poll every 30s in case Pub/Sub misses something
        pollInterval = setInterval(async () => {
          try {
            const stats = await getAdminStats();
            controller.enqueue(encoder.encode(`event: sync\ndata: ${JSON.stringify(stats)}\n\n`));
            lastUpdateTime = Date.now();
          } catch (err) {
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "stats_error" })}\n\n`));
          }
        }, 30000);
      } else {
        // Fallback: Poll cache every 15 seconds if Redis unavailable
        console.log("📊 SSE using polling (Redis unavailable)");
        pollInterval = setInterval(async () => {
          try {
            const stats = await getAdminStats();
            controller.enqueue(encoder.encode(`event: sync\ndata: ${JSON.stringify(stats)}\n\n`));
          } catch (err) {
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "stats_error" })}\n\n`));
          }
        }, 15000);
      }

      // Cleanup on client disconnect
      const cleanup = () => {
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        if (redis) {
          redis.unsubscribe("admin:stats:updated");
          redis.removeAllListeners("message");
        }
      };

      // Handle abort signal
      _request.signal.addEventListener("abort", cleanup);

      return () => {
        cleanup();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
