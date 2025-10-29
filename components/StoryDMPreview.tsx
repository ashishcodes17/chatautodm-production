import { Button } from "@/components/ui/button"

interface ButtonProps {
  type: "web_url" | "postback"
  title: string
  url?: string
  payload?: string
}

interface StoryDMPreviewProps {
  userInfo: {
    id: string
    username: string
    account_type: string
    media_count: number
    profile_picture_url?: string
  } | null
  openingMessage: string
  buttons: ButtonProps[]
  linkMessage: string
  link: string
  linkText: string
}

export function StoryDMPreview({
  userInfo,
  openingMessage,
  buttons,
  linkMessage,
  link,
  linkText,
}: StoryDMPreviewProps) {
  return (
    <div className="flex flex-col h-full bg-gray-100 p-4 justify-between">
      {/* Messages */}
      <div className="space-y-2">
        {/* Bot Message */}
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {userInfo?.profile_picture_url ? (
              <img
                src={userInfo.profile_picture_url || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
                {userInfo?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-3 text-sm text-gray-800 shadow-sm">
            {openingMessage}
            <div className="mt-2 space-y-2">
              {buttons.map((button, index) => (
                <Button key={index} variant="outline" className="w-full justify-center text-sm bg-transparent">
                  {button.title}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* User Message (after button click) */}
        <div className="flex items-start gap-2 justify-end">
          <div className="bg-blue-500 rounded-xl p-3 text-sm text-white shadow-sm">
            {linkMessage}
            <a href={link} className="underline block mt-2">
              {linkText}
            </a>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
              U
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border rounded-full border-gray-300 bg-white px-4 py-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full border-none outline-none text-sm text-gray-700"
        />
      </div>
    </div>
  )
}
