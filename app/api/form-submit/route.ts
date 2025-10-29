import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { appendRowToSheet, SheetsTokens } from "@/utils/appendSheet";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    // Get user from cookie
    const cookie = req.cookies.get("user_session")?.value;
    if (!cookie) throw new Error("User not logged in");
    const user = JSON.parse(cookie);

    if (!user.sheetsRefreshToken) {
      return NextResponse.json({ success: false, message: "Sheets not connected" }, { status: 400 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const tokens: SheetsTokens = {
      accessToken: user.sheetsAccessToken,
      refreshToken: user.sheetsRefreshToken,
      tokenExpiry: user.sheetsTokenExpiry,
    };

    const updateTokens = async (newTokens: Partial<SheetsTokens>) => {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: newTokens }
      );
    };

    // Each user gets a separate sheet? For demo, we assume existing sheetId
    const sheetId = user.sheetsSheetId; 
    if (!sheetId) throw new Error("No sheet assigned to user");

    await appendRowToSheet(sheetId, [name, email], tokens, updateTokens);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Form submit error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
