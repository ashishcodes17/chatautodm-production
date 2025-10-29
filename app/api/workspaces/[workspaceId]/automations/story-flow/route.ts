export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    const body = await request.json();
    const { name, steps, selectedStory, isActive } = body;

    if (!name || !steps || steps.length === 0) {
      return NextResponse.json({ error: "Missing required fields: name and steps" }, { status: 400 });
    }

    const db = await getDatabase();
    const workspace = await db.collection("workspaces").findOne({ _id: workspaceId });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const triggerStep = steps.find((s: any) => s.type === "trigger");
    const dmStep = steps.find((s: any) => s.id === "action-1");
    const linkStep = steps.find((s: any) => s.id === "action-2");

    const automation = {
      workspaceId,
      instagramUserId: workspace.instagramUserId,
      name,
      type: "story_reply_flow",
      selectedStory: selectedStory || "any",
      trigger: {
        keywordMode: triggerStep?.config.keywordMode || "any_reply",
        triggerKeywords: triggerStep?.config.triggerKeywords || [],
        reaction: triggerStep?.config.reaction || { enabled: false }
      },
      actions: {
        reaction: triggerStep?.config.reaction || { enabled: false },
        openingDM: {
          enabled: dmStep?.config.enabled || false,
          message: dmStep?.config.message || "",
          buttons: dmStep?.config.buttons || []
        },
        followUp: {
          enabled: dmStep?.config.followUp?.enabled || false,
          message: dmStep?.config.followUp?.message || "",
          buttons: dmStep?.config.followUp?.buttons || []
        },
        linkResponse: {
          enabled: linkStep?.config.enabled || false,
          message: linkStep?.config.message || "",
          link: linkStep?.config.link || "",
          linkText: linkStep?.config.linkText || ""
        }
      },
      isActive: isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("automations").insertOne(automation);

    return NextResponse.json({
      success: true,
      automationId: result.insertedId,
      automation: { ...automation, _id: result.insertedId }
    });
  } catch (error) {
    console.error("❌ Error creating story automation:", error);
    return NextResponse.json({ error: "Failed to create story automation" }, { status: 500 });
  }
}
