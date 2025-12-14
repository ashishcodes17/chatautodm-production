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
import { useEffect, useRef } from "react"
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
  const hasRedirected = useRef(false) // Prevent multiple redirects

  // 1) AUTH CHECK — runs first
  const {
    data: authUser,
    error: authError,
    isLoading: authLoading,
  } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 120000, // 2 minutes - reduce duplicate calls
    shouldRetryOnError: true,
    errorRetryCount: 1, // Only retry once for faster failure
    errorRetryInterval: 300, // Shorter retry interval (300ms)
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
      revalidateOnReconnect: false,
      dedupingInterval: 120000, // 2 minutes for consistency
      shouldRetryOnError: false, // Don't retry on 403 - it won't change
      errorRetryCount: 1,
      errorRetryInterval: 300,
      onSuccess: (data) => {
        console.log("✅ [LAYOUT] Workspace access check success:", data)
        // Cache valid workspace access in sessionStorage
        if (data?.success) {
          sessionStorage.setItem(`ws_valid_${wsid}`, Date.now().toString())
        } else {
          // Clear invalid cache
          sessionStorage.removeItem(`ws_valid_${wsid}`)
        }
      },
      onError: (err) => {
        console.log("❌ [LAYOUT] Workspace access check error:", err)
        sessionStorage.removeItem(`ws_valid_${wsid}`)
      },
    }
  )
  
  // Check sessionStorage for optimistic validation
  const cachedValid = sessionStorage.getItem(`ws_valid_${wsid}`)
  const cacheAge = cachedValid ? Date.now() - parseInt(cachedValid) : Infinity
  const isCachedValid = cacheAge < 2 * 60 * 1000 // 2 minute cache (reduced for security)

  console.log("[LAYOUT] Current state:", { wsid, authenticated, wsLoading, wsError, wsAccess, isCachedValid, cacheAge })
  
  // === REDIRECT LOGIC IN useEffect TO AVOID RACE CONDITIONS ===
  useEffect(() => {
    if (hasRedirected.current) return // Already redirected
    
    // If we have valid cache, don't redirect while loading
    if (isCachedValid && wsLoading) {
      console.log("⏳ [LAYOUT] Using cached validation, waiting for confirmation...")
      return
    }
    
    // Only redirect when we have definitive data (not loading)
    if (wsLoading) return
    if (!wsAccess && !wsError) return // Still waiting for data
    
    // Redirect on explicit failure (but give cache a chance during initial load)
    if (wsAccess?.success === false) {
      console.log("❌ [LAYOUT] Redirecting to select-workspace - user doesn't own workspace", wsAccess)
      sessionStorage.removeItem(`ws_valid_${wsid}`) // Clear bad cache
      hasRedirected.current = true
      router.replace("/select-workspace")
    }
    
    // Also redirect on persistent errors
    if (wsError && !isCachedValid) {
      console.log("❌ [LAYOUT] Redirecting due to error:", wsError)
      sessionStorage.removeItem(`ws_valid_${wsid}`)
      hasRedirected.current = true
      router.replace("/select-workspace")
    }
  }, [wsLoading, wsAccess, wsError, router, isCachedValid, wsid])

  if (authError || !authenticated) {
    return null
  }

  // ⚠️ CRITICAL: Wait for workspace check UNLESS we have valid cache
  if ((wsLoading || (!wsAccess && !wsError)) && !isCachedValid) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading workspace...</p>
        </div>
      </div>
    )
  }

  // If we have an error but valid cache, continue rendering
  if (wsError) {
    const cachedValid = sessionStorage.getItem(`ws_valid_${wsid}`)
    const cacheTime = cachedValid ? parseInt(cachedValid) : 0
    const isCacheValid = Date.now() - cacheTime < 5 * 60 * 1000 // 5 minutes
    
    if (!isCacheValid) {
      console.log("❌ [LAYOUT] Error and no valid cache - showing error state")
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Unable to load workspace. Please try again.</p>
            <button 
              onClick={() => router.replace("/select-workspace")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Workspaces
            </button>
          </div>
        </div>
      )
    } else {
      console.log("⚠️ [LAYOUT] Using cached workspace validation due to temporary error")
    }
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
