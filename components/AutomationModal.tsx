"use client"

import { useRouter, useParams } from "next/navigation"

interface AutomationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AutomationModal({ isOpen, onClose }: AutomationModalProps) {
  const router = useRouter()
  const params = useParams()
  const wsid = params.wsid as string

  const flows = [
    {
      title: "Comment to DM Flow",
      subtitle: "Automatically reply to comments and send personalized DMs with interactive buttons",
      points: ["Auto-reply to comments", "Send DM with buttons", "Keyword triggers", "Link delivery on click"],
      badge: "quick",
      route: `/${wsid}/automations/flow-builder`,
    },
    {
      title: "Story Reply Flow",
      subtitle: "Respond to story replies instantly and convert viewers into customers with automated DMs",
      points: ["Story reply triggers", "Instant DM responses", "Interactive buttons", "Link delivery system"],
      badge: "quick",
      route: `/${wsid}/automations/story-builder`,
    },
   {
  title: "DM Auto Responder",
  subtitle: "Automatically reply to direct messages with personalized responses and call-to-action buttons",
  points: [
    "Auto-reply to DMs",
    "Keyword-based triggers",
    "Personalized DM replies",
    "Interactive buttons & link delivery"
  ],
  badge: "quick",
  route: `/${wsid}/automations/dm-builder`,
},

  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 sm:top-4 sm:right-5 text-gray-500 hover:text-black text-xl sm:text-2xl font-bold z-10"
        >
          &times;
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 pr-8">Templates</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {flows.map((flow, index) => (
            <div
              key={index}
              onClick={() => {
                if (flow.route) {
                  onClose()
                  router.push(flow.route)
                }
              }}
              className={`p-4 sm:p-5 border border-gray-200 rounded-xl transition ${
                flow.route ? "cursor-pointer hover:shadow-md hover:bg-gray-50" : "opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base sm:text-lg text-purple-700 pr-2">{flow.title}</h3>
                {flow.badge && (
                  <span
          className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1`}
          style={{
            backgroundColor: "#3076fd20", // light blue background
            color: "#3076fd",            // blue text
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {flow.badge}
        </span>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-3">{flow.subtitle}</p>
              {flow.points.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {flow.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
