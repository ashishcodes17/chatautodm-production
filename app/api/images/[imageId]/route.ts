import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Serve images from MongoDB
export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const { imageId } = params

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
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      )
    }

    // Convert base64 back to buffer
    const buffer = Buffer.from(image.data, "base64")

    // Return image with proper headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
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
