"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, ArrowRight, Calendar } from "lucide-react"

interface Workspace {
  _id: string
  name: string
  instagramUserId: string
  username: string
  profilePictureUrl?: string
  lastActivity: string
}

export default function ConnectInstagramPage() {
  const [user, setUser] = useState(null)
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchWorkspaces()

    const params = new URLSearchParams(window.location.search)
    const workspaceId = params.get("workspaceId")
    const error = params.get("error")

    if (workspaceId) {
      router.push(`/${workspaceId}/dashboard`)
    } else if (error) {
      alert("Instagram connection failed: " + error)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        router.push("/")
      }
    } catch {
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("/api/workspaces")
      if (res.ok) {
        const data = await res.json()
        setWorkspaces(data.workspaces || [])
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error)
    }
  }

  const handleInstagramConnect = async () => {
    setConnecting(true)
    const res = await fetch("/api/auth/me")
    const data = await res.json()
    const token = data.token

    const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`)
    const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_insights&state=${token}`

    window.location.href = instagramAuthUrl
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Instagram Workspace Manager</h1>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.picture || "/placeholder.svg"}
                alt={user?.name || "User"}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connect New Instagram Account */}
        <Card className="mb-8 border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Instagram className="h-5 w-5" />
              Connect New Instagram Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Connect a new Instagram business account to create automated DM flows and manage customer interactions.
            </p>
            <Button
              onClick={handleInstagramConnect}
              disabled={connecting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              {connecting ? (
                <>Connecting...</>
              ) : (
                <>
                  <Instagram className="mr-2 h-5 w-5" />
                  Connect Instagram Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Workspaces */}
        {workspaces.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Instagram Accounts</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <Card key={workspace._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={workspace.profilePictureUrl || "/placeholder.svg"}
                        alt={workspace.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">@{workspace.username}</h3>
                        <p className="text-sm text-gray-600">{workspace.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4" />
                      Last active: {new Date(workspace.lastActivity).toLocaleDateString()}
                    </div>
                    <Button
                      onClick={() => router.push(`/${workspace._id}/dashboard`)}
                      className="w-full"
                      variant="outline"
                    >
                      <Instagram className="mr-2 h-4 w-4" />
                      Manage Account
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {workspaces.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Instagram Accounts Connected</h3>
              <p className="text-gray-600">
                Connect your first Instagram business account to start creating automated DM flows and managing customer
                interactions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
