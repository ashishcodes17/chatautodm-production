import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.chatautodm.com";

  if (error) return NextResponse.redirect(`${baseUrl}/?error=access_denied`);
  if (!code) return NextResponse.redirect(`${baseUrl}/?error=no_code`);

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        code,
        grant_type: "authorization_code",
        redirect_uri: `${baseUrl}/api/google/sheets-callback`,
      }),
    });
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token || !tokenData.refresh_token) {
      throw new Error("No tokens received from Google");
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");
    const workspacesCollection = db.collection("workspaces");

    const cookie = request.cookies.get("user_session")?.value;
    if (!cookie) throw new Error("No user session cookie found");
    const user = JSON.parse(cookie);

    // Save tokens in user
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          sheetsAccessToken: tokenData.access_token,
          sheetsRefreshToken: tokenData.refresh_token,
          sheetsTokenExpiry: Date.now() + tokenData.expires_in * 1000,
        },
      }
    );

    // Get the first workspace for the user
    const workspace = await workspacesCollection.findOne({ userId: user._id });
    if (!workspace) throw new Error("No workspace found for this user");

    const wsid = workspace._id;
    return NextResponse.redirect(`${baseUrl}/${wsid}/form`);
  } catch (err) {
    console.error("Sheets OAuth error:", err);
    return NextResponse.redirect(`${baseUrl}/?error=oauth_failed`);
  }
}
