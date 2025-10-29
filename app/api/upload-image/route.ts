import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

// Image upload endpoint for automation images
// Stores images in MongoDB and returns API URL
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Store in MongoDB
    const db = await getDatabase()
    const imageDoc = {
      filename: file.name,
      contentType: file.type,
      size: file.size,
      data: buffer.toString("base64"), // Store as base64
      uploadedAt: new Date(),
    }

    const result = await db.collection("automation_images").insertOne(imageDoc as any)
    const imageId = result.insertedId.toString()

    // Generate URL - use domain from environment or request host
    const host = request.headers.get("host") || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"
    const imageUrl = `${protocol}://${host}/api/images/${imageId}`

    console.log("📸 Image uploaded to MongoDB:", imageUrl)

    return NextResponse.json({
      success: true,
      imageUrl,
      imageId,
    })
  } catch (error: any) {
    console.error("❌ Error uploading image:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 500 }
    )
  }
}
