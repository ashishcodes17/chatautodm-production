"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { useRouter, useParams } from "next/navigation"
import { MessageCircle, Plus, Trash2, Edit, Activity, Zap, Camera, Menu, Sparkles } from "lucide-react"

import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import AutomationModal from "@/components/AutomationModal"

interface Automation {
  _id: string
  name: string
  type: string
  isActive: boolean
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AutomationsPage() {
  const router = useRouter()
  const params = useParams()
  const wsid = params.wsid as string

  // SWR for initial and periodic refresh (backup)
  const { data, error, mutate } = useSWR(wsid ? `/api/workspaces/${wsid}/automations` : null, fetcher, {
    // Light polling as a fallback; SSE will keep it fresh in real-time
    refreshInterval: 0,
    revalidateOnFocus: true,
  })

  const [automations, setAutomations] = useState<Automation[]>([])
  const [showAutomationModal, setShowAutomationModal] = useState(false)

  // Initialize state from SWR
  useEffect(() => {
    if (data?.automations) {
      setAutomations(data.automations as Automation[])
    }
  }, [data])

  // Establish SSE connection for real-time updates
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!wsid) return

    // Close any existing connection before creating a new one
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    const es = new EventSource(`/api/workspaces/${wsid}/automations/stream`)
    esRef.current = es

    es.addEventListener("sync", (evt: MessageEvent) => {
      try {
        const payload = JSON.parse(evt.data)
        if (Array.isArray(payload.automations)) {
          setAutomations(payload.automations)
          // keep SWR cache aligned silently
          mutate(
            `/api/workspaces/${wsid}/automations`,
            (prev: any) => ({ ...(prev || {}), automations: payload.automations }),
            { revalidate: false },
          )
        }
      } catch {}
    })

    es.addEventListener("upsert", (evt: MessageEvent) => {
      try {
        const payload = JSON.parse(evt.data)
        const updated = payload.automation as Automation
        setAutomations((prev) => {
          const idx = prev.findIndex((a) => a._id === updated._id)
          if (idx === -1) return [updated, ...prev]
          const copy = [...prev]
          copy[idx] = { ...copy[idx], ...updated }
          return copy
        })
      } catch {}
    })

    es.addEventListener("delete", (evt: MessageEvent) => {
      try {
        const payload = JSON.parse(evt.data)
        const id = payload.id as string
        setAutomations((prev) => prev.filter((a) => a._id !== id))
      } catch {}
    })

    es.addEventListener("error", (_evt: MessageEvent) => {
      // Silent error; fallback to manual refresh or focus revalidate
    })

    // Cleanup on unmount or wsid change
    return () => {
      try {
        es.close()
      } catch {}
      esRef.current = null
    }
  }, [wsid, mutate])

  // DELETE automation
const deleteAutomation = async (automation: Automation) => {
  if (!confirm("Are you sure you want to delete this automation?")) return

  try {
    let res;
    
    // Ice breakers need special DELETE handling via Instagram API
    if (automation.type === "ice_breakers") {
      console.log("🧊 Deleting ice breakers via Instagram API...")
      res = await fetch(`/api/workspaces/${wsid}/ice-breakers`, { method: "DELETE" })
    } else {
      // Regular automation delete
      res = await fetch(`/api/automations/${automation._id}`, { method: "DELETE" })
    }
    
    if (!res.ok) {
      alert("Failed to delete automation. Please try again.")
      return
    }

    // Optimistic UI: remove from state immediately
    setAutomations((prev) => prev.filter((a) => a._id !== automation._id))

    // Keep SWR cache aligned
    mutate(`/api/workspaces/${wsid}/automations`, (prev: any) => ({
      ...(prev || {}),
      automations: (prev?.automations || []).filter((a: Automation) => a._id !== automation._id),
    }), false)

  } catch (err) {
    console.error("Delete error:", err)
    alert("Failed to delete automation. Please try again.")
  }
}

// TOGGLE active/inactive
const toggleActive = async (automation: Automation) => {
  const newStatus = !automation.isActive

  // Optimistic UI update
  setAutomations((prev) =>
    prev.map((a) => (a._id === automation._id ? { ...a, isActive: newStatus } : a))
  )

  try {
    const res = await fetch(`/api/automations/${automation._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: newStatus }),
    })

    if (!res.ok) {
      // revert if failed
      setAutomations((prev) =>
        prev.map((a) => (a._id === automation._id ? { ...a, isActive: automation.isActive } : a))
      )
      alert("Failed to update status. Please try again.")
    } else {
      // Update SWR cache silently
      mutate(`/api/workspaces/${wsid}/automations`, (prev: any) => {
        const updatedAutomations = (prev?.automations || []).map((a: Automation) =>
          a._id === automation._id ? { ...a, isActive: newStatus } : a
        )
        return { ...(prev || {}), automations: updatedAutomations }
      }, false)
    }

  } catch (err) {
    console.error("Toggle error:", err)
    // revert on error
    setAutomations((prev) =>
      prev.map((a) => (a._id === automation._id ? { ...a, isActive: automation.isActive } : a))
    )
    alert("Failed to update status. Please try again.")
  }
}


  const getAutomationIcon = (type: string) => {
    switch (type) {
      case "dm_automation":
        return <Zap className="h-4 w-4 text-green-600" />
      case "comment_to_dm_flow":
        return <MessageCircle className="h-4 w-4 text-purple-600" />
      case "story_reply_flow":
        return <Camera className="h-4 w-4 text-pink-600" />
      case "persistent_menu":
        return <Menu className="h-4 w-4 text-blue-600" />
      case "ice_breakers":
        return <Sparkles className="h-4 w-4 text-emerald-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getAutomationTypeLabel = (type: string) => {
    switch (type) {
      case "dm_automation":
        return "DM Auto-Responder"
      case "comment_to_dm_flow":
        return "Comment to DM"
      case "story_reply_flow":
        return "Story Reply"
      case "persistent_menu":
        return "Persistent Menu"
      case "ice_breakers":
        return "Ice Breakers"
      default:
        return "Automation"
    }
  }

  const getEditRoute = (automation: Automation) => {
    switch (automation.type) {
      case "dm_automation":
        return `/${wsid}/automations/dm-builder?edit=${automation._id}`
      case "story_reply_flow":
        return `/${wsid}/automations/story-builder?edit=${automation._id}`
      case "persistent_menu":
        return `/${wsid}/automations/persistent-menu-builder?edit=${automation._id}`
      case "ice_breakers":
        return `/${wsid}/automations/ice-breakers`
      default:
        return `/${wsid}/automations/flow-builder?edit=${automation._id}`
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Automations</h1>
              <p className="text-gray-600 mt-1">Manage all your active and inactive automations</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAutomationModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Automation
              </Button>
              {/* Manual refresh as a fallback aid */}
              <Button
                variant="outline"
                onClick={() => mutate(`/api/workspaces/${wsid}/automations`)}
                className="hidden md:inline-flex"
              >
                Refresh
              </Button>
            </div>
          </div>

          {error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-2">Failed to load automations</div>
              <Button onClick={() => mutate(`/api/workspaces/${wsid}/automations`)} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          ) : automations.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No automations found.</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Automation</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Runs</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Last Published</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {automations.map((automation) => (
                      <tr key={automation._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                          {getAutomationIcon(automation.type)}
                          {automation.name}
                        </td>
                        <td className="px-4 py-4 text-gray-600">{getAutomationTypeLabel(automation.type)}</td>
                        <td className="px-4 py-4 text-gray-600">1</td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              automation.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {automation.isActive ? "Live" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {new Date(automation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(getEditRoute(automation))}>
                            <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => toggleActive(automation)}>
                            {automation.isActive ? "Pause" : "Resume"}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteAutomation(automation)}>
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="grid md:hidden gap-4">
                {automations.map((automation) => (
                  <div key={automation._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAutomationIcon(automation.type)}
                        <h2 className="font-semibold text-gray-900">{automation.name}</h2>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          automation.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {automation.isActive ? "Live" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Type:</span> {getAutomationTypeLabel(automation.type)}
                      </p>
                      <p>
                        <span className="font-medium">Runs:</span> 1
                      </p>
                      <p>
                        <span className="font-medium">Last Published:</span>{" "}
                        {new Date(automation.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(getEditRoute(automation))}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => toggleActive(automation)}>
                        {automation.isActive ? "Pause" : "Resume"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteAutomation(automation)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      <AutomationModal isOpen={showAutomationModal} onClose={() => setShowAutomationModal(false)} />
    </div>
  )
}
