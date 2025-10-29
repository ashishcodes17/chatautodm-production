import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete("user_session")

  return NextResponse.json({ success: true })
}
