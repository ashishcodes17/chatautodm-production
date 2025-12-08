import { type NextRequest, NextResponse } from "next/server"
import { getThumbnailFromRedis } from "@/lib/thumbnail-cache"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { type, id } = params

    // Validate type
    if (type !== "post" && type !== "story") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const redisKey = `thumbnail:${type}:${id}`
    const imageBuffer = await getThumbnailFromRedis(redisKey)

    if (!imageBuffer) {
      return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 })
    }

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    })

  } catch (error) {
    console.error("❌ Error serving thumbnail:", error)
    return NextResponse.json({ error: "Failed to serve thumbnail" }, { status: 500 })
  }
}
