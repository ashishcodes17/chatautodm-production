"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, MessageCircle, Shield, Crown, Sparkles, Settings, Users, Menu, ChevronDown, Plus, Check } from "lucide-react"

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json())

interface Workspace {
  _id: string
  name: string
  description: string
  createdAt: string
  instagramAccounts: Array<{
    profilePictureUrl?: string
    username?: string
  }>
}

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const wsid = params.wsid as string
  const swrStaticConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    shouldRetryOnError: false,
  }

  // ✅ Mobile sheet state control
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = React.useState(false)
  const [connecting, setConnecting] = React.useState(false)

  // Authenticated user
  const { data: user } = useSWR("/api/auth/me", fetcher)

  // Workspace IG account info
  const { data: userData } = useSWR(wsid ? `/api/workspaces/${wsid}/user` : null, fetcher)

  // Fetch all user workspaces for dropdown - cached to prevent flashing
  const { data: workspaces } = useSWR<Workspace[]>("/api/workspaces", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 60000, // Cache for 1 minute
  })

  const { data: statsData } = useSWR(
    wsid ? `/api/workspaces/${wsid}/stats` : null,
    fetcher,
    swrStaticConfig
  )

  const user1 = userData?.user;
  const stats = statsData?.stats || {
    dmsSent: 0,
    totalContacts: 0,
    totalAutomations: 0,
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  const handleWorkspaceSwitch = (workspaceId: string) => {
    setWorkspaceDropdownOpen(false)
    router.push(`/${workspaceId}/dashboard`)
  }

  const handleAddAccount = async () => {
    setConnecting(true)
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      const token = data.token

      const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`)
      const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_manage_insights&state=${token}`

      window.location.href = instagramAuthUrl
    } catch (error) {
      console.error("Error connecting Instagram:", error)
      setConnecting(false)
    }
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/${wsid}/dashboard`,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      description: "Overview & insights",

    },
    {
      label: "Automations",
      icon: MessageCircle,
      href: `/${wsid}/automations`,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      description: "Manage flows",
      badge: "Active",

    },

    {
      label: "Contacts",
      icon: Users,
      href: `/${wsid}/contacts`,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      description: "Conversations",

    },
    {
      label: "Settings",
      icon: Settings,
      href: `/${wsid}/settings`,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      description: "Manage workspace settings",
    },

  ]

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "pro":
        return "blue-400"
      case "elite":
        return "blue-400 "
      case "freeby":
      case "free":
      default:
        return "blue-400"
    }
  }
  const getPlanIcon = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "pro":
        return Crown
      case "ELITE":
        return Sparkles
      case "freeby":
      case "free":
      default:
        return Shield
    }
  }


  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header - Workspace Switcher */}
      <div className="border-b border-gray-200/60 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        {userData?.user ? (
          <DropdownMenu modal={false} open={workspaceDropdownOpen} onOpenChange={setWorkspaceDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors group">
                <img
                  src={userData.user.profilePictureUrl || "/placeholder.svg"}
                  alt={userData.user.username}
                  className="h-10 w-10 rounded-full object-cover border border-gray-300 flex-shrink-0"
                />
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{userData.user.username}</p>
                  <p className="text-xs text-gray-500 truncate">{userData.user.name}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces && workspaces.length > 0 ? (
                <>
                  {workspaces.map((workspace) => (
                    <WorkspaceDropdownItem
                      key={workspace._id}
                      workspace={workspace}
                      isActive={workspace._id === wsid}
                      onSelect={handleWorkspaceSwitch}
                    />
                  ))}
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuItem
                onClick={handleAddAccount}
                disabled={connecting}
                className="flex items-center gap-2 cursor-pointer text-blue-600 font-medium"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 text-black" />
                    <span className="text-black">Add New Account</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="text-sm text-gray-500">No IG account linked</p>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => {
                // ✅ Close mobile sheet when navigation link is clicked
                if (isMobile) {
                  setMobileOpen(false)
                }
              }}
              className={cn(
                "group flex items-center rounded-lg px-2 py-2.5 text-sm font-medium transition-all",
                pathname === route.href
                  ? `bg-gradient-to-r ${getPlanColor(user1?.plan || "free")} text-blue-700`
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <div
                className={cn(
                  "mr-2 p-1.5 rounded-md",
                  pathname === route.href
                    ? "bg-white/20"
                    : `${route.bgColor} group-hover:scale-110 transition-transform`,
                )}
              >
                <route.icon
                  className={cn("h-3.5 w-3.5", pathname === route.href ? "text-blue-500" : route.color)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate font-semibold text-sm">{route.label}</span>
                  {route.badge && (
                    <Badge
                      variant={pathname === route.href ? "secondary" : "outline"}
                      className="text-xs bg-white/20 border-white/30"
                    >
                      {route.badge}
                    </Badge>
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs mt-0.5 truncate",
                    pathname === route.href ? "text-blue-500" : "text-gray-500",
                  )}
                >
                  {route.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-gray-200/60 p-3 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
        {user && (
          <div className="space-y-3">
            {/* User Info */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-50 p-3 shadow-lg border">
              <div className="relative flex items-center gap-2">
                <div
                  className={cn(
                    "relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-r shadow-lg",
                    getPlanColor(user.plan),
                  )}
                >
                  {user.picture ? (
                    <img
                      src={user.picture || "/placeholder.svg"}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {React.createElement(getPlanIcon(user.plan), { className: "h-3 w-3 text-gray-600" })}
                    <span className="text-xs font-semibold text-gray-600">{user1.plan?.toUpperCase() || "FREE"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="rounded-lg bg-gradient-to-r from-white to-gray-50 p-3 shadow-lg border">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">Messages</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stats.dmsSent} / ∞
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-semibold text-gray-700">Contacts</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stats.totalContacts} / ∞
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span className="text-xs font-semibold text-gray-700">Automations</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stats.totalAutomations} / ∞
                  </Badge>
                </div>
              </div>
            </div>

            {/* Support + Logout Side by Side */}
            <div className="flex gap-2">
              {/* Support */}
              <Button
                variant="ghost"
                className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-900"
                asChild
              >
                <Link
                  href="https://www.instagram.com/direct/t/17845981776481974/"
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span className="font-medium text-xs">Support</span>
                </Link>
              </Button>

              {/* Logout */}
              <Button
                variant="ghost"
                className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-900"
                onClick={logout}
              >
                <LogOut className="h-3 w-3" />
                <span className="font-medium text-xs">Sign Out</span>
              </Button>
            </div>

          </div>
        )}
        {!user && (
          <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
            <Link href="/">Get Started</Link>
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex bg-white fixed inset-y-0 left-0 z-30 w-70">
        <SidebarContent isMobile={false} />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full shadow-md bg-white/80 backdrop-blur">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

// Separate component for each workspace to prevent SWR re-fetching on dropdown open
function WorkspaceDropdownItem({
  workspace,
  isActive,
  onSelect,
}: {
  workspace: Workspace
  isActive: boolean
  onSelect: (id: string) => void
}) {
  // Fetch once and cache - won't refetch when dropdown opens/closes
  const { data: workspaceUser } = useSWR(
    `/api/workspaces/${workspace._id}/user`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  const profileUrl = workspaceUser?.user?.profilePictureUrl || workspace.instagramAccounts?.[0]?.profilePictureUrl
  const username =
    workspaceUser?.user?.username || workspace.instagramAccounts?.[0]?.username || workspace.name

  return (
    <DropdownMenuItem onClick={() => onSelect(workspace._id)} className="flex items-center gap-3 cursor-pointer">
      {profileUrl ? (
        <img
          src={profileUrl}
          alt={username}
          className="h-8 w-8 rounded-full object-cover border border-gray-200"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border border-gray-200">
          <span className="text-sm font-bold text-purple-600">
            {(username || workspace.name).charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{username}</p>
        <p className="text-xs text-gray-500 truncate">
          {workspace.instagramAccounts?.length || 0} account{workspace.instagramAccounts?.length !== 1 ? "s" : ""}
        </p>
      </div>
      {isActive && <Check className="h-4 w-4 text-blue-600" />}
    </DropdownMenuItem>
  )
}

export default Sidebar

