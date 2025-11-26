// queue-speed.js
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://ashish:1196843649%401@62.72.42.195:27017/instaautodm?authSource=instaautodm&retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db();
  const collection = db.collection("webhook_queue");

  console.log("📡 Monitoring queue speed with incoming rate tracking...\n");

  let lastCompleted = 0;
  let lastPending = 0;
  let lastTotal = 0;

  // Initial counts
  const initial = await collection.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  lastCompleted = initial.find(s => s._id === "completed")?.count || 0;
  lastPending = initial.find(s => s._id === "pending")?.count || 0;
  
  // Calculate initial total
  lastTotal = initial.reduce((sum, s) => sum + s.count, 0);

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
    const total = pending + processing + completed + failed;

    // Calculate rates
    const completedDiff = completed - lastCompleted;
    const completedPerSecond = completedDiff / 5;
    const completedPerMinute = completedPerSecond * 60;

    const incomingDiff = total - lastTotal;
    const incomingPerSecond = incomingDiff / 5;
    const incomingPerMinute = incomingPerSecond * 60;

    const pendingChange = pending - lastPending;
    const netRate = completedDiff - incomingDiff;

    // Status indicator
    let statusEmoji = "⚖️";
    if (netRate > 20) statusEmoji = "✅"; // Clearing queue
    else if (netRate < -20) statusEmoji = "⚠️"; // Queue growing

    console.log(`
===============================
⚡ Queue Speed Monitor (5s)
===============================
📊 Queue Status:
   Pending:     ${pending.toLocaleString()} ${pendingChange >= 0 ? '📈+' : '📉'}${pendingChange}
   Processing:  ${processing}
   Completed:   ${completed.toLocaleString()}
   Failed:      ${failed}

⚡ Throughput (last 5s):
   ✅ Completed: ${completedDiff} (${completedPerMinute.toFixed(0)}/min)
   📥 Incoming:  ${incomingDiff} (${incomingPerMinute.toFixed(0)}/min)
   ${statusEmoji} Net Rate:  ${netRate >= 0 ? '+' : ''}${netRate} ${netRate > 0 ? '(Queue shrinking ✅)' : netRate < 0 ? '(Queue growing ⚠️)' : '(Balanced ⚖️)'}

📈 Progress:
   Queue size change: ${pendingChange >= 0 ? '+' : ''}${pendingChange}
   Total webhooks: ${total.toLocaleString()}
===============================
`);

    lastCompleted = completed;
    lastPending = pending;
    lastTotal = total;
  }, 5000);
}

main().catch(console.error);
