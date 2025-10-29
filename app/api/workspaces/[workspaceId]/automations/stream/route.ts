import type { NextRequest } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params

  // Create a streaming response for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      function send(event: string, data: any) {
        controller.enqueue(encoder.encode(`event: ${event}\n`))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Keep-alive ping every 15s
      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`))
      }, 15000)

      let changeStream: any | null = null
      try {
        const client = await clientPromise
        const db = client.db("instaautodm")

        // Resolve workspace to scope instagramUserId if needed (consistent with other routes)
        const workspace = await db.collection("workspaces").findOne({ _id: workspaceId })
        if (!workspace) {
          send("error", { message: "Workspace not found" })
          controller.close()
          clearInterval(ping)
          return
        }

        // Optional: send initial snapshot quickly to help clients fast-sync
        const initial = await db
          .collection("automations")
          .find({ workspaceId, instagramUserId: workspace.instagramUserId })
          .sort({ createdAt: -1 })
          .toArray()

        // Normalize _id to string for client convenience
        const initialNormalized = initial.map((a: any) => ({
          ...a,
          _id: typeof a._id === "object" && a._id?.toString ? a._id.toString() : a._id,
        }))
        send("sync", { automations: initialNormalized })

        // Start MongoDB change stream filtered to this workspace
        const pipeline = [
          {
            $match: {
              "fullDocument.workspaceId": workspaceId,
            },
          },
        ]

        // fullDocument: "updateLookup" makes update events include the latest doc
        changeStream = db.collection("automations").watch(pipeline, { fullDocument: "updateLookup" })

        changeStream.on("change", (change: any) => {
          try {
            // Prepare payload based on operation
            if (change.operationType === "insert" || change.operationType === "replace") {
              const doc = change.fullDocument
              if (!doc) return
              send("upsert", {
                automation: {
                  ...doc,
                  _id: doc._id?.toString?.() ?? doc._id,
                },
              })
            } else if (change.operationType === "update") {
              const doc = change.fullDocument
              if (!doc) return
              send("upsert", {
                automation: {
                  ...doc,
                  _id: doc._id?.toString?.() ?? doc._id,
                },
              })
            } else if (change.operationType === "delete") {
              const id = change.documentKey?._id?.toString?.() ?? change.documentKey?._id ?? change.documentKey
              send("delete", { id })
            }
          } catch (err) {
            // Emit error but keep stream alive
            send("error", { message: "Failed to process change event" })
          }
        })

        // Handle client disconnects
        const abort = request.signal
        const onAbort = () => {
          try {
            changeStream?.close?.()
          } catch {}
          clearInterval(ping)
          controller.close()
        }
        if (abort.aborted) onAbort()
        abort.addEventListener("abort", onAbort)
      } catch (error) {
        // Fallback: notify client there is no live stream available
        send("error", { message: "Streaming unavailable" })
        clearInterval(ping)
        controller.close()
      }
    },
    cancel() {
      // Reader canceled; nothing extra required here since we close in start abort handler
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // CORS is not necessary for same-origin, but safe to include:
      "Access-Control-Allow-Origin": "*",
    },
  })
}
