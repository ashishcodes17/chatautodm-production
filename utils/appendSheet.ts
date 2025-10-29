import { google } from "googleapis";

export interface SheetsTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
}

export async function appendRowToSheet(
  sheetId: string,
  values: string[],
  tokens: SheetsTokens,
  updateTokens: (newTokens: Partial<SheetsTokens>) => Promise<void>
) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  // Check token expiry
  if (!tokens.accessToken || Date.now() >= tokens.tokenExpiry) {
    auth.setCredentials({ refresh_token: tokens.refreshToken });
    const { credentials } = await auth.refreshAccessToken();
    tokens.accessToken = credentials.access_token!;
    tokens.tokenExpiry = credentials.expiry_date!;
    // Save refreshed tokens
    await updateTokens({
      accessToken: tokens.accessToken,
      tokenExpiry: tokens.tokenExpiry,
    });
  } else {
    auth.setCredentials({ access_token: tokens.accessToken });
  }

  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    resource: { values: [values] },
  });
}
