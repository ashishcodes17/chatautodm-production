import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

// Serve images from MongoDB
export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const { imageId } = params
    
    // Log user agent for debugging Facebook scraper issues
    const userAgent = request.headers.get("user-agent") || "unknown"
    console.log("🖼️ Image request:", { imageId, userAgent })

    // Validate ObjectId
    if (!ObjectId.isValid(imageId)) {
      return NextResponse.json(
        { error: "Invalid image ID" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const image = await db.collection("automation_images").findOne({
      _id: new ObjectId(imageId),
    })

    if (!image) {
      console.log("❌ Image not found:", imageId)
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      )
    }
    
    console.log("✅ Image found, serving:", { imageId, contentType: image.contentType, size: Buffer.from(image.data, "base64").length })

    // Convert base64 back to buffer
    const buffer = Buffer.from(image.data, "base64")

    // Return image with proper headers for Facebook/Instagram scraper
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "X-Robots-Tag": "all",
      },
    })
  } catch (error: any) {
    console.error("❌ Error serving image:", error)
    return NextResponse.json(
      { error: "Failed to load image" },
      { status: 500 }
    )
  }
}
