// scripts/retrigger-comments.ts
import { getDatabase } from "@/lib/mongodb";

function wait(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function main() {
  console.log("🚀 Retrigger script started");

  const { processWebhookData } = await import("../app/api/webhooks/instagram/route");

  const POST_ID = "18094249771861688";
  const BATCH_SIZE = 20; // safe + fast

  const db = await getDatabase();

  // Count initial
  let remaining = await db.collection("comments").countDocuments({
    mediaId: POST_ID,
    processed: false
  });

  console.log(`📌 Unprocessed comments: ${remaining}`);

  // Fetch all unprocessed
  const comments = await db
    .collection("comments")
    .find({ mediaId: POST_ID, processed: false })
    .sort({ _id: 1 })
    .toArray();

  console.log(`⚡ Starting work on ${comments.length} comments...\n`);

  let idx = 0;

  while (idx < comments.length) {
    const batch = comments.slice(idx, idx + BATCH_SIZE);

    console.log(`\n🚀 Batch ${idx + 1} → ${idx + batch.length} (size=${batch.length})`);

    for (const c of batch) {
      console.log(`🔁 Processing commentId=${c.commentId}`);

      const fakeWebhook = {
        object: "instagram",
        entry: [
          {
            id: c.instagramUserId,
            changes: [
              {
                field: "comments",
                value: {
                  id: c.commentId,
                  text: c.text,
                  from: {
                    id: c.commenterId,
                    username: c.commenterUsername
                  },
                  media: { id: c.mediaId }
                }
              }
            ]
          }
        ]
      };

      try {
        await processWebhookData(fakeWebhook);
        console.log(`✔️ DONE → ${c.commentId}`);
      } catch (err) {
        if (err && typeof err === "object" && "message" in err) {
          console.error(`❌ Error for ${c.commentId}:`, (err as { message: string }).message);
        } else {
          console.error(`❌ Error for ${c.commentId}:`, err);
        }
      }

      // Small delay to avoid Meta rate limits
      await wait(200);
    }

    idx += BATCH_SIZE;
  }

  console.log("\n🎉 Retrigger completed for ALL comments!");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
