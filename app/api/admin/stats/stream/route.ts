// app/api/admin/stats/route.ts
import { NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";

// Force dynamic since we are using SSE
export const dynamic = "force-dynamic";

// --- Shared broadcaster ---
let clients: WritableStreamDefaultWriter<any>[] = [];
let interval: NodeJS.Timer | null = null;

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

// Function to broadcast to all clients
const broadcastStats = async () => {
  if (clients.length === 0) return;

  try {
    const stats = await fetchStats();
    const encoder = new TextEncoder();
    const payload = `event: sync\ndata: ${JSON.stringify(stats)}\n\n`;

    clients.forEach((client) => {
      client.write(encoder.encode(payload));
    });
  } catch (err) {
    const encoder = new TextEncoder();
    const errorPayload = `event: error\ndata: ${JSON.stringify({ message: "stats_error" })}\n\n`;
    clients.forEach((client) => client.write(encoder.encode(errorPayload)));
  }
};

// Start global interval if not running
const startInterval = () => {
  if (!interval) {
    interval = setInterval(broadcastStats, 2000);
  }
};

// Stop interval if no clients
const stopInterval = () => {
  if (clients.length === 0 && interval) {
    clearInterval(interval);
    interval = null;
  }
};

// SSE handler
export async function GET(_request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const writer = controller.writable.getWriter();

      // Add this client
      clients.push(writer);

      // Send initial stats immediately
      fetchStats()
        .then((stats) => {
          writer.write(encoder.encode(`event: sync\ndata: ${JSON.stringify(stats)}\n\n`));
        })
        .catch(() => {
          writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "stats_error" })}\n\n`));
        });

      startInterval();

      controller.signal.addEventListener("abort", () => {
        // Remove client
        clients = clients.filter((c) => c !== writer);
        stopInterval();
      });
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
