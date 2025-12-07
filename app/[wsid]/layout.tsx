// "use client"

// import { Sidebar } from "@/components/Sidebar"
// import { useParams, useRouter } from "next/navigation"
// import { useEffect, useState } from "react"
// import useSWR from "swr"

// const fetcher = async (url: string) => {
//   const res = await fetch(url, { credentials: "include" })
//   if (!res.ok) throw new Error("Failed to fetch")
//   return res.json()
// }

// export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
//   const params = useParams()
//   const router = useRouter()
//   const wsid = params.wsid as string
  
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)

//   // ✅ Single auth check for the entire workspace section
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch("/api/auth/me", { credentials: "include" })
//         if (response.ok) {
//           setIsAuthenticated(true)
//         } else {
//           router.replace("/")
//         }
//       } catch (error) {
//         console.error("Auth check failed:", error)
//         router.replace("/")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     checkAuth()
//   }, [router])

//   // ✅ Pre-fetch shared data once at layout level (SWR will cache it)
//   useSWR(wsid && isAuthenticated ? `/api/auth/me` : null, fetcher, {
//     revalidateOnFocus: false,
//     dedupingInterval: 60000, // Cache for 60s
//   })

//   // ✅ Check workspace ownership (prevents unauthorized access to shared links)
//   const { data: userData, error: userError } = useSWR(
//     wsid && isAuthenticated ? `/api/workspaces/${wsid}/user` : null,
//     fetcher,
//     {
//       revalidateOnFocus: false,
//       dedupingInterval: 30000, // Cache for 30s
//       shouldRetryOnError: true,
//       errorRetryCount: 2,
//     }
//   )

//   useSWR(wsid && isAuthenticated ? `/api/workspaces/${wsid}/stats` : null, fetcher, {
//     refreshInterval: 10000, // Auto-refresh every 10s
//     dedupingInterval: 5000,
//   })

//   // ✅ Redirect if user doesn't own this workspace
//   useEffect(() => {
//     if (!isAuthenticated) return
//     if (!userData && !userError) return // Still loading

//     if (userError || userData?.success === false) {
//       console.warn("❌ Not authorized for this workspace:", wsid)
//       router.replace("/select-workspace")
//     }
//   }, [userData, userError, isAuthenticated, wsid, router])

//   // ✅ Loading state (wait for both auth AND ownership check)
//   if (isLoading || (!userData && !userError && isAuthenticated)) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
//         <div className="text-center">
//           <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
//           <p className="text-gray-600 text-sm">Loading workspace...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!isAuthenticated) return null

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* ✅ Sidebar rendered ONCE at layout level */}
//       <Sidebar />
      
//       {/* ✅ Page content with proper margin for sidebar */}
//       <main className="flex-1 md:ml-64">
//         {children}
//       </main>
//     </div>
//   )
// }


"use client"

import { Sidebar } from "@/components/Sidebar"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" })
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const wsid = params.wsid as string
  const router = useRouter()

  // 1) AUTH CHECK — runs first
  const {
    data: authUser,
    error: authError,
    isLoading: authLoading,
  } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    // Retry on temporary failures
    shouldRetryOnError: true,
    errorRetryCount: 2,
    errorRetryInterval: 500,
  })

  const authenticated = !!authUser && !authError

  // 2) WORKSPACE OWNERSHIP CHECK — runs only AFTER auth succeeds
  const {
    data: wsAccess,
    error: wsError,
    isLoading: wsLoading,
  } = useSWR(
    authenticated ? `/api/workspaces/${wsid}/user` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      // ⚠️ Retry on error to handle temporary network issues
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onSuccess: (data) => {
        console.log("✅ [LAYOUT] Workspace access check success:", data)
      },
      onError: (err) => {
        console.log("❌ [LAYOUT] Workspace access check error:", err)
      },
    }
  )
  
  console.log("[LAYOUT] Current state:", { wsid, authenticated, wsLoading, wsError, wsAccess })

  // === REDIRECT LOGIC ===
  //  Run this in render instead of effects to avoid race conditions.
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (authError || !authenticated) {
    router.replace("/") 
    return null
  }

  // ⚠️ CRITICAL: Wait for workspace check to complete before deciding
  // Don't redirect while still loading - this prevents race conditions
  if (wsLoading || (!wsAccess && !wsError)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading workspace...</p>
      </div>
    )
  }

  // Only redirect if we have a definitive error or explicit failure
  if (wsError || (wsAccess && wsAccess.success === false)) {
    console.log("❌ [LAYOUT] Redirecting to select-workspace due to:", { wsError, wsAccess })
    router.replace("/select-workspace")
    return null
  }

  // === AUTH + WORKSPACE VERIFIED, SHOW DASHBOARD ===
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  )
}
