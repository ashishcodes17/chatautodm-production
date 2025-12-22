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



"use client"

import React from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ConnectInstagramCard } from "@/components/instaconnectformdiv"

/* ---------------------------------- */
/* Utils */
/* ---------------------------------- */

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("Fetch failed")
    return res.json()
  })

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

interface Workspace {
  _id: string
  name: string
  instagramAccounts: any[]
}

/* ---------------------------------- */
/* Page */
/* ---------------------------------- */

export default function SelectWorkspacePage() {
  const router = useRouter()

  const {
    data: workspaces,
    isLoading,
    error,
  } = useSWR<Workspace[]>("/api/workspaces", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
      </div>
    )
  }

  /* ---------- Error ---------- */
  if (error) {
    router.push("/")
    return null
  }

  /* ---------- No workspaces ---------- */
  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-6">
        <div className="w-full max-w-2xl">
          <ConnectInstagramCard />
        </div>
      </div>
    )
  }

  /* ---------- Main UI ---------- */
  return (
    <div className="relative min-h-screen overflow-hidden bg-white flex items-center justify-center px-4 py-16">

      {/* Background glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-pink-300/20 blur-3xl" />

      <div className="relative w-full max-w-md">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <Image
              src="/favicon.png"
              alt="ChatAutoDM"
              width={40}
              height={40}
              priority
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Select Workspace
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Choose the Instagram account you want to manage
          </p>
        </div>

        {/* Workspace list */}
        <div className="space-y-4 mb-8">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace._id}
              workspace={workspace}
              onSelect={() => router.push(`/${workspace._id}/dashboard`)}
            />
          ))}
        </div>

        {/* Add account */}
        <AddAccountButton />
      </div>
    </div>
  )
}

/* ---------------------------------- */
/* Workspace Card */
/* ---------------------------------- */

function WorkspaceCard({
  workspace,
  onSelect,
}: {
  workspace: Workspace
  onSelect: () => void
}) {
  const { data } = useSWR(
    `/api/workspaces/${workspace._id}/user`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300_000,
    }
  )

  const profileUrl =
    data?.user?.profilePictureUrl ||
    workspace.instagramAccounts?.[0]?.profilePictureUrl

  const username = data?.user?.username || workspace.name

  return (
    <button
      onClick={onSelect}
      className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300"
    >
      {/* Hover overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" /> */}

      <div className="relative z-10 flex items-center gap-4">

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {profileUrl ? (
            <img
              src={profileUrl}
              alt={username}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-md transition-transform duration-300"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 ring-2 ring-white shadow-md">
              <span className="text-xl font-bold text-purple-600">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Online indicator */}
          {/* <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" /> */}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-gray-900 transition-colors">
            {username}
          </h3>
          {/* <p className="mt-0.5 text-sm text-gray-500">
            {workspace.instagramAccounts?.length || 0} connected account
            {workspace.instagramAccounts?.length !== 1 ? "s" : ""}
          </p> */}
        </div>

        {/* Arrow */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all group-hover:bg-gray-200 group-hover:text-gray-600">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}

/* ---------------------------------- */
/* Add Account Button */
/* ---------------------------------- */

function AddAccountButton() {
  const [connecting, setConnecting] = React.useState(false)

  const connect = async () => {
    try {
      setConnecting(true)
      const res = await fetch("/api/auth/me")
      const data = await res.json()

      const redirectUri = encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`
      )

      window.location.href =
        `https://www.instagram.com/oauth/authorize` +
        `?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_manage_insights` +
        `&state=${data.token}`
    } catch {
      setConnecting(false)
    }
  }
  return (
    <Button
      onClick={connect}
      disabled={connecting}
      className="
    w-full rounded-2xl bg-gray-900
    py-4 text-sm font-semibold text-white
    shadow-lg
    transition-transform transition-shadow duration-150
    hover:bg-gray-900 hover:text-white
    hover:shadow-xl
    active:scale-[0.98]
    disabled:opacity-70
  "
    >
      <span className="flex items-center justify-center gap-2">
        {connecting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
            Connecting…
          </>
        ) : (
          <>
            Add New Account
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </>
        )}
      </span>
    </Button>

  )
}
