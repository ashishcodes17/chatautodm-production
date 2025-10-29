"use client"

import { Sidebar } from "@/components/Sidebar"
import { useEffect, useState } from "react"

interface WebhookLog {
  _id: string
  eventType: string
  data: any
  success: boolean
  error?: string
  timestamp: string
}

export default function WebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/webhooks/logs")
      const data = await response.json()
      if (data.success) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error("Error fetching webhook logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatData = (data: any) => {
    if (typeof data === "string") return data
    return JSON.stringify(data, null, 2)
  }

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="ml-60 p-8 flex-1">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 p-8 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Webhook Logs</h1>
            <p className="text-gray-600">Real-time webhook events and processing logs</p>
          </div>
          <button onClick={fetchLogs} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Refresh
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📡</div>
            <h3 className="text-lg font-semibold mb-2">No webhook events yet</h3>
            <p className="text-gray-600">Webhook events will appear here when Instagram sends notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log._id}
                className={`border rounded-lg p-4 ${
                  log.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.success ? "✅ Success" : "❌ Error"}
                    </span>
                    <span className="font-medium">{log.eventType}</span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>

                {log.error && (
                  <div className="mb-2 p-2 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
                    <strong>Error:</strong> {log.error}
                  </div>
                )}

                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">View Data</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {formatData(log.data)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
