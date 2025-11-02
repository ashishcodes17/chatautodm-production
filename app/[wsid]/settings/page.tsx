"use client"

// import { useEffect, useState } from "react"
// import { useRouter, useParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Sidebar } from "@/components/Sidebar"
// import { Separator } from "@/components/ui/separator"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
// import {
//   Instagram,
//   Trash2,
//   RefreshCw,
//   User,
//   Shield,
//   Bell,
//   Palette,
//   ExternalLink,
//   CheckCircle,
//   AlertTriangle,
// } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"

// interface InstagramAccount {
//   _id: string
//   username: string
//   instagramUserId: string
//   profilePictureUrl?: string
//   followersCount: number
//   isConnected: boolean
//   tokenExpiresAt: string
//   createdAt: string
// }

// interface Workspace {
//   _id: string
//   name: string
//   userId: string
//   createdAt: string
// }

// export default function SettingsPage() {
//   const [workspace, setWorkspace] = useState<Workspace | null>(null)
//   const [instagramAccount, setInstagramAccount] = useState<InstagramAccount | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [relinking, setRelinking] = useState(false)
//   const [deleting, setDeleting] = useState(false)
//   const router = useRouter()
//   const params = useParams()
//   const wsid = params.wsid as string
//   const { toast } = useToast()

//   useEffect(() => {
//     fetchWorkspaceData()
//   }, [wsid])

//   const fetchWorkspaceData = async () => {
//     try {
//       const [workspaceRes, accountRes] = await Promise.all([
//         fetch(`/api/workspaces/${wsid}`),
//         fetch(`/api/workspaces/${wsid}/instagram-accounts`),
//       ])

//       if (workspaceRes.ok) {
//         const workspaceData = await workspaceRes.json()
//         setWorkspace(workspaceData.workspace)
//       }

//       if (accountRes.ok) {
//         const accountData = await accountRes.json()
//         if (accountData.length > 0) {
//           setInstagramAccount(accountData[0])
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching workspace data:", error)
//       toast({
//         title: "Error",
//         description: "Failed to load workspace settings",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleRelinkInstagram = async () => {
//     setRelinking(true)
//     try {
//       const res = await fetch("/api/auth/me")
//       if (!res.ok) throw new Error("Failed to fetch auth")
//       const data = await res.json()
//       const token = data.token

//       const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`)
//       const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_manage_insights&state=${token}`

//       window.location.href = instagramAuthUrl
//     } catch (error) {
//       console.error("Error relinking Instagram:", error)
//       toast({
//         title: "Error",
//         description: "Failed to relink Instagram account",
//         variant: "destructive",
//       })
//       setRelinking(false)
//     }
//   }

//   const handleDeleteAccount = async () => {
//     setDeleting(true)
//     try {
//       const response = await fetch(`/api/workspaces/${wsid}`, {
//         method: "DELETE",
//       })

//       if (response.ok) {
//         toast({
//           title: "Success",
//           description: "Account deleted successfully",
//         })
//         router.push("/select-workspace")
//       } else {
//         throw new Error("Failed to delete account")
//       }
//     } catch (error) {
//       console.error("Error deleting account:", error)
//       toast({
//         title: "Error",
//         description: "Failed to delete account",
//         variant: "destructive",
//       })
//     } finally {
//       setDeleting(false)
//     }
//   }

//   const isTokenExpiringSoon = instagramAccount?.tokenExpiresAt
//     ? new Date(instagramAccount.tokenExpiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//     : false

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
//           <p className="text-gray-600 text-sm">Loading settings...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50/50 p-6">
//       <Sidebar/>
//       <div className="max-w-4xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
//             <p className="text-gray-600 mt-1">Manage your workspace and Instagram account settings</p>
//           </div>
//           <Badge variant="outline" className="text-sm">
//             Workspace: {workspace?.name}
//           </Badge>
//         </div>

//         {/* Instagram Account Section */}
//         <Card className="border-0 shadow-sm">
//           <CardHeader className="pb-4">
//             <div className="flex items-center space-x-2">
//               <Instagram className="h-5 w-5 text-pink-600" />
//               <CardTitle className="text-xl">Instagram Account</CardTitle>
//             </div>
//             <CardDescription>Manage your connected Instagram business account</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {instagramAccount ? (
//               <>
//                 {/* Account Info */}
//                 {/*
//                 <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
//                   <img
//                     src={instagramAccount.profilePictureUrl || "/placeholder.svg?height=60&width=60"}
//                     alt={instagramAccount.username}
//                     className="w-15 h-15 rounded-full border-2 border-white shadow-sm"
//                   />
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-2">
//                       <h3 className="font-semibold text-lg">@{instagramAccount.username}</h3>
//                       {instagramAccount.isConnected ? (
//                         <Badge className="bg-green-100 text-green-800 border-green-200">
//                           <CheckCircle className="w-3 h-3 mr-1" />
//                           Connected
//                         </Badge>
//                       ) : (
//                         <Badge variant="destructive">
//                           <AlertTriangle className="w-3 h-3 mr-1" />
//                           Disconnected
//                         </Badge>
//                       )}
//                     </div>
//                     <p className="text-gray-600 text-sm">
//                       {instagramAccount.followersCount?.toLocaleString() || 0} followers
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Connected on {new Date(instagramAccount.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//                 */}

//                 {/* Token Status */}
//                 {isTokenExpiringSoon && (
//                   <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
//                     <div className="flex items-center space-x-2">
//                       <AlertTriangle className="h-4 w-4 text-amber-600" />
//                       <p className="text-sm text-amber-800">
//                         Your Instagram token expires soon. Relink your account to continue using all features.
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex space-x-3">
//                   <Button
//                     onClick={handleRelinkInstagram}
//                     disabled={relinking}
//                     variant="outline"
//                     className="flex-1 bg-transparent"
//                   >
//                     {relinking ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
//                         Relinking...
//                       </>
//                     ) : (
//                       <>
//                         <RefreshCw className="w-4 h-4 mr-2" />
//                         Relink Instagram
//                       </>
//                     )}
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={() => window.open(`https://instagram.com/${instagramAccount.username}`, "_blank")}
//                   >
//                     <ExternalLink className="w-4 h-4 mr-2" />
//                     View Profile
//                   </Button>
//                 </div>
//               </>
//             ) : (
//               <div className="text-center py-8">
//                 <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold mb-2">No Instagram Account Connected</h3>
//                 <p className="text-gray-600 mb-4">
//                   Connect your Instagram business account to start using automation features.
//                 </p>
//                 <Button onClick={handleRelinkInstagram} disabled={relinking}>
//                   {relinking ? "Connecting..." : "Connect Instagram Account"}
//                 </Button>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Account Management Section */}
//         <Card className="border-0 shadow-sm">
//           <CardHeader className="pb-4">
//             <div className="flex items-center space-x-2">
//               <User className="h-5 w-5 text-blue-600" />
//               <CardTitle className="text-xl">Account Management</CardTitle>
//             </div>
//             <CardDescription>Manage your workspace and account settings</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Workspace Info */}
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <h4 className="font-medium mb-2">Workspace Information</h4>
//               <div className="space-y-1 text-sm text-gray-600">
//                 <p>
//                   <span className="font-medium">Name:</span> {workspace?.name}
//                 </p>
//                 <p>
//                   <span className="font-medium">Created:</span>{" "}
//                   {workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : "N/A"}
//                 </p>
//                 <p>
//                   <span className="font-medium">Workspace ID:</span> {workspace?._id}
//                 </p>
//               </div>
//             </div>

//             <Separator />

//             {/* Danger Zone */}
//             <div className="space-y-4">
//               <div className="flex items-center space-x-2">
//                 <Shield className="h-5 w-5 text-red-600" />
//                 <h4 className="font-medium text-red-900">Danger Zone</h4>
//               </div>

//               <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
//                 <h5 className="font-medium text-red-900 mb-2">Delete Account</h5>
//                 <p className="text-sm text-red-700 mb-4">
//                   Permanently delete this workspace and all associated data. This action cannot be undone.
//                 </p>

//                 <AlertDialog>
//                   <AlertDialogTrigger asChild>
//                     <Button variant="destructive" size="sm">
//                       <Trash2 className="w-4 h-4 mr-2" />
//                       Delete Account
//                     </Button>
//                   </AlertDialogTrigger>
//                   <AlertDialogContent>
//                     <AlertDialogHeader>
//                       <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                       <AlertDialogDescription>
//                         This will permanently delete your workspace "{workspace?.name}" and all associated data
//                         including:
//                         <ul className="list-disc list-inside mt-2 space-y-1">
//                           <li>All automation flows</li>
//                           <li>Contact information</li>
//                           <li>Message history</li>
//                           <li>Instagram account connection</li>
//                         </ul>
//                         <br />
//                         <strong>This action cannot be undone.</strong>
//                       </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                       <AlertDialogCancel>Cancel</AlertDialogCancel>
//                       <AlertDialogAction
//                         onClick={handleDeleteAccount}
//                         disabled={deleting}
//                         className="bg-red-600 hover:bg-red-700"
//                       >
//                         {deleting ? "Deleting..." : "Yes, delete account"}
//                       </AlertDialogAction>
//                     </AlertDialogFooter>
//                   </AlertDialogContent>
//                 </AlertDialog>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Additional Settings Sections */}
//         <div className="grid md:grid-cols-2 gap-6">
//           {/* Notifications */}
//           <Card className="border-0 shadow-sm">
//             <CardHeader className="pb-4">
//               <div className="flex items-center space-x-2">
//                 <Bell className="h-5 w-5 text-yellow-600" />
//                 <CardTitle className="text-lg">Notifications</CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm text-gray-600 mb-4">
//                 Notification preferences will be available in a future update.
//               </p>
//               <Button variant="outline" disabled>
//                 <Bell className="w-4 h-4 mr-2" />
//                 Configure Notifications
//               </Button>
//             </CardContent>
//           </Card>

//           {/* Appearance */}
//           <Card className="border-0 shadow-sm">
//             <CardHeader className="pb-4">
//               <div className="flex items-center space-x-2">
//                 <Palette className="h-5 w-5 text-purple-600" />
//                 <CardTitle className="text-lg">Appearance</CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm text-gray-600 mb-4">
//                 Theme and appearance settings will be available in a future update.
//               </p>
//               <Button variant="outline" disabled>
//                 <Palette className="w-4 h-4 mr-2" />
//                 Customize Theme
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )

// }
// "use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Instagram,
  Trash2,
  RefreshCw,
  User,
  Shield,
  Bell,
  Palette,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InstagramAccount {
  _id: string
  username: string
  instagramUserId: string
  profilePictureUrl?: string
  followersCount: number
  isConnected: boolean
  tokenExpiresAt: string
  createdAt: string
}

interface Workspace {
  _id: string
  name: string
  userId: string
  createdAt: string
}

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [instagramAccount, setInstagramAccount] = useState<InstagramAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [relinking, setRelinking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const wsid = params.wsid as string
  const { toast } = useToast()

  useEffect(() => {
    fetchWorkspaceData()
  }, [wsid])

  const fetchWorkspaceData = async () => {
    try {
      const [workspaceRes, accountRes] = await Promise.all([
        fetch(`/api/workspaces/${wsid}`),
        fetch(`/api/workspaces/${wsid}/instagram-accounts`),
      ])

      if (workspaceRes.ok) {
        const workspaceData = await workspaceRes.json()
        setWorkspace(workspaceData.workspace)
      }

      if (accountRes.ok) {
        const accountData = await accountRes.json()
        if (accountData.length > 0) {
          setInstagramAccount(accountData[0])
        }
      }
    } catch (error) {
      console.error("Error fetching workspace data:", error)
      toast({
        title: "Error",
        description: "Failed to load workspace settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRelinkInstagram = async () => {
    setRelinking(true)
    try {
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Failed to fetch auth")
      const data = await res.json()
      const token = data.token

      const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`)
      const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_manage_insights&state=${token}`

      window.location.href = instagramAuthUrl
    } catch (error) {
      console.error("Error relinking Instagram:", error)
      toast({
        title: "Error",
        description: "Failed to relink Instagram account",
        variant: "destructive",
      })
      setRelinking(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/workspaces/${wsid}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Account deleted successfully",
        })
        router.push("/select-workspace")
      } else {
        throw new Error("Failed to delete account")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const isTokenExpiringSoon = instagramAccount?.tokenExpiresAt
    ? new Date(instagramAccount.tokenExpiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : false

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="p-4 md:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Manage your workspace and Instagram account settings</p>
          </div>
          <Badge variant="outline" className="text-xs md:text-sm w-fit">
            Workspace: {workspace?.name}
          </Badge>
        </div>

        {/* Instagram Account Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 px-4 md:px-6">
            <div className="flex items-center space-x-2">
              <Instagram className="h-4 w-4 md:h-5 md:w-5 text-pink-600" />
              <CardTitle className="text-lg md:text-xl">Instagram Account</CardTitle>
            </div>
            <CardDescription className="text-sm">Manage your connected Instagram business account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">{instagramAccount ? (
              <>
                {/* Account Info */}
                {/*
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={instagramAccount.profilePictureUrl || "/placeholder.svg?height=60&width=60"}
                    alt={instagramAccount.username}
                    className="w-15 h-15 rounded-full border-2 border-white shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">@{instagramAccount.username}</h3>
                      {instagramAccount.isConnected ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Disconnected
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {instagramAccount.followersCount?.toLocaleString() || 0} followers
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Connected on {new Date(instagramAccount.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                */}

                {/* Token Status */}
                {isTokenExpiringSoon && (
                  <div className="p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start md:items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5 md:mt-0" />
                      <p className="text-xs md:text-sm text-amber-800">
                        Your Instagram token expires soon. Relink your account to continue using all features.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleRelinkInstagram}
                    disabled={relinking}
                    variant="outline"
                    className="flex-1 bg-transparent w-full sm:w-auto"
                  >
                    {relinking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Relinking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Relink Instagram
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => window.open(`https://instagram.com/${instagramAccount.username}`, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 md:py-8">
                <Instagram className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">No Instagram Account Connected</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 px-4">
                  Connect your Instagram business account to start using automation features.
                </p>
                <Button onClick={handleRelinkInstagram} disabled={relinking} className="w-full sm:w-auto">
                  {relinking ? "Connecting..." : "Connect Instagram Account"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Management Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 px-4 md:px-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              <CardTitle className="text-lg md:text-xl">Account Management</CardTitle>
            </div>
            <CardDescription className="text-sm">Manage your workspace and account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">{/* Workspace Info */}
            <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2 text-sm md:text-base">Workspace Information</h4>
              <div className="space-y-1 text-xs md:text-sm text-gray-600">
                <p className="break-words">
                  <span className="font-medium">Name:</span> {workspace?.name}
                </p>
                <p>
                  <span className="font-medium">Created:</span>{" "}
                  {workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : "N/A"}
                </p>
                <p className="break-all">
                  <span className="font-medium">Workspace ID:</span> {workspace?._id}
                </p>
              </div>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                <h4 className="font-medium text-red-900 text-sm md:text-base">Danger Zone</h4>
              </div>

              <div className="p-3 md:p-4 border border-red-200 bg-red-50 rounded-lg">
                <h5 className="font-medium text-red-900 mb-2 text-sm md:text-base">Delete Account</h5>
                <p className="text-xs md:text-sm text-red-700 mb-4">
                  Permanently delete this workspace and all associated data. This action cannot be undone.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[95vw] sm:max-w-lg mx-4">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base md:text-lg">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs md:text-sm">
                        This will permanently delete your workspace "{workspace?.name}" and all associated data
                        including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All automation flows</li>
                          <li>Contact information</li>
                          <li>Message history</li>
                          <li>Instagram account connection</li>
                        </ul>
                        <br />
                        <strong>This action cannot be undone.</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto m-0">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 w-full sm:w-auto m-0"
                      >
                        {deleting ? "Deleting..." : "Yes, delete account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Notifications */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4 px-4 md:px-6">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                <CardTitle className="text-base md:text-lg">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <p className="text-xs md:text-sm text-gray-600 mb-4">
                Notification preferences will be available in a future update.
              </p>
              <Button variant="outline" disabled className="w-full sm:w-auto">
                <Bell className="w-4 h-4 mr-2" />
                Configure Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4 px-4 md:px-6">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                <CardTitle className="text-base md:text-lg">Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <p className="text-xs md:text-sm text-gray-600 mb-4">
                Theme and appearance settings will be available in a future update.
              </p>
              <Button variant="outline" disabled className="w-full sm:w-auto">
                <Palette className="w-4 h-4 mr-2" />
                Customize Theme
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )

}

