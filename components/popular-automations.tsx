"use client"

import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, MessageSquare } from "lucide-react"

export function PopularAutomations() {
  const router = useRouter()
  const params = useParams()
  const wsid = params.wsid as string

  const automations = [
    {
      title: "Comment to DM Flow",
      description: "Auto-reply to comments with personalized DMs",
      route: `/${wsid}/automations/flow-builder`,
    },
    {
      title: "Story Reply Flow",
      description: "Respond to story replies with automated DMs",
      route: `/${wsid}/automations/story-builder`,
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Popular Automations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((automation, index) => (
          <Card
            key={index}
            onClick={() => router.push(automation.route)}
            className="cursor-pointer border-0 rounded-xl shadow-lg bg-white/90 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  {index === 0 ? (
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  ) : (
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{automation.title}</h4>
                  <p className="text-sm text-gray-600">{automation.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
