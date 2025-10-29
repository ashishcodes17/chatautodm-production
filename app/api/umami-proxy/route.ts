// app/api/umami-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

const UMAMI_BASE = "http://62.72.42.195:3002"

export async function GET() {
  try {
    const response = await fetch(`${UMAMI_BASE}/script.js`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Umami script" },
        { status: response.status }
      );
    }
    
    let script = await response.text();
    
    console.log("🔍 Original script length:", script.length);
    
    // Replace ALL instances of the Umami server URL
    // This is the key fix - replace the entire base URL
    script = script.replace(
      /http:\/\/62\.72\.42\.195:3002/g,
      ''  // Replace with empty string to make paths relative
    );
    
    // Alternative: Replace with your domain if needed
    // script = script.replace(
    //   /http:\/\/62\.72\.42\.195:3002/g,
    //   'https://www.chatautodm.com'
    // );
    
    console.log("🔍 Script after replacement:", script.length);
    
    // Test if replacement worked
    if (script.includes('62.72.42.195')) {
      console.log("❌ Replacement failed - IP still in script");
    } else {
      console.log("✅ Replacement successful - IP removed from script");
    }

    return new NextResponse(script, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (error) {
    console.error('Umami proxy error:', error);
    return NextResponse.json(
      { error: "Failed to load Umami script" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    const response = await fetch(`${UMAMI_BASE}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") || "",
      },
      body: body,
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error('Umami POST error:', error);
    return NextResponse.json(
      { error: "Failed to send analytics data" },
      { status: 500 }
    );
  }
}
