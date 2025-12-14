"use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Instagram } from "lucide-react"
// import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog"
// import { ConnectInstagramCard } from "@/components/instaconnectformdiv"

// interface Workspace {
//   _id: string
//   name: string
//   description: string
//   createdAt: string
//   instagramAccounts: any[]
// }

// export default function SelectWorkspacePage() {
//   const [workspaces, setWorkspaces] = useState<Workspace[]>([])
//   const [loading, setLoading] = useState(true)
//   const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
//   const [connecting, setConnecting] = useState(false)
//   const router = useRouter()

//   useEffect(() => {
//     const fetchWorkspaces = async () => {
//       try {
//         const response = await fetch("/api/workspaces")
//         if (response.ok) {
//           const data = await response.json()
//           setWorkspaces(data)
//         } else {
//           router.push("/")
//         }
//       } catch (error) {
//         console.error("Error fetching workspaces:", error)
//         router.push("/")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchWorkspaces()
//   }, [router])

//   const handleWorkspaceCreated = (newWorkspace: Workspace) => {
//     setWorkspaces([...workspaces, newWorkspace])
//     setShowCreateWorkspace(false)
//     router.push(`/${newWorkspace._id}/dashboard`)
//   }

//   const handleWorkspaceSelect = (workspaceId: string) => {
//     router.push(`/${workspaceId}/dashboard`)
//   }

//   const handleInstagramConnect = async () => {
//     setConnecting(true)
//     try {
//       const res = await fetch("/api/auth/me")
//       const data = await res.json()
//       const token = data.token

//       const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`)
//       const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_manage_insights&state=${token}`

//       window.location.href = instagramAuthUrl
//     } catch (error) {
//       console.error("Error connecting Instagram:", error)
//       setConnecting(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
//           <p className="text-gray-600 text-sm">Loading workspaces...</p>
//         </div>
//       </div>
//     )
//   }

//   // 🔹 If no workspaces → show only the connect card
//   if (workspaces.length === 0) {
//     return (
//       <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
//         <div className="w-full max-w-2xl mx-auto">
//           <ConnectInstagramCard onConnect={handleInstagramConnect} connecting={connecting} />
//         </div>
//       </div>
//     )
//   }

//   // 🔹 Otherwise → show workspace list in table + connect button
//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Instagram Accounts</h1>
//             <p className="text-gray-600">Select an account to manage or connect a new Instagram account</p>
//           </div>
//           <Button
//             onClick={handleInstagramConnect}
//             disabled={connecting}
//             className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
//           >
//             {connecting ? "Connecting..." : "Add New Account"}
//           </Button>
//         </div>

//         <Table>
//           <TableCaption>Manage your connected Instagram workspaces</TableCaption>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[200px]">Name</TableHead>
//               <TableHead>Description</TableHead>
//               <TableHead>Created</TableHead>
//               <TableHead>Status</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {workspaces.map((workspace) => (
//               <TableRow
//                 key={workspace._id}
//                 className="cursor-pointer hover:bg-muted/50"
//                 onClick={() => handleWorkspaceSelect(workspace._id)}
//               >
//                 <TableCell className="font-medium flex items-center gap-2">
//                   <Instagram className="h-5 w-5 text-purple-600" />
//                   {workspace.name}
//                 </TableCell>
//                 <TableCell>{workspace.description || "Instagram automation workspace"}</TableCell>
//                 <TableCell>{new Date(workspace.createdAt).toLocaleDateString()}</TableCell>
//                 <TableCell className="text-green-600 font-medium">Connected</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>

//         <CreateWorkspaceDialog
//           open={showCreateWorkspace}
//           onOpenChange={setShowCreateWorkspace}
//           onWorkspaceCreated={handleWorkspaceCreated}
//         />
//       </div>
//     </div>
//   )
// }




import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Instagram } from "lucide-react"
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog"
import { ConnectInstagramCard } from "@/components/instaconnectformdiv"
import Image from "next/image";

interface Workspace {
  _id: string
  name: string
  description: string
  createdAt: string
  instagramAccounts: any[]
  profilePic?: string
}

export default function SelectWorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch("/api/workspaces", { 
          credentials: "include",
          // Add cache control for faster subsequent loads
          headers: {
            'Cache-Control': 'max-age=60' // Cache for 1 minute
          }
        })
        if (response.ok) {
          const data = await response.json()
          setWorkspaces(data)
          setError(null)
          // Cache in sessionStorage for instant loading on return visits
          sessionStorage.setItem('cached_workspaces', JSON.stringify(data))
          sessionStorage.setItem('cached_workspaces_time', Date.now().toString())
        } else if (response.status === 401) {
          // Not authenticated - check cookie and redirect
          console.warn("❌ 401 Unauthorized - Cookie might not be set yet")
          setError("Authentication failed. Redirecting to login...")
          setTimeout(() => router.push("/"), 1500)
        } else {
          console.error("Error fetching workspaces:", response.status)
          setError(`Failed to load workspaces (${response.status})`)
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error)
        setError("Network error. Please check your connection.")
      } finally {
        setLoading(false)
      }
    }

    // Try to load from cache first for instant display
    const cachedData = sessionStorage.getItem('cached_workspaces')
    const cacheTime = sessionStorage.getItem('cached_workspaces_time')
    
    if (cachedData && cacheTime) {
      const age = Date.now() - parseInt(cacheTime)
      // Use cache if less than 2 minutes old
      if (age < 2 * 60 * 1000) {
        setWorkspaces(JSON.parse(cachedData))
        setLoading(false)
        return // Skip API call, use cache
      }
    }

    fetchWorkspaces()
  }, [router])

  const handleWorkspaceCreated = (newWorkspace: Workspace) => {
    setWorkspaces([...workspaces, newWorkspace])
    setShowCreateWorkspace(false)
    router.push(`/${newWorkspace._id}/dashboard`)
  }

  const handleWorkspaceSelect = async (workspaceId: string) => {
    // Optimistically set workspace as valid to prevent redirect loop
    sessionStorage.setItem(`ws_valid_${workspaceId}`, Date.now().toString())
    router.push(`/${workspaceId}/dashboard`)
  }

  const handleInstagramConnect = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading workspaces...</p>
        </div>
      </div>
    )
  }

  // Show error if exists
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-medium mb-2">⚠️ Error</p>
            <p className="text-gray-700 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 🔹 If no workspaces → show only the connect card
  if (workspaces.length === 0) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-2xl mx-auto">
          <ConnectInstagramCard onConnect={handleInstagramConnect} connecting={connecting} />
        </div>
      </div>
    )
  }

  // 🔹 Otherwise → show workspace list in modern card layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl  mb-4 shadow-lg overflow-hidden">
              <Image
    src="/favicon.png" // ← your logo
    alt="ChatAutoDM Logo"
    width={64}          // 👈 required for optimization
    height={64}         // 👈 required for optimization
    className="object-contain rounded-xl"
    priority
  />
                  </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Workspace</h1>
          <p className="text-sm text-gray-500">Choose an account to continue</p>
        </div>

        {/* Workspace Cards */}
        <div className="space-y-3 mb-6">
          {workspaces.map((workspace) => {
            const profileUrl = workspace.instagramAccounts?.[0]?.profilePictureUrl
            
            return (
            <button
              key={workspace._id}
              onClick={() => handleWorkspaceSelect(workspace._id)}
              className="w-full group relative overflow-hidden bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 p-4 flex items-center gap-4 text-left"
            >
              {/* Hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              {/* Profile Picture */}
              <div className="relative z-10 flex-shrink-0">
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt={workspace.name}
                    className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                    <span className="text-xl font-bold text-purple-600">
                      {workspace.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Workspace Info */}
              <div className="relative z-10 flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                  {workspace.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {workspace.instagramAccounts?.length || 0} connected account{workspace.instagramAccounts?.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Arrow Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          )})}
        </div>

        {/* Add New Account Button */}
        <button
          onClick={handleInstagramConnect}
          disabled={connecting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
        >
          {connecting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Connecting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Account
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
