"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Search, MessageCircle } from "lucide-react"
import Link from "next/link"

interface Message {
  _id: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  isEcho: boolean
  conversationId: string
}

interface Conversation {
  _id: string
  participantId: string
  participantName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<any>(null)
  const params = useParams()
  const router = useRouter()
  const wsid = params.wsid as string
  const accountId = params.accountId as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch account info
        const accountResponse = await fetch(`/api/workspaces/${wsid}/instagram-accounts/${accountId}`)
        if (accountResponse.ok) {
          const accountData = await accountResponse.json()
          setAccount(accountData)
        }

        // Fetch conversations
        const conversationsResponse = await fetch(
          `/api/workspaces/${wsid}/instagram-accounts/${accountId}/conversations`,
        )
        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json()
          setConversations(conversationsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [wsid, accountId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch(`/api/workspaces/${wsid}/instagram-accounts/${accountId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          text: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const sentMessage = await response.json()

        // Update the conversation with the new message
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, sentMessage],
              }
            : null,
        )

        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
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
          <div className="flex items-center py-4">
            <Link href={`/${wsid}/dashboard`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">Messages - @{account?.username}</h1>
              <p className="text-sm text-gray-600">Manage Instagram Direct Messages</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Conversations</span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?._id === conversation._id ? "bg-blue-50 border-blue-200" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{conversation.participantName}</h4>
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className="text-xs text-gray-500">
                            {new Date(conversation.lastMessageTime).toLocaleTimeString()}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages View */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <CardTitle>{selectedConversation.participantName}</CardTitle>
                  <CardDescription>Instagram Direct Messages</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-96">
                    {selectedConversation.messages.map((message) => (
                      <div key={message._id} className={`flex ${message.isEcho ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isEcho ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${message.isEcho ? "text-blue-100" : "text-gray-500"}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the left to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
