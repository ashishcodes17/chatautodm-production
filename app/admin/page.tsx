"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, MessageCircle, TrendingUp, Activity, Database, Zap, ArrowUpRight, Search, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdminStats {
  totalUsers: number
  totalWorkspaces: number
  totalDMsSent: number
  totalContacts: number
  totalAutomations: number
  activeAutomations: number
  userGrowth: number
  dmGrowth: number
  avgDMsPerUser: number
  avgAutomationsPerUser: number
}

interface UserData {
  _id: string
  email: string
  name: string
  picture?: string
  createdAt: string
  workspaces: number
  dmsSent: number
  automations: number
  lastActive?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [displayStats, setDisplayStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [timeRange, setTimeRange] = useState("7d")
  const [es, setEs] = useState<EventSource | null>(null)

  // Data explorer state
  const [activeCollection, setActiveCollection] = useState<"workspaces" | "instagram_accounts" | "automations">("workspaces")
  const [dataItems, setDataItems] = useState<any[]>([])
  const [dataTotal, setDataTotal] = useState(0)
  const [dataPage, setDataPage] = useState(1)
  const [dataPageSize, setDataPageSize] = useState(20)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch("/api/admin/verify")
      if (!response.ok) {
        router.push("/")
        return
      }
      fetchAdminData()
    } catch (error) {
      console.error("Admin auth failed:", error)
      router.push("/")
    }
  }

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/stats?range=${timeRange}`),
        fetch("/api/admin/users"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
        setDisplayStats((prev) => prev || statsData) // initialize display baseline
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Connect to live stats stream via SSE and animate towards incoming totals
  useEffect(() => {
    // Close previous SSE if any
    if (es) {
      try { es.close() } catch {}
    }
    const stream = new EventSource("/api/admin/stats/stream")
    const handleSync = (evt: MessageEvent) => {
      try {
        const incoming = JSON.parse(evt.data)
        setStats((prev) => ({ ...(prev || {} as any), ...incoming }))
      } catch {}
    }
    stream.addEventListener("sync", handleSync)
    setEs(stream)
    return () => {
      try { stream.close() } catch {}
      setEs(null)
    }
  }, [])

  // Smoothly animate displayStats towards stats totals
  useEffect(() => {
    if (!stats) return
    if (!displayStats) { setDisplayStats(stats); return }

    const duration = 600 // ms per animation
    const frameRate = 60
    const steps = Math.max(1, Math.floor((duration / 1000) * frameRate))
    let step = 0

    const start = { ...displayStats }
    const end = { ...displayStats, ...stats }

    const fields: (keyof AdminStats)[] = [
      "totalUsers","totalWorkspaces","totalDMsSent","totalContacts","totalAutomations","activeAutomations","userGrowth","dmGrowth","avgDMsPerUser","avgAutomationsPerUser"
    ]

    const interval = setInterval(() => {
      step++
      const t = step / steps
      const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t // easeInOutQuad
      const next: any = { ...displayStats }
      for (const f of fields) {
        const sv = Number((start as any)[f] ?? 0)
        const ev = Number((end as any)[f] ?? 0)
        next[f] = sv + (ev - sv) * eased
      }
      setDisplayStats(next)
      if (step >= steps) {
        clearInterval(interval)
        setDisplayStats(end as any)
      }
    }, 1000 / frameRate)

    return () => clearInterval(interval)
  }, [stats])

  // Data explorer fetcher
  const fetchCollection = async (collection = activeCollection, page = dataPage, pageSize = dataPageSize) => {
    const res = await fetch(`/api/admin/data?collection=${collection}&page=${page}&pageSize=${pageSize}`)
    if (!res.ok) return
    const json = await res.json()
    setDataItems(json.items || [])
    setDataTotal(json.total || 0)
    setDataPage(json.page || 1)
    setDataPageSize(json.pageSize || 20)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const exportData = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/export?type=${type}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Platform analytics and user management</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value)
                  fetchAdminData()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <Button onClick={() => router.push("/")} variant="outline">
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                {stats && stats.userGrowth > 0 && (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stats.userGrowth}%
                  </Badge>
                )}
              </div>
              <h3 className="text-sm font-medium text-blue-700 mb-1">Total Users</h3>
              <p className="text-3xl font-bold text-blue-900">{Math.round(displayStats?.totalUsers || 0)}</p>
              <p className="text-xs text-blue-600 mt-2">{stats?.totalWorkspaces || 0} workspaces</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                {stats && stats.dmGrowth > 0 && (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stats.dmGrowth}%
                  </Badge>
                )}
              </div>
              <h3 className="text-sm font-medium text-purple-700 mb-1">Total DMs Sent</h3>
              <p className="text-3xl font-bold text-purple-900">{Math.round(displayStats?.totalDMsSent || 0)}</p>
              <p className="text-xs text-purple-600 mt-2">Avg {(displayStats?.avgDMsPerUser ?? 0).toFixed(1)} per user</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-green-700 mb-1">Total Automations</h3>
              <p className="text-3xl font-bold text-green-900">{Math.round(displayStats?.totalAutomations || 0)}</p>
              <p className="text-xs text-green-600 mt-2">{Math.round(displayStats?.activeAutomations || 0)} active</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-orange-700 mb-1">Total Contacts</h3>
              <p className="text-3xl font-bold text-orange-900">{Math.round(displayStats?.totalContacts || 0)}</p>
              <p className="text-xs text-orange-600 mt-2">Collected via automations</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button onClick={() => exportData("users")} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Workspaces</TableHead>
                        <TableHead>DMs Sent</TableHead>
                        <TableHead>Automations</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {user.picture ? (
                                <img
                                  src={user.picture || "/placeholder.svg"}
                                  alt={user.name}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-purple-700">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.workspaces}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{user.dmsSent}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{user.automations}</span>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Platform Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">User Growth</p>
                        <p className="text-2xl font-bold text-blue-700">{stats?.userGrowth || 0}%</p>
                      </div>
                      <ArrowUpRight className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">DM Growth</p>
                        <p className="text-2xl font-bold text-purple-700">{stats?.dmGrowth || 0}%</p>
                      </div>
                      <ArrowUpRight className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Avg DMs per User</p>
                        <p className="text-2xl font-bold text-green-700">{stats?.avgDMsPerUser.toFixed(1) || 0}</p>
                      </div>
                      <MessageCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Avg Automations per User</p>
                        <p className="text-2xl font-bold text-orange-700">
                          {stats?.avgAutomationsPerUser.toFixed(1) || 0}
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Activity logs will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Explorer Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Data Explorer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={activeCollection}
                    onChange={(e) => {
                      const val = e.target.value as any
                      setActiveCollection(val)
                      setDataPage(1)
                      fetchCollection(val, 1, dataPageSize)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="workspaces">workspaces</option>
                    <option value="instagram_accounts">instagram_accounts</option>
                    <option value="automations">automations</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchCollection(activeCollection, dataPage, dataPageSize)}
                  >
                    Refresh
                  </Button>
                </div>

                <div className="overflow-x-auto border rounded-md">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">_id</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">createdAt</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataItems.map((row) => (
                        <tr key={row._id} className="border-t">
                          <td className="px-3 py-2 font-mono text-xs">{String(row._id)}</td>
                          <td className="px-3 py-2 text-gray-600">{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
                          <td className="px-3 py-2">
                            <pre className="max-w-[600px] whitespace-pre-wrap break-all text-xs bg-gray-50 p-2 rounded">{JSON.stringify(row, null, 2)}</pre>
                          </td>
                        </tr>
                      ))}
                      {dataItems.length === 0 && (
                        <tr>
                          <td className="px-3 py-6 text-center text-gray-500" colSpan={3}>No data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Total: {dataTotal}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={dataPage <= 1}
                      onClick={() => {
                        const p = Math.max(1, dataPage - 1)
                        setDataPage(p)
                        fetchCollection(activeCollection, p, dataPageSize)
                      }}
                    >
                      Prev
                    </Button>
                    <span className="text-sm">Page {dataPage}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={dataPage * dataPageSize >= dataTotal}
                      onClick={() => {
                        const p = dataPage + 1
                        setDataPage(p)
                        fetchCollection(activeCollection, p, dataPageSize)
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
