"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Users, Search, Download, Trash2, Eye } from "lucide-react"

interface Contact {
  _id: string
  senderId: string
  senderUsername?: string
  firstInteraction: string
  lastInteraction: string
  lastInteractionType: string
  lastAutomationName?: string
  totalInteractions: number
  interactionHistory: Array<{
    type: string
    automationName?: string
    timestamp: string
  }>
}

interface ContactStats {
  totalContacts: number
  totalInteractions: number
  avgInteractions: number
}

interface ContactsResponse {
  contacts: Contact[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: ContactStats
  instagramUserId: string
}

export default function ContactsPage() {
  const params = useParams()
  const wsid = params.wsid as string
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats>({ totalContacts: 0, totalInteractions: 0, avgInteractions: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("lastInteraction")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [instagramUserId, setInstagramUserId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch workspace info to get Instagram user ID
    const fetchWorkspaceInfo = async () => {
      try {
        const response = await fetch(`/api/workspaces/${wsid}`)
        if (response.ok) {
          const data = await response.json()
          if (data.igAccount && data.igAccount.instagramUserId) {
            setInstagramUserId(data.igAccount.instagramUserId)
          } else {
            setError("Instagram account not connected. Please connect your Instagram account first.")
          }
        } else {
          console.error("Failed to fetch workspace info:", response.status)
          setError("Instagram account not connected. Please connect your Instagram account first.")
        }
      } catch (error) {
        console.error("Error fetching workspace info:", error)
        setError("Failed to load workspace information")
      }
    }

    fetchWorkspaceInfo()
  }, [wsid])

  const fetchContacts = async () => {
    if (!instagramUserId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const searchParamsObj = new URLSearchParams({
        instagramUserId,
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/workspaces/${wsid}/contacts?${searchParamsObj}`)
      if (response.ok) {
        const data: ContactsResponse = await response.json()
        setContacts(data.contacts)
        setStats(data.stats)
        setPagination(data.pagination)
        setError(null)
      } else {
        console.error("Failed to fetch contacts:", response.status)
        setError("Failed to load contacts")
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      setError("Failed to load contacts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (instagramUserId) {
      fetchContacts()
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, instagramUserId])

  const handleExport = async (format: "json" | "csv") => {
    try {
      const response = await fetch(`/api/workspaces/${wsid}/contacts/export?format=${format}`)

      if (format === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `contacts-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting contacts:", error)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    try {
      const response = await fetch(
        `/api/workspaces/${wsid}/contacts?contactId=${contactId}&instagramUserId=${instagramUserId}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        fetchContacts()
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInteractionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      dm_sent: "bg-blue-100 text-blue-800",
      dm_received: "bg-green-100 text-green-800",
      comment: "bg-purple-100 text-purple-800",
      story_reply: "bg-pink-100 text-pink-800",
      postback: "bg-orange-100 text-orange-800",
      quick_reply: "bg-yellow-100 text-yellow-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
        <Sidebar />
      

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading / Error State */}
          {error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-2 text-sm sm:text-base">{error}</div>
              <Button
                onClick={() => {
                  setError(null)
                  window.location.reload()
                }}
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-10 text-gray-500 text-sm sm:text-base">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm sm:text-base">No contacts found.</div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contacts</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your Instagram automation contacts</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => handleExport("csv")} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Export </span>CSV
                  </Button>
                  <Button
                    onClick={() => handleExport("json")}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Export </span>JSON
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastInteraction">Last Interaction</SelectItem>
                    <SelectItem value="firstInteraction">First Interaction</SelectItem>
                    <SelectItem value="totalInteractions">Total Interactions</SelectItem>
                    <SelectItem value="senderUsername">Username</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Contact
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Interaction
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Interactions
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                          Last Active
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                          Automation
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {contacts.map((contact) => (
                        <tr key={contact._id} className="hover:bg-gray-50 transition">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
                              <span className="truncate max-w-[120px] sm:max-w-none">
                                {contact.senderUsername || contact.senderId}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <Badge className={`${getInteractionTypeColor(contact.lastInteractionType)} text-xs`}>
                              {contact.lastInteractionType.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-600">{contact.totalInteractions}</td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                            {formatDate(contact.lastInteraction)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                            <span className="truncate max-w-[120px] block">{contact.lastAutomationName || "N/A"}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right text-sm font-medium">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setSelectedContact(contact)}>
                                    <Eye className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-base sm:text-lg">Contact Details</DialogTitle>
                                    <DialogDescription className="text-sm">
                                      Interaction history for {contact.senderUsername || contact.senderId}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedContact && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Username</label>
                                          <p className="text-sm text-gray-500 break-all">
                                            {selectedContact.senderUsername || "N/A"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Sender ID</label>
                                          <p className="text-sm text-gray-500 font-mono break-all">
                                            {selectedContact.senderId}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">First Interaction</label>
                                          <p className="text-sm text-gray-500">
                                            {formatDate(selectedContact.firstInteraction)}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Total Interactions</label>
                                          <p className="text-sm text-gray-500">{selectedContact.totalInteractions}</p>
                                        </div>
                                      </div>

                                      <Separator />

                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Interaction History</label>
                                        <ScrollArea className="h-[250px] sm:h-[300px] w-full border rounded-md p-4">
                                          <div className="space-y-3">
                                            {selectedContact.interactionHistory?.map((interaction, index) => (
                                              <div
                                                key={index}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-gray-50 rounded gap-2"
                                              >
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <Badge
                                                    className={`${getInteractionTypeColor(interaction.type)} text-xs`}
                                                  >
                                                    {interaction.type.replace("_", " ")}
                                                  </Badge>
                                                  {interaction.automationName && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {interaction.automationName}
                                                    </Badge>
                                                  )}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                  {formatDate(interaction.timestamp)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </ScrollArea>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact._id)}>
                                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="grid md:hidden gap-4">
                {contacts.map((contact) => (
                  <div key={contact._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <h2 className="font-semibold text-gray-900 truncate">
                          {contact.senderUsername || contact.senderId}
                        </h2>
                      </div>
                      <Badge className={`${getInteractionTypeColor(contact.lastInteractionType)} text-xs`}>
                        {contact.lastInteractionType.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Interactions:</span>
                        <span>{contact.totalInteractions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Last Active:</span>
                        <span>{formatDate(contact.lastInteraction)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Automation:</span>
                        <span className="truncate max-w-[120px]">{contact.lastAutomationName || "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedContact(contact)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">Contact Details</DialogTitle>
                            <DialogDescription className="text-sm">
                              Interaction history for {contact.senderUsername || contact.senderId}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedContact && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Username</label>
                                  <p className="text-sm text-gray-500 break-all">
                                    {selectedContact.senderUsername || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Sender ID</label>
                                  <p className="text-sm text-gray-500 font-mono break-all">
                                    {selectedContact.senderId}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">First Interaction</label>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(selectedContact.firstInteraction)}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Total Interactions</label>
                                  <p className="text-sm text-gray-500">{selectedContact.totalInteractions}</p>
                                </div>
                              </div>

                              <Separator />

                              <div>
                                <label className="text-sm font-medium mb-2 block">Interaction History</label>
                                <ScrollArea className="h-[250px] sm:h-[300px] w-full border rounded-md p-4">
                                  <div className="space-y-3">
                                    {selectedContact.interactionHistory?.map((interaction, index) => (
                                      <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-gray-50 rounded gap-2"
                                      >
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge className={`${getInteractionTypeColor(interaction.type)} text-xs`}>
                                            {interaction.type.replace("_", " ")}
                                          </Badge>
                                          {interaction.automationName && (
                                            <Badge variant="outline" className="text-xs">
                                              {interaction.automationName}
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {formatDate(interaction.timestamp)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteContact(contact._id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                  <div className="text-sm text-gray-500 text-center sm:text-left">
                    Showing {(pagination.currentPage - 1) * 20 + 1} to{" "}
                    {Math.min(pagination.currentPage * 20, pagination.totalCount)} of {pagination.totalCount} contacts
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )

}
