"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Dialog, Switch } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { toast, Toaster } from "sonner"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"

interface IceBreakerQuestion {
  question: string
  payload: string
  response: string
}

interface IceBreakerState {
  enabled: boolean
  locale: string
  questions: IceBreakerQuestion[]
}

interface UserProfile {
  username: string
  instagramId: string
  profilePictureUrl: string
  accountType: string
}

export default function IceBreakersPage() {
  const { wsid } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [iceBreaker, setIceBreaker] = useState<IceBreakerState>({
    enabled: true,
    locale: "default",
    questions: [
      { question: "", payload: "", response: "" },
      { question: "", payload: "", response: "" },
    ],
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/workspaces/${wsid}/user`)
        if (response.data?.success && response.data?.user) {
          setUserProfile(response.data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user data", error)
      } finally {
        setLoading(false)
      }
    }

    const loadExistingIceBreakers = async () => {
      try {
        const response = await axios.get(`/api/workspaces/${wsid}/ice-breakers`)
        if (response.data?.success && response.data?.iceBreakers) {
          const data = response.data.iceBreakers
          if (data.call_to_actions && data.call_to_actions.length > 0) {
            setIceBreaker({
              enabled: true,
              locale: data.locale || "default",
              questions: data.call_to_actions,
            })
          }
        }
      } catch (error) {
        console.log("No existing ice breakers found")
      }
    }

    fetchUserData()
    loadExistingIceBreakers()
  }, [wsid])

  const addQuestion = () => {
    if (iceBreaker.questions.length < 4) {
      setIceBreaker({
        ...iceBreaker,
        questions: [...iceBreaker.questions, { question: "", payload: "", response: "" }],
      })
    }
  }

  const removeQuestion = (index: number) => {
    if (iceBreaker.questions.length > 1) {
      setIceBreaker({
        ...iceBreaker,
        questions: iceBreaker.questions.filter((_, i) => i !== index),
      })
    }
  }

  const updateQuestion = (index: number, field: "question" | "payload" | "response", value: string) => {
    const updated = [...iceBreaker.questions]
    updated[index][field] = value
    setIceBreaker({ ...iceBreaker, questions: updated })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Validate questions
      const validQuestions = iceBreaker.questions.filter((q) => q.question.trim() && q.payload.trim() && q.response.trim())

      if (validQuestions.length === 0) {
        toast.error("Missing Questions", {
          description: "Please add at least one question with question text, payload, and response message.",
        })
        return
      }

      const payload = {
        platform: "instagram",
        locale: iceBreaker.locale,
        call_to_actions: validQuestions,
      }

      const response = await axios.post(`/api/workspaces/${wsid}/ice-breakers`, payload)

      if (response.data.success) {
        toast.success("Ice Breakers Saved Successfully", {
          description: "Your ice breakers have been activated on Instagram.",
        })
        setTimeout(() => router.push(`/${wsid}/automations`), 1500)
      } else {
        toast.error("Failed to Save Ice Breakers", {
          description: response.data.error || "Something went wrong. Please try again.",
        })
      }
    } catch (error: any) {
      console.error("Error saving ice breakers:", error)
      console.error("Error response data:", error?.response?.data)
      
      const errorMsg = error?.response?.data?.error || error?.message || "Failed to save ice breakers"
      const errorDetails = error?.response?.data?.errorDetails || error?.response?.data?.instagramError
      
      toast.error("Unexpected Error", {
        description: errorMsg + (errorDetails ? `\n${JSON.stringify(errorDetails)}` : ""),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsSubmitting(true)
      const response = await axios.delete(`/api/workspaces/${wsid}/ice-breakers`)

      if (response.data.success) {
        toast.success("Ice Breakers Deleted", {
          description: "Your ice breakers have been removed from Instagram.",
        })
        setTimeout(() => router.push(`/${wsid}/automations`), 1500)
      } else {
        toast.error("Failed to Delete Ice Breakers", {
          description: "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error deleting ice breakers:", error)
      toast.error("Unexpected Error", {
        description: "Failed to delete ice breakers. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  const renderMobilePreview = () => {
    return (
      <div className="relative flex flex-col h-full text-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button className="text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Image
              src={userProfile?.profilePictureUrl || "/placeholder.svg"}
              alt="Profile"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-xs font-semibold">{userProfile?.username || "username"}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 16.92V19a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h2.09a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9a16 16 0 006.92 6.92l.42-.35a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Ice Breakers Preview */}
        <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide">
          <div className="flex justify-center">
            <div className="bg-neutral-800/50 px-3 py-1 rounded-full text-[10px] text-white/70">
              Start a conversation
            </div>
          </div>

          {/* Ice Breaker Questions */}
          <div className="space-y-2">
            {iceBreaker.questions
              .filter((q) => q.question.trim())
              .map((q, index) => (
                <div
                  key={index}
                  className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 cursor-pointer hover:bg-neutral-700 transition"
                >
                  <div className="text-white text-[11px] text-center">{q.question}</div>
                </div>
              ))}
          </div>

          {iceBreaker.questions.filter((q) => q.question.trim()).length === 0 && (
            <div className="text-center text-white/50 text-xs mt-8">Add questions to see preview</div>
          )}
        </div>

        {/* Chat Input Wrapper (Absolute at bottom) */}
        <div className="absolute bottom-0 left-0 w-full bg-black">
          <div className="border-t border-white/10">
            {/* Input Row */}
            <div className="flex items-center gap-2 bg-neutral-800 rounded-full px-3 py-2 mt-2 mx-3">
              <input type="text" placeholder="Message..." className="flex-1 bg-transparent text-white text-sm outline-none" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white cursor-pointer hover:text-purple-400 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>

            {/* iOS Home Indicator */}
            <div className="mt-2 mb-1 flex justify-center">
              <div className="w-[120px] h-[4px] bg-white/70 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Toaster position="top-center" richColors closeButton />

      {/* Left: Mobile Preview */}
      <div className="flex items-center justify-center w-full md:w-[calc(100%-450px)] bg-gray-100">
        <div className="relative w-full max-w-sm aspect-[360/520] md:translate-x-28">
          <Image
            src="/mobile-frame.png"
            alt="Phone Frame"
            fill
            className="object-contain z-[20] pointer-events-none select-none"
            priority
          />

          <div className="absolute top-[2.5%] left-[18.6%] w-[63%] h-[95.5%] rounded-[30px] overflow-hidden bg-black z-10 shadow-inner">
            {renderMobilePreview()}
          </div>
        </div>
      </div>

      {/* Right Sidebar with Card Layout */}
      <div className="hidden md:block w-[450px] border-l border-gray-200 bg-gray-50 px-4 py-6 overflow-y-auto h-full space-y-4">
        {/* Step 1: Setup Ice Breakers Card */}
        <div
          className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${
            activeStep === 1 ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"
          }`}
          onClick={() => setActiveStep(1)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                activeStep === 1 ? "bg-purple-600 text-white" : "bg-slate-800 text-white"
              }`}
            >
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Setup Ice Breakers</h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700">Enable Ice Breakers</span>
            <Switch
              checked={iceBreaker.enabled}
              onChange={(val) => setIceBreaker({ ...iceBreaker, enabled: val })}
              className={`${
                iceBreaker.enabled ? "bg-purple-600" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  iceBreaker.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </Switch>
          </div>

          <div className="space-y-4">
            {iceBreaker.questions.map((q, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                  {iceBreaker.questions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeQuestion(index)
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Enter question (e.g., What services do you offer?)"
                  value={q.question}
                  onChange={(e) => updateQuestion(index, "question", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full mb-2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  maxLength={80}
                />

                <input
                  type="text"
                  placeholder="Enter payload (e.g., SERVICES_INFO)"
                  value={q.payload}
                  onChange={(e) => updateQuestion(index, "payload", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full mb-2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />

                <textarea
                  placeholder="Enter response message to send when this question is clicked..."
                  value={q.response}
                  onChange={(e) => updateQuestion(index, "response", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[80px] resize-none"
                  maxLength={640}
                />

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">Question: {q.question.length}/80 | Response: {q.response.length}/640</span>
                  <span className="text-xs text-gray-500">Payload: {q.payload || "Required"}</span>
                </div>
              </div>
            ))}
          </div>

          {iceBreaker.questions.length < 4 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                addQuestion()
              }}
              className="w-full mt-3 border border-purple-500 text-purple-600 py-2 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
              </svg>
              Add Question ({iceBreaker.questions.length}/4)
            </button>
          )}
        </div>

        {/* Step 2: Info Card */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ How Ice Breakers Work</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Ice breakers help users start conversations with pre-set questions</li>
            <li>• Maximum 4 questions allowed</li>
            <li>• Each question needs a custom response message</li>
            <li>• Payloads help you identify which question was clicked in webhooks</li>
            <li>• Only available on mobile Instagram app</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Saving..." : "SAVE ICE BREAKERS"}
          </Button>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting}
            variant="destructive"
            className="px-4"
          >
            DELETE
          </Button>
        </div>
      </div>

      {/* Mobile Edit Button */}
      <div className="md:hidden fixed bottom-6 inset-x-0 flex justify-center z-[40]">
        <button
          onClick={() => setShowMobileDrawer(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg"
        >
          Edit
        </button>
      </div>

      {/* Mobile Bottom Drawer */}
      <div
        className={`md:hidden fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-xl z-[70] transition-transform duration-300 ${showMobileDrawer ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Ice Breakers</h2>
          <button onClick={() => setShowMobileDrawer(false)} className="text-gray-600">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(90vh-60px)] px-4 pb-6">
          {/* Same card content as desktop */}
          <div className="bg-white rounded-lg border p-4 shadow-sm mt-4">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Setup Ice Breakers</h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700">Enable Ice Breakers</span>
              <Switch
                checked={iceBreaker.enabled}
                onChange={(val) => setIceBreaker({ ...iceBreaker, enabled: val })}
                className={`${
                  iceBreaker.enabled ? "bg-purple-600" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    iceBreaker.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </Switch>
            </div>

            <div className="space-y-4">
              {iceBreaker.questions.map((q, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                    {iceBreaker.questions.length > 1 && (
                      <button onClick={() => removeQuestion(index)} className="text-red-500 hover:text-red-700">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Enter question"
                    value={q.question}
                    onChange={(e) => updateQuestion(index, "question", e.target.value)}
                    className="w-full mb-2 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    maxLength={80}
                  />

                  <input
                    type="text"
                    placeholder="Enter payload"
                    value={q.payload}
                    onChange={(e) => updateQuestion(index, "payload", e.target.value)}
                    className="w-full mb-2 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />

                  <textarea
                    placeholder="Enter response message..."
                    value={q.response}
                    onChange={(e) => updateQuestion(index, "response", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px] resize-none"
                    maxLength={640}
                  />
                </div>
              ))}
            </div>

            {iceBreaker.questions.length < 4 && (
              <button
                onClick={addQuestion}
                className="w-full mt-3 border border-purple-500 text-purple-600 py-2 rounded-md text-sm font-medium"
              >
                Add Question ({iceBreaker.questions.length}/4)
              </button>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-4">
            {isSubmitting ? "Saving..." : "SAVE ICE BREAKERS"}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="relative z-[80]">
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <h2 className="text-lg font-semibold mb-4">Delete Ice Breakers?</h2>
            <p className="text-sm text-gray-600 mb-6">
              This will remove all ice breakers from your Instagram profile. Users won't see quick questions anymore.
            </p>

            <div className="flex gap-3">
              <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
