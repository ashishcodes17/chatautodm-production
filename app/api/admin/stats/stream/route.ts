// app/api/admin/stats/route.ts
import { NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";

// Force dynamic since we are using SSE
export const dynamic = "force-dynamic";

// Function to compute stats
const fetchStats = async () => {
  const db = await getDatabase();
  const [totalUsers, totalWorkspaces, totalContacts, totalAutomations, activeAutomations] =
    await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("workspaces").countDocuments(),
      db.collection("contacts").countDocuments(),
      db.collection("automations").countDocuments(),
      db.collection("automations").countDocuments({ isActive: true }),
    ]);

  const instagramAccounts = await db
    .collection("instagram_accounts")
    .find({}, { projection: { dmUsed: 1 } })
    .toArray();
  const totalDMsSent = instagramAccounts.reduce(
    (sum: number, acc: any) => sum + (acc.dmUsed || 0),
    0
  );

  return {
    totalUsers,
    totalWorkspaces,
    totalDMsSent,
    totalContacts,
    totalAutomations,
    activeAutomations,
  };
};

// SSE handler
export async function GET(_request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial stats immediately
      try {
        const initialStats = await fetchStats();
        controller.enqueue(encoder.encode(`event: sync\ndata: ${JSON.stringify(initialStats)}\n\n`));
      } catch (err) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "stats_error" })}\n\n`));
      }

      // Create interval for this specific connection
      const connectionInterval = setInterval(async () => {
        try {
          const stats = await fetchStats();
          controller.enqueue(encoder.encode(`event: sync\ndata: ${JSON.stringify(stats)}\n\n`));
        } catch (err) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "stats_error" })}\n\n`));
        }
      }, 2000);

      // Cleanup on client disconnect
      const cleanup = () => {
        clearInterval(connectionInterval);
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
