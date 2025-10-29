import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params
    const body = await request.json()
    const { name, steps, selectedPost, isActive } = body

    if (!name || !steps || steps.length === 0) {
      return NextResponse.json({ error: "Missing required fields: name and steps" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get workspace to verify access and get Instagram account
    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    /* ---------- Extract config from the builder steps ---------- */
    const triggerStep = steps.find((s: any) => s.type === "trigger")
    const commentReplyStep = steps.find((s: any) => s.id === "action-1")
    const openingDMStep = steps.find((s: any) => s.id === "action-2")
    const linkStep = steps.find((s: any) => s.id === "action-3")

    /* ---------- Check plan restrictions ---------- */
    const userPlan = workspace.plan ?? "free"
    if (selectedPost === "any" && userPlan === "free") {
      return NextResponse.json(
        {
          error: "The 'Any Post' trigger is only available for paid plans. Please upgrade to Pro or Elite.",
        },
        { status: 403 },
      )
    }

    /* ---------- Persist automation ---------- */
    const automation = {
      instagramUserId: workspace.instagramUserId,
      workspaceId: workspaceId,
      name,
      type: "comment_to_dm_flow",
      selectedPost: selectedPost === "any" ? null : selectedPost,
      trigger: {
        type: selectedPost === "any" ? "any_post" : "specific_post",
        keywordMode: triggerStep?.config.keywordMode || "any_comment",
        keywords: triggerStep?.config.triggerKeywords || [],
      },
      actions: {
        commentReply: {
          enabled: commentReplyStep?.config.enabled || false,
          message: commentReplyStep?.config.message || "",
        },
        openingDM: {
          enabled: openingDMStep?.config.enabled || false,
          message: openingDMStep?.config.message || "",
          buttons: openingDMStep?.config.buttons || [],
        },
        linkResponse: {
          enabled: linkStep?.config.enabled || false,
          message: linkStep?.config.message || "",
          link: linkStep?.config.link || "",
          linkText: linkStep?.config.linkText || "",
        },
      },
      isActive: isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("automations").insertOne(automation)

    return NextResponse.json({
      success: true,
      automationId: result.insertedId,
      automation: { ...automation, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error creating flow automation:", error)
    return NextResponse.json({ error: "Failed to create automation" }, { status: 500 })
  }
}
