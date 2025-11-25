// queue-speed.js
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db();
  const collection = db.collection("webhook_queue");

  console.log("📡 Monitoring queue speed...\n");

  let lastCompleted = 0;

  // Initial count
  const first = await collection.aggregate([
    { $match: { status: "completed" } },
    { $count: "count" }
  ]).toArray();

  lastCompleted = first[0]?.count || 0;

  setInterval(async () => {
    // Get all status counts in one query
    const stats = await collection.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const pending = stats.find(s => s._id === "pending")?.count || 0;
    const processing = stats.find(s => s._id === "processing")?.count || 0;
    const completed = stats.find(s => s._id === "completed")?.count || 0;
    const failed = stats.find(s => s._id === "failed")?.count || 0;

    const diff = completed - lastCompleted;
    const perSecond = diff / 5;   // 5 sec interval
    const perMinute = perSecond * 60;

    console.log(`
===============================
⚡ Queue Speed Monitor (5s)
===============================
📊 Queue Status:
   Pending:     ${pending}
   Processing:  ${processing}
   Completed:   ${completed.toLocaleString()}
   Failed:      ${failed}

⚡ Throughput:
   Processed in last 5s: ${diff}
   ➡ Per Second: ${perSecond.toFixed(2)}
   ➡ Per Minute: ${perMinute.toFixed(0)}
===============================
`);

    lastCompleted = completed;
  }, 5000);
}

main().catch(console.error);
