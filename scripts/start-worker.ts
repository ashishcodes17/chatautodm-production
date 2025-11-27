// 🚨 MUST BE FIRST — loads .env, .env.local, etc
import "dotenv/config";

import { createWorker, initQueue } from "@/lib/webhook-queue";

//
// ✅ Fallback defaults if ENV is missing
//
process.env.BULLMQ_ENABLED = process.env.BULLMQ_ENABLED ?? "true";
process.env.REDIS_ENABLED = process.env.REDIS_ENABLED ?? "true";
process.env.USE_QUEUE = process.env.USE_QUEUE ?? "true";
process.env.USE_QUEUE_SYSTEM = process.env.USE_QUEUE_SYSTEM ?? "true";

process.env.QUEUE_ENABLE_DEDUPLICATION = process.env.QUEUE_ENABLE_DEDUPLICATION ?? "true";
process.env.QUEUE_ENABLE_METRICS = process.env.QUEUE_ENABLE_METRICS ?? "true";
process.env.QUEUE_ENABLE_RATE_LIMIT = process.env.QUEUE_ENABLE_RATE_LIMIT ?? "true";

process.env.QUEUE_MAX_RETRIES = process.env.QUEUE_MAX_RETRIES ?? "3";
process.env.QUEUE_MAX_WEBHOOKS_PER_MINUTE = process.env.QUEUE_MAX_WEBHOOKS_PER_MINUTE ?? "10000";
process.env.QUEUE_POLL_INTERVAL = process.env.QUEUE_POLL_INTERVAL ?? "100";
process.env.QUEUE_WORKERS = process.env.QUEUE_WORKERS ?? "12";

process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://default:1196843649@62.72.42.195:6379";

async function startWorker() {
  console.log("🚀 Worker starting...");
  console.log("-------------------------------------");
  console.log("ENV CHECK");
  console.log("BULLMQ_ENABLED:", process.env.BULLMQ_ENABLED);
  console.log("REDIS_URL:", process.env.REDIS_URL);
  console.log("QUEUE_WORKERS:", process.env.QUEUE_WORKERS);
  console.log("-------------------------------------");

  await initQueue();

  const { processWebhookData } = await import("../app/api/webhooks/instagram/route");

  console.log("⚙️ Starting BullMQ Worker...");
  createWorker(processWebhookData, Number(process.env.QUEUE_WORKERS));

  console.log("✅ Worker is running!");
}

startWorker().catch((err) => {
  console.error("❌ Worker crashed:", err);
  process.exit(1);
});
