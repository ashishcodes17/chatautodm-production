"use client"
import { useState } from "react"

interface MobilePreviewProps {
  mode?: "story" | "comment" | "dm"
  automationData?: {
    message?: string
    buttons?: Array<{
      type: string
      title: string
      url?: string
      payload?: string
    }>
    keywords?: string[]
    keywordMode?: string
    commentReply?: string
    linkMessage?: string
    link?: string
    linkText?: string
  }
}

export default function MobilePreview({ mode = "story", automationData = {} }: MobilePreviewProps) {
  const [showDrawer, setShowDrawer] = useState(false)
  const [currentView, setCurrentView] = useState<"post" | "comments" | "dm">("post")

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    })
  }

  const shouldTriggerAutomation = (text: string) => {
    if (automationData.keywordMode === "any_comment" || automationData.keywordMode === "any_reply") {
      return true
    }
    if (automationData.keywords && automationData.keywords.length > 0) {
      return automationData.keywords.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase()))
    }
    return false
  }

  const renderStoryView = () => (
    <div className="flex-1 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white relative">
      {/* Story Progress Bar */}
      <div className="absolute top-2 left-4 right-4 z-10">
        <div className="h-0.5 bg-white bg-opacity-30 rounded-full">
          <div className="h-full bg-white rounded-full w-3/4"></div>
        </div>
      </div>

      {/* Story Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3 mt-2">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full overflow-hidden border-2 border-white">
          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
            U
          </div>
        </div>
        <span className="font-semibold text-sm text-white">your_username</span>
        <span className="text-xs text-gray-300 ml-auto">2h</span>
      </div>

      {/* Story Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">📸</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Your Story</h3>
            <p className="text-sm text-white/80 max-w-xs">Users will reply to this story to trigger your automation</p>
          </div>
        </div>
      </div>

      {/* Story Reply Input */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-black bg-opacity-50 rounded-full px-4 py-2 flex items-center gap-3">
          <span className="text-white text-sm flex-1">Send message</span>
          <span className="text-white">❤️</span>
        </div>
      </div>
    </div>
  )

  const renderPostView = () => (
    <div className="flex-1 bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
              U
            </div>
          </div>
          <span className="font-semibold text-sm">your_username</span>
        </div>
        <div className="text-gray-400">•••</div>
      </div>

      {/* Post Content */}
      <div className="w-full h-[100%] bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="flex flex-col items-center text-purple-600 text-center">
          <span className="text-4xl mb-2">📱</span>
          <span className="text-sm font-semibold leading-tight">
            Your Post
            <br />
            or Reel
          </span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg">❤️</span>
            <span className="text-lg" onClick={() => setShowDrawer(true)}>
              💬
            </span>
            <span className="text-lg">📤</span>
          </div>
        </div>

        <div className="text-sm">
          <span className="font-semibold">your_username</span>
          <span className="ml-2">✅ Comment below for instant access! 🚀</span>
        </div>

        <button onClick={() => setShowDrawer(true)} className="text-xs text-gray-400 hover:text-white transition">
          View all comments
        </button>
      </div>

      {/* Comments Drawer */}
      {showDrawer && (
        <>
          <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-40" onClick={() => setShowDrawer(false)} />
          <div className="absolute left-0 w-full z-50 bg-[#262624] rounded-t-[30px] px-4 py-3 bottom-0 h-[50%]">
            <div className="text-center mb-2">
              <h2 className="text-base font-semibold text-white">Comments</h2>
              <hr className="border-white/30 mt-2 w-[80px] mx-auto" />
            </div>

            <div className="overflow-y-auto mb-2 h-[48%] pr-1 space-y-2">
              {["link please!", "more info", "price?", "amazing!", "how much?"].map((comment, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-sm text-white">
                    <span className="font-semibold">@user{index + 1}</span> {comment}
                  </p>
                  {shouldTriggerAutomation(comment) && automationData.commentReply && (
                    <p className="text-sm text-white ml-4">
                      <span className="font-semibold">@your_username</span> {automationData.commentReply}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 rounded-full bg-[#222] text-white px-3 py-1 text-sm placeholder-gray-300 outline-none border border-white"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderDMView = () => (
    <div className="flex-1 bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-lg">←</span>
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
              U
            </div>
          </div>
          <span className="font-semibold text-sm">your_username</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg">📞</span>
          <span className="text-lg">📹</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="max-w-xs">
            <div className="bg-blue-600 rounded-2xl rounded-br-md px-4 py-3">
              <div className="text-sm">
                {automationData.keywords && automationData.keywords.length > 0 ? automationData.keywords[0] : "Hello!"}
              </div>
            </div>
          </div>
        </div>

        {/* Auto Reply */}
        {automationData.message && (
          <div className="flex justify-start">
            <div className="max-w-xs">
              <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-sm whitespace-pre-line">{automationData.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        {automationData.buttons && automationData.buttons.length > 0 && (
          <div className="flex justify-start">
            <div className="max-w-xs space-y-2">
              {automationData.buttons.map((button, index) => (
                <button
                  key={index}
                  className={`block w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    button.type === "web_url"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {button.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Link Message */}
        {automationData.linkMessage && (
          <div className="flex justify-start">
            <div className="max-w-xs">
              <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="text-sm whitespace-pre-line">{automationData.linkMessage}</div>
                {automationData.link && automationData.linkText && (
                  <div className="mt-2">
                    <a
                      href={automationData.link}
                      className="text-blue-400 underline text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {automationData.linkText}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center gap-3">
            <span className="text-gray-400 text-sm flex-1">Message...</span>
            <span className="text-gray-400">🎤</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-full max-w-sm aspect-[360/520]">
        {/* Phone Frame */}
        <div className="absolute inset-0 bg-black rounded-[3rem] p-2 shadow-2xl">
          <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>

            {/* Status Bar */}
            <div className="flex justify-between items-center px-6 py-3 text-white text-sm relative z-0">
              <span className="font-semibold">{getCurrentTime()}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs">📶 🔋</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 h-full">
              {mode === "story" && renderStoryView()}
              {mode === "comment" && renderPostView()}
              {mode === "dm" && renderDMView()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
