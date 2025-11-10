"use client"

import { useCallback, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  Image as ImageIcon,
  Clock,
  UserCheck,
  Mail,
  Instagram,
  Link as LinkIcon,
} from "lucide-react"

// Custom Node Types
type NodeData = {
  label: string
  type: "trigger" | "content" | "condition"
  subtype?: string
  message?: string
  image?: string
  buttons?: Array<{ text: string; link: string }>
  delay?: number
}

type FlowNode = {
  id: string
  type: string
  position: { x: number; y: number }
  data: NodeData
  parentId?: string | null
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

  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [edges, setEdges] = useState<FlowEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Canvas panning state
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  
  // Connection state
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [connectionLine, setConnectionLine] = useState<{ x: number; y: number } | null>(null)

  // Node templates categorized
  const triggerTemplates = [
    {
      type: "trigger",
      subtype: "comment",
      label: "Post or Reel Comment",
      icon: MessageCircle,
      color: "bg-purple-500",
      description: "When user comments",
    },
    {
      type: "trigger",
      subtype: "story_reply",
      label: "Story Reply",
      icon: Instagram,
      color: "bg-pink-500",
      description: "When user replies to story",
    },
    {
      type: "trigger",
      subtype: "dm",
      label: "Direct Message",
      icon: Mail,
      color: "bg-indigo-500",
      description: "When user DMs you",
    },
  ]

  const contentTemplates = [
    {
      type: "content",
      subtype: "message",
      label: "Send Message",
      icon: MessageCircle,
      color: "bg-blue-500",
      description: "Send DM with buttons",
    },
  ]

  const conditionTemplates = [
    {
      type: "condition",
      subtype: "check_follow",
      label: "Check if Following",
      icon: UserCheck,
      color: "bg-green-500",
      description: "Verify follower status",
    },
    {
      type: "condition",
      subtype: "delay",
      label: "Add Delay",
      icon: Clock,
      color: "bg-orange-500",
      description: "Wait before next step",
    },
  ]

  const addNode = (type: string, subtype: string, label: string, position?: { x: number; y: number }) => {
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: position || { x: 250, y: nodes.length * 200 + 100 },
      data: {
        label,
        type: type as "trigger" | "content" | "condition",
        subtype,
        buttons: type === "content" ? [] : undefined,
      },
      parentId: null,
    }
    setNodes([...nodes, newNode])
    toast.success("Node added", { description: `${label} added to canvas` })
  }

  const deleteNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id))
    setEdges(edges.filter((e) => e.source !== id && e.target !== id))
    if (selectedNode?.id === id) {
      setSelectedNode(null)
    }
    toast.success("Node deleted")
  }

  const connectNodes = (sourceId: string, targetId: string) => {
    const edgeId = `edge-${sourceId}-${targetId}`
    if (!edges.find((e) => e.id === edgeId)) {
      const newEdge = { id: edgeId, source: sourceId, target: targetId }
      setEdges([...edges, newEdge])
      console.log('Edge created:', newEdge)
    }
  }

  // Canvas panning handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.canvas-background')) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - canvasPosition.x, y: e.clientY - canvasPosition.y })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Handle connection line preview (highest priority)
    if (connectingFrom && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      setConnectionLine({
        x: (e.clientX - canvasRect.left - canvasPosition.x) / scale,
        y: (e.clientY - canvasRect.top - canvasPosition.y) / scale,
      })
      return
    }

    // Handle canvas panning
    if (isPanning) {
      setCanvasPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
      return
    }

    // Handle node dragging
    if (draggingNodeId && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newX = (e.clientX - canvasRect.left - canvasPosition.x) / scale - dragOffset.x
      const newY = (e.clientY - canvasRect.top - canvasPosition.y) / scale - dragOffset.y

      setNodes(
        nodes.map((n) =>
          n.id === draggingNodeId ? { ...n, position: { x: newX, y: newY } } : n
        )
      )
      return
    }
  }

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false)
    setDraggingNodeId(null)
    
    // If we were connecting but didn't hit a target, cancel the connection
    if (connectingFrom) {
      setConnectingFrom(null)
      setConnectionLine(null)
    }
  }

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    setDraggingNodeId(nodeId)
    setDragOffset({
      x: 0,
      y: 0,
    })
  }

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(Math.max(0.3, scale * delta), 2)
    setScale(newScale)
  }

  // Start connection from a node
  const startConnection = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('Starting connection from:', nodeId)
    setConnectingFrom(nodeId)
    
    // Initialize connection line
    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      setConnectionLine({
        x: (e.clientX - canvasRect.left - canvasPosition.x) / scale,
        y: (e.clientY - canvasRect.top - canvasPosition.y) / scale,
      })
    }
  }

  // Complete connection to a node
  const completeConnection = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation()
    e.preventDefault()
    
    console.log('Completing connection to:', targetId, 'from:', connectingFrom)
    
    if (connectingFrom && connectingFrom !== targetId) {
      connectNodes(connectingFrom, targetId)
      toast.success("Nodes connected", { 
        description: `Connected to ${targetId}` 
      })
    }
    
    setConnectingFrom(null)
    setConnectionLine(null)
  }

  const addButton = () => {
    if (!selectedNode || selectedNode.data.type !== "content") return
    if ((selectedNode.data.buttons?.length || 0) >= 3) {
      toast.error("Button Limit", { description: "Maximum 3 buttons allowed" })
      return
    }

    const updatedButtons = [...(selectedNode.data.buttons || []), { text: "New Button", link: "" }]
    const updatedNode = {
      ...selectedNode,
      data: { ...selectedNode.data, buttons: updatedButtons },
    }

    setNodes(nodes.map((n) => (n.id === selectedNode.id ? updatedNode : n)))
    setSelectedNode(updatedNode)
  }

  const updateButton = (index: number, field: "text" | "link", value: string) => {
    if (!selectedNode || !selectedNode.data.buttons) return

    const updatedButtons = [...selectedNode.data.buttons]
    updatedButtons[index] = { ...updatedButtons[index], [field]: value }

    const updatedNode = {
      ...selectedNode,
      data: { ...selectedNode.data, buttons: updatedButtons },
    }

    setNodes(nodes.map((n) => (n.id === selectedNode.id ? updatedNode : n)))
    setSelectedNode(updatedNode)
  }

  const removeButton = (index: number) => {
    if (!selectedNode || !selectedNode.data.buttons) return

    const updatedButtons = selectedNode.data.buttons.filter((_, i) => i !== index)
    const updatedNode = {
      ...selectedNode,
      data: { ...selectedNode.data, buttons: updatedButtons },
    }

    setNodes(nodes.map((n) => (n.id === selectedNode.id ? updatedNode : n)))
    setSelectedNode(updatedNode)
  }

  const handleSave = async () => {
    toast.success("Flow Saved", { description: "Your automation flow has been saved" })
  }

  const handleGoLive = async () => {
    const triggerNode = nodes.find((n) => n.data.type === "trigger")
    const contentNode = nodes.find((n) => n.data.type === "content")

    if (!triggerNode) {
      toast.error("Missing Trigger", { description: "Add a trigger to start your flow" })
      return
    }

    if (!contentNode) {
      toast.error("Missing Content", { description: "Add at least one message to send" })
      return
    }

    if (contentNode.data.type === "content" && !contentNode.data.message?.trim()) {
      toast.error("Empty Message", { description: "Enter a message to send" })
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
        <div className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Components</h2>

          {/* Triggers */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Triggers</h3>
            <div className="space-y-2">
              {triggerTemplates.map((template) => (
                <Card
                  key={template.subtype}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-400"
                  onClick={() => addNode(template.type, template.subtype, template.label)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${template.color} text-white shrink-0`}>
                      <template.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{template.label}</p>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Content</h3>
            <div className="space-y-2">
              {contentTemplates.map((template) => (
                <Card
                  key={template.subtype}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-400"
                  onClick={() => addNode(template.type, template.subtype, template.label)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${template.color} text-white shrink-0`}>
                      <template.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{template.label}</p>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Conditions</h3>
            <div className="space-y-2">
              {conditionTemplates.map((template) => (
                <Card
                  key={template.subtype}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-green-400"
                  onClick={() => addNode(template.type, template.subtype, template.label)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${template.color} text-white shrink-0`}>
                      <template.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{template.label}</p>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900 font-medium mb-2">💡 Quick Tip</p>
            <p className="text-xs text-blue-700">
              Click on components to add them to the canvas. Drag nodes to reposition them.
            </p>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
        >
          {/* Background Pattern */}
          <div 
            className="canvas-background absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
              backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px`,
            }}
          />

          {/* SVG Layer for Connections */}
          <svg 
            className="absolute inset-0 pointer-events-none w-full h-full" 
            style={{ zIndex: 1 }}
          >
            {/* Arrow marker definitions */}
            <defs>
              {/* Gray arrow for main connections */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="5"
                orient="auto-start-reverse"
                markerUnits="strokeWidth"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill="#9ca3af"
                />
              </marker>
              
              {/* Blue arrow for preview connections */}
              <marker
                id="arrowhead-preview"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="5"
                orient="auto-start-reverse"
                markerUnits="strokeWidth"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill="#60a5fa"
                />
              </marker>
            </defs>

            {/* Draw existing edges */}
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.source)
              const targetNode = nodes.find((n) => n.id === edge.target)
              if (!sourceNode || !targetNode) return null

              // Calculate positions with proper scaling and offset
              const x1 = (sourceNode.position.x + 160) * scale + canvasPosition.x
              const y1 = (sourceNode.position.y + 140) * scale + canvasPosition.y // Bottom of source node (adjusted)
              const x2 = (targetNode.position.x + 160) * scale + canvasPosition.x
              const y2 = (targetNode.position.y) * scale + canvasPosition.y // Top of target node (no gap)

              // Calculate curve control points for smooth S-curve
              const distance = Math.abs(y2 - y1)
              const curveIntensity = Math.min(distance * 0.5, 100 * scale)

              // React Flow style Bezier curve with better control points
              const path = `M ${x1},${y1} C ${x1},${y1 + curveIntensity} ${x2},${y2 - curveIntensity} ${x2},${y2}`

              return (
                <g key={edge.id}>
                  {/* Thicker background line for better visibility */}
                  <path
                    d={path}
                    stroke="#e5e7eb"
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Main line with arrow */}
                  <path
                    d={path}
                    stroke="#9ca3af"
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              )
            })}

            {/* Draw connection preview line */}
            {connectingFrom && connectionLine && (() => {
              const sourceNode = nodes.find((n) => n.id === connectingFrom)
              if (!sourceNode) return null

              const x1 = (sourceNode.position.x + 160) * scale + canvasPosition.x
              const y1 = (sourceNode.position.y + 140) * scale + canvasPosition.y

              const x2 = connectionLine.x * scale + canvasPosition.x
              const y2 = connectionLine.y * scale + canvasPosition.y

              // Calculate curve control points
              const distance = Math.abs(y2 - y1)
              const curveIntensity = Math.min(distance * 0.5, 100 * scale)

              // React Flow style Bezier curve for preview
              const path = `M ${x1},${y1} C ${x1},${y1 + curveIntensity} ${x2},${y2 - curveIntensity} ${x2},${y2}`

              return (
                <path
                  d={path}
                  stroke="#60a5fa"
                  strokeWidth={2.5}
                  strokeDasharray="5,5"
                  fill="none"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead-preview)"
                />
              )
            })()}
          </svg>
          {/* Nodes Container */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              zIndex: 2,
            }}
          >
            {nodes.map((node) => {
              const getNodeColor = () => {
                if (node.data.type === "trigger") return "bg-purple-500"
                if (node.data.type === "content") return "bg-blue-500"
                return "bg-green-500"
              }

              const getNodeIcon = () => {
                if (node.data.subtype === "comment") return MessageCircle
                if (node.data.subtype === "story_reply") return Instagram
                if (node.data.subtype === "dm") return Mail
                if (node.data.subtype === "message") return MessageCircle
                if (node.data.subtype === "check_follow") return UserCheck
                if (node.data.subtype === "delay") return Clock
                return MessageCircle
              }

              const Icon = getNodeIcon()

              return (
                <div
                  key={node.id}
                  className="pointer-events-auto"
                  style={{
                    position: "absolute",
                    left: node.position.x,
                    top: node.position.y,
                    cursor: draggingNodeId === node.id ? "grabbing" : "grab",
                  }}
                >
                  {/* Connection Handles */}
                  {/* Top Handle - Target (where connections can end) */}
                  <div
                    className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow cursor-pointer hover:scale-125 transition-transform z-10 ${
                      connectingFrom ? 'bg-green-500 animate-pulse' : 'bg-purple-500'
                    }`}
                    title="Drop connection here"
                    onMouseUp={(e) => {
                      if (connectingFrom) {
                        completeConnection(e, node.id)
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (connectingFrom && connectingFrom !== node.id) {
                        e.currentTarget.style.transform = 'translate(-50%, 0) scale(1.5)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(-50%, 0) scale(1)'
                    }}
                  />
                  
                  {/* Bottom Handle - Source (where connections start) */}
                  <div
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow cursor-pointer hover:scale-125 transition-transform z-10 ${
                      connectingFrom === node.id ? 'bg-blue-500 animate-pulse' : 'bg-purple-500'
                    }`}
                    title="Drag to connect"
                    onMouseDown={(e) => {
                      startConnection(e, node.id)
                    }}
                  />

                  <Card
                    className={`p-4 w-80 transition-all ${
                      selectedNode?.id === node.id
                        ? "ring-2 ring-purple-500 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedNode(node)
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getNodeColor()} text-white shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{node.data.label}</p>
                          <p className="text-xs text-gray-500 capitalize">{node.data.type}</p>
                        </div>
                      </div>

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

                    {node.data.message && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-700 line-clamp-2">{node.data.message}</p>
                      </div>
                    )}

                    {node.data.image && (
                      <div className="mt-2 p-2 bg-gray-50 rounded flex items-center gap-2">
                        <ImageIcon className="h-3 w-3 text-gray-500" />
                        <p className="text-xs text-gray-600">Image attached</p>
                      </div>
                    )}

                    {node.data.buttons && node.data.buttons.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {node.data.buttons.map((btn, i) => (
                          <div key={i} className="p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs font-medium text-blue-900 truncate">{btn.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {node.data.subtype === "delay" && node.data.delay && (
                      <div className="mt-2 p-2 bg-orange-50 rounded">
                        <p className="text-xs text-orange-900">{node.data.delay} seconds delay</p>
                      </div>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Building Your Flow</h3>
                <p className="text-gray-600 mb-4">Click on components from the left sidebar to add them</p>
              </div>
            </div>
          )}

          {/* Controls Guide */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs space-y-1 pointer-events-auto z-50">
            <p className="font-semibold text-gray-900 mb-2">Controls:</p>
            <p className="text-gray-700">🖱️ <strong>Drag canvas</strong> - Pan around</p>
            <p className="text-gray-700">🔍 <strong>Scroll</strong> - Zoom in/out</p>
            <p className="text-gray-700">🎯 <strong>Drag nodes</strong> - Reposition</p>
            <p className="text-gray-700">🔗 <strong>Drag bottom handle (●)</strong> to top handle (●)</p>
            <p className="text-purple-600 text-xs mt-1 ml-4">↳ Purple = ready, Blue = connecting</p>
            <p className="text-gray-600 mt-2 pt-2 border-t">
              Zoom: {Math.round(scale * 100)}%
              {connectingFrom && <span className="ml-2 text-blue-600">● Connecting...</span>}
            </p>
          </div>
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

              {/* Message Editor for Content Nodes */}
              {selectedNode.data.type === "content" && selectedNode.data.subtype === "message" && (
                <div className="space-y-4">
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

                  {/* Image Upload */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-2 block">Image (Optional)</label>
                    <Input
                      type="text"
                      value={selectedNode.data.image || ""}
                      onChange={(e) => {
                        setNodes(
                          nodes.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, image: e.target.value } }
                              : n
                          )
                        )
                        setSelectedNode({
                          ...selectedNode,
                          data: { ...selectedNode.data, image: e.target.value },
                        })
                      }}
                      placeholder="Image URL"
                      className="w-full"
                    />
                  </div>

                  {/* Buttons Editor */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                      Buttons (Max 3)
                    </label>
                    <div className="space-y-2">
                      {selectedNode.data.buttons?.map((button, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded border space-y-1">
                          <Input
                            type="text"
                            value={button.text}
                            onChange={(e) => updateButton(index, "text", e.target.value)}
                            placeholder="Button text"
                            className="w-full text-xs"
                          />
                          <Input
                            type="text"
                            value={button.link}
                            onChange={(e) => updateButton(index, "link", e.target.value)}
                            placeholder="Button link"
                            className="w-full text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs h-6"
                            onClick={() => removeButton(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}

                      {(!selectedNode.data.buttons || selectedNode.data.buttons.length < 3) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={addButton}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Button
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Delay Editor for Delay Nodes */}
              {selectedNode.data.type === "condition" && selectedNode.data.subtype === "delay" && (
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">
                    Delay Duration (seconds)
                  </label>
                  <Input
                    type="number"
                    value={selectedNode.data.delay || 0}
                    onChange={(e) => {
                      const delay = parseInt(e.target.value) || 0
                      setNodes(
                        nodes.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, delay } }
                            : n
                        )
                      )
                      setSelectedNode({
                        ...selectedNode,
                        data: { ...selectedNode.data, delay },
                      })
                    }}
                    min="0"
                    placeholder="Delay in seconds"
                    className="w-full"
                  />
                </div>
              )}

              {/* Info for Check Follow Node */}
              {selectedNode.data.type === "condition" && selectedNode.data.subtype === "check_follow" && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-900">
                    This node checks if the user is following your Instagram account before proceeding.
                  </p>
                </div>
              )}

              {/* Info for Trigger Nodes */}
              {selectedNode.data.type === "trigger" && (
                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                  <p className="text-xs text-purple-900">
                    This trigger starts the automation when the specified event occurs.
                  </p>
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
