import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

let isRunning = false;

export async function GET() {
  if (isRunning) {
    console.log("⛔ Already running refresh job.");
    return NextResponse.json({ running: true });
  }

  isRunning = true;
  console.log("🔥 STARTING TOKEN REFRESH JOB");

  try {
    const db = await getDatabase();

    const soonExpiring = new Date(Date.now() + 10 * 86400 * 1000);

    console.log("📥 Fetching lightweight accounts...");

    const accounts = await db
      .collection("instagram_accounts")
      .find({
        isConnected: true,
        tokenExpiresAt: { $lt: soonExpiring },
      })
      .project({
        username: 1,
        accessToken: 1,
        tokenExpiresAt: 1,
      })
      .toArray();

    console.log(`📦 Found ${accounts.length} accounts to refresh`);

    const refreshed = [];

    for (const acc of accounts) {
      console.log("🔄 Refreshing:", acc.username);

      const refreshUrl =
        `https://graph.instagram.com/refresh_access_token` +
        `?grant_type=ig_refresh_token&access_token=${acc.accessToken}`;

      const res = await fetch(refreshUrl);
      const data = await res.json();

      if (data.error) {
        console.log("❌ Refresh failed:", acc.username, data.error);
        continue;
      }

      await db.collection("instagram_accounts").updateOne(
        { _id: acc._id },
        {
          $set: {
            accessToken: data.access_token,
            tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
            updatedAt: new Date(),
          },
        }
      );

      refreshed.push(acc.username);

      console.log("🟢 Refreshed:", acc.username);
    }

    return NextResponse.json({
      success: true,
      refreshed,
      count: refreshed.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    isRunning = false;
  }
}
