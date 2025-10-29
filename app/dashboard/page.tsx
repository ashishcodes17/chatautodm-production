"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Instagram, Users, BarChart3 } from "lucide-react"
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog"
import { ConnectInstagramDialog } from "@/components/connect-instagram-dialog"

interface User {
  id: string
  email: string
  name: string
}

interface Workspace {
  id: string
  name: string
  createdAt: string
  instagramAccounts: InstagramAccount[]
}

interface InstagramAccount {
  id: string
  username: string
  followersCount: number
  isConnected: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [showConnectInstagram, setShowConnectInstagram] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        const authResponse = await fetch("/api/auth/me")
        if (!authResponse.ok) {
          router.push("/")
          return
        }
        const userData = await authResponse.json()
        setUser(userData)

        // Fetch workspaces
        const workspacesResponse = await fetch("/api/workspaces")
        if (workspacesResponse.ok) {
          const workspacesData = await workspacesResponse.json()
          setWorkspaces(workspacesData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const handleWorkspaceCreated = (newWorkspace: Workspace) => {
    setWorkspaces([...workspaces, newWorkspace])
    setShowCreateWorkspace(false)
  }

  const handleInstagramConnected = (workspaceId: string, account: InstagramAccount) => {
    setWorkspaces(
      workspaces.map((ws) =>
        ws.id === workspaceId ? { ...ws, instagramAccounts: [...ws.instagramAccounts, account] } : ws,
      ),
    )
    setShowConnectInstagram(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">ChatAutoDM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Workspaces</h2>
            <p className="text-gray-600">Manage your Instagram accounts and automation</p>
          </div>
          <Button onClick={() => setShowCreateWorkspace(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        </div>

        {workspaces.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
              <p className="text-gray-600 mb-4">Create your first workspace to get started with Instagram automation</p>
              <Button onClick={() => setShowCreateWorkspace(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workspace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <CardDescription>Created {new Date(workspace.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Instagram Accounts</span>
                    <Badge variant="secondary">{workspace.instagramAccounts.length}</Badge>
                  </div>

                  {workspace.instagramAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {workspace.instagramAccounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Instagram className="h-4 w-4 text-pink-600" />
                            <span className="text-sm font-medium">@{account.username}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">{account.followersCount} followers</span>
                            <Badge variant={account.isConnected ? "default" : "destructive"} className="text-xs">
                              {account.isConnected ? "Connected" : "Disconnected"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Instagram className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-3">No Instagram accounts connected</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedWorkspace(workspace.id)
                        setShowConnectInstagram(true)
                      }}
                    >
                      <Instagram className="mr-2 h-3 w-3" />
                      Connect Instagram
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <BarChart3 className="mr-2 h-3 w-3" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onWorkspaceCreated={handleWorkspaceCreated}
      />

      <ConnectInstagramDialog
        open={showConnectInstagram}
        onOpenChange={setShowConnectInstagram}
        workspaceId={selectedWorkspace}
        onInstagramConnected={handleInstagramConnected}
      />
    </div>
  )
}
