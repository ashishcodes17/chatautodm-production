"use client"

import { useCallback, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast, Toaster } from "sonner"
import {
  MessageCircle,
  Plus,
  Save,
  Play,
  Settings,
  Trash2,
  Copy,
  ChevronLeft,
} from "lucide-react"

// Custom Node Types
type NodeData = {
  label: string
  type: "trigger" | "action" | "condition"
  message?: string
  buttons?: Array<{ text: string; link: string }>
}

type FlowNode = {
  id: string
  type: string
  position: { x: number; y: number }
  data: NodeData
}

type FlowEdge = {
  id: string
  source: string
  target: string
}

export default function VisualFlowBuilder() {
  const params = useParams()
  const router = useRouter()
  const wsid = params.wsid as string

  const [nodes, setNodes] = useState<FlowNode[]>([
    {
      id: "trigger-1",
      type: "trigger",
      position: { x: 250, y: 50 },
      data: { label: "User Comments", type: "trigger" },
    },
  ])

  const [edges, setEdges] = useState<FlowEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)

  // Node templates for the sidebar
  const nodeTemplates = [
    {
      type: "trigger",
      label: "Comment Trigger",
      icon: MessageCircle,
      color: "bg-purple-500",
    },
    {
      type: "action",
      label: "Send DM",
      icon: MessageCircle,
      color: "bg-blue-500",
    },
    {
      type: "condition",
      label: "Check Follow",
      icon: Settings,
      color: "bg-green-500",
    },
  ]

  const addNode = (type: string) => {
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 250, y: nodes.length * 150 + 100 },
      data: {
        label: type === "trigger" ? "New Trigger" : type === "action" ? "New Action" : "New Condition",
        type: type as "trigger" | "action" | "condition",
      },
    }
    setNodes([...nodes, newNode])
    toast.success("Node added", { description: `${type} node added to canvas` })
  }

  const deleteNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id))
    setEdges(edges.filter((e) => e.source !== id && e.target !== id))
    setSelectedNode(null)
    toast.success("Node deleted")
  }

  const handleSave = async () => {
    toast.success("Flow Saved", { description: "Your automation flow has been saved" })
  }

  const handleGoLive = async () => {
    if (nodes.length < 2) {
      toast.error("Incomplete Flow", {
        description: "Add at least one trigger and one action before going live",
      })
      return
    }
    toast.success("Flow Activated", { description: "Your automation is now live" })
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" richColors closeButton />

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/${wsid}/automations`)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Visual Flow Builder</h1>
            <p className="text-sm text-gray-500">Drag and drop to create your automation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleGoLive} className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Play className="h-4 w-4 mr-2" />
            Go Live
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Add Components</h2>

          <div className="space-y-2">
            {nodeTemplates.map((template) => (
              <Card
                key={template.type}
                className="p-4 cursor-move hover:shadow-md transition-shadow border-2 border-gray-200 hover:border-purple-400"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("nodeType", template.type)
                  setIsDragging(true)
                }}
                onDragEnd={() => setIsDragging(false)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${template.color} text-white`}>
                    <template.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{template.label}</p>
                    <p className="text-xs text-gray-500">Drag to canvas</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900 font-medium mb-2">💡 Quick Tip</p>
            <p className="text-xs text-blue-700">
              Drag nodes to the canvas and connect them to build your automation flow
            </p>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto"
          style={{
            backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
          onDrop={(e) => {
            e.preventDefault()
            const nodeType = e.dataTransfer.getData("nodeType")
            if (nodeType) {
              addNode(nodeType)
            }
            setIsDragging(false)
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Nodes */}
          <div className="p-8">
            {nodes.map((node, index) => (
              <div key={node.id} className="mb-6">
                <Card
                  className={`p-6 w-80 cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? "ring-2 ring-purple-500 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          node.data.type === "trigger"
                            ? "bg-purple-500"
                            : node.data.type === "action"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        } text-white`}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{node.data.label}</p>
                        <p className="text-xs text-gray-500 capitalize">{node.data.type}</p>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNode(node.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {node.data.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{node.data.message}</p>
                    </div>
                  )}

                  {node.data.buttons && node.data.buttons.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {node.data.buttons.map((btn, i) => (
                        <div key={i} className="p-2 bg-purple-50 rounded border border-purple-200">
                          <p className="text-xs font-medium text-purple-900">{btn.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Connection Line */}
                {index < nodes.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="w-0.5 h-6 bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Node Button */}
            {nodes.length > 0 && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-dashed border-2"
                  onClick={() => addNode("action")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Building</h3>
                <p className="text-gray-600 mb-4">Drag components from the left to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-gray-700">Node Properties</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Node Type</label>
                <p className="text-sm text-gray-900 capitalize">{selectedNode.data.type}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Label</label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    setNodes(
                      nodes.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, label: e.target.value } }
                          : n
                      )
                    )
                    setSelectedNode({
                      ...selectedNode,
                      data: { ...selectedNode.data, label: e.target.value },
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {selectedNode.data.type === "action" && (
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Message</label>
                  <textarea
                    value={selectedNode.data.message || ""}
                    onChange={(e) => {
                      setNodes(
                        nodes.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, message: e.target.value } }
                            : n
                        )
                      )
                      setSelectedNode({
                        ...selectedNode,
                        data: { ...selectedNode.data, message: e.target.value },
                      })
                    }}
                    rows={4}
                    placeholder="Enter your message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => deleteNode(selectedNode.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Node
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
