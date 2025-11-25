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
    const stats = await collection.aggregate([
      { $match: { status: "completed" } },
      { $count: "count" }
    ]).toArray();

    const currentCompleted = stats[0]?.count || 0;
    const diff = currentCompleted - lastCompleted;

    const perSecond = diff / 5;   // 5 sec interval
    const perMinute = perSecond * 60;

    console.log(`
===============================
⚡ Queue Speed Monitor (5s)
===============================
Completed (total): ${currentCompleted}
Processed in last 5 seconds: ${diff}
➡ Per Second: ${perSecond.toFixed(2)}
➡ Per Minute: ${perMinute.toFixed(0)}
===============================
`);

    lastCompleted = currentCompleted;
  }, 5000);
}

main().catch(console.error);
