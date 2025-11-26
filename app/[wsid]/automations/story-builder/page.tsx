"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Dialog, Switch, DialogPanel, DialogTitle } from "@headlessui/react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { toast, Toaster } from "sonner"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import axios from "axios"

interface InstagramPost {
  id: string
  media_type: string
  media_url: string
  permalink: string
  timestamp: string
  username: string
  caption?: string
  thumbnail_url?: string
}

type DMButton = { text: string; link: string }
type FollowButton = { text: string; type: "profile" | "confirm" }

interface StoryAutomationState {
  trigger: { anyReply: boolean; keywords: string[] }
  actions: {
    sendDM: { message: string; buttons: DMButton[]; image_url?: string } // 🆕 Image support
    openingDM: { enabled: boolean; message: string; buttons: DMButton[]; image_url?: string } // 🆕 Image support
    askFollow: boolean
    askEmail: boolean
    reactHeart: boolean
    followMessage: string
    followButtons: FollowButton[]
    followUp: { enabled: boolean; message: string; delay: number } // 🆕 Follow-up message
  }
  storyId: string | null
}

export default function Page() {
  const { wsid } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const automationId = searchParams.get("edit")
  const isEditMode = !!automationId

  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  // Mobile drawer state (added)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showStoryModal, setShowStoryModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showFollowButtonModal, setShowFollowButtonModal] = useState(false)
  const [showOpeningLinkModal, setShowOpeningLinkModal] = useState(false)
  const [link, setLink] = useState("")
  const [buttonText, setButtonText] = useState("")
  const [followButtonText, setFollowButtonText] = useState("")
  const [openingButtonText, setOpeningButtonText] = useState("")
  const [openingLink, setOpeningLink] = useState("")
  const [validLink, setValidLink] = useState(true)
  const [validOpeningLink, setValidOpeningLink] = useState(true)
  const [stories, setStories] = useState<any[]>([])
  const [storiesPagination, setStoriesPagination] = useState({
    hasNext: false,
    nextCursor: null,
    loading: false,
  })
  const [activeStep, setActiveStep] = useState(1)
  const [editingButton, setEditingButton] = useState<{ index: number; type: "dm" | "opening" } | null>(null)
  const [editingFollowButton, setEditingFollowButton] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false) // 🆕 Image upload state
  const [isUploadingOpeningImage, setIsUploadingOpeningImage] = useState(false) // 🆕 Opening DM image upload state
  const ENABLE_OPENING_DM_IMAGE = false // 🚫 Disabled for now

  interface UserProfile {
    username: string
    instagramId: string
    profilePictureUrl: string
    accountType: string
    followers: number
    following: number
    posts: number
    thumbnails: InstagramPost[]
    profilePicture: string
  }

  const [automation, setAutomation] = useState<StoryAutomationState>({
    trigger: {
      anyReply: true,
      keywords: [],
    },
    actions: {
      // Main DM message (compulsory)
      sendDM: {
        message: "",
        buttons: [],
      },
      // Optional opening message
      openingDM: {
        enabled: false,
        message:
          "Hey there! I'm so happy you're here, thanks so much for your interest 😊\n\nClick below and I'll send you the link in just a sec ✨",
        buttons: [{ text: "Send me the link", link: "" }],
      },
      askFollow: false,
      askEmail: false,
      reactHeart: false,
      followMessage:
        "Oh no! It seems you're not following me 😭 It would really mean a lot if you visit my profile and hit the follow button 🥺 . Once you have done that, click on the 'I'm following' button below and you will get the link ✨ .",
      followButtons: [
        { text: "Visit Profile", type: "profile" },
        { text: "I'm following ✅", type: "confirm" },
      ],
      followUp: {
        enabled: false,
        message: "Hey! Just following up on my previous message. Let me know if you have any questions! 😊",
        delay: 300000, // 5 minutes default (in milliseconds)
      },
    },
    storyId: null,
  })

  const [keywordInput, setKeywordInput] = useState("")

  // Map API automation format back to builder-friendly state
  const normalizeAutomationFromApi = (apiAutomation: any): StoryAutomationState => {
    const mapButtonsBack = (buttons: any[] = []): DMButton[] =>
      buttons.map((b): DMButton => {
        if (b?.type === "web_url") {
          return { text: b.title || "", link: b.url || "" }
        }
        return { text: b?.title || b?.text || "", link: "" }
      })

    return {
      trigger: {
        anyReply: apiAutomation?.trigger?.keywordMode === "any_reply",
        keywords: apiAutomation?.trigger?.triggerKeywords || apiAutomation?.trigger?.keywords || [],
      },
      actions: {
        sendDM: {
          message: apiAutomation?.actions?.sendDM?.message || "",
          buttons: mapButtonsBack(apiAutomation?.actions?.sendDM?.buttons || []),
          image_url: apiAutomation?.actions?.sendDM?.image_url || null, // 🆕 Preserve image URL
        },
        openingDM: {
          enabled: apiAutomation?.actions?.openingDM?.enabled || false,
          message: apiAutomation?.actions?.openingDM?.message || "",
          buttons: mapButtonsBack(apiAutomation?.actions?.openingDM?.buttons || []),
          image_url: apiAutomation?.actions?.openingDM?.image_url || null, // 🆕 Preserve image URL
        },
        askFollow: apiAutomation?.actions?.askFollow?.enabled || false,
        askEmail: apiAutomation?.actions?.askEmail?.enabled || false,
        reactHeart: apiAutomation?.actions?.reaction?.enabled || false,
        followMessage:
          apiAutomation?.actions?.askFollow?.message ||
          "Oh no! It seems you're not following me 😭 It would really mean a lot if you visit my profile and hit the follow button 🥺 . Once you have done that, click on the 'I'm following' button below and you will get the link ✨ .",
        followButtons: (apiAutomation?.actions?.askFollow?.buttons || []).map((btn: any): FollowButton => {
          if (btn?.type === "web_url") {
            return { text: btn.title || "Visit Profile", type: "profile" }
          }
          return { text: btn?.title || "I'm following ✅", type: "confirm" }
        }),
        followUp: {
          enabled: apiAutomation?.actions?.followUp?.enabled || false,
          message: apiAutomation?.actions?.followUp?.message || "Hey! Just following up on my previous message. Let me know if you have any questions! 😊",
          delay: apiAutomation?.actions?.followUp?.delay || 300000,
        },
      },
      storyId: apiAutomation?.selectedStory || null,
    }
  }

  useEffect(() => {
    if (isEditMode && automationId) {
      const loadAutomation = async () => {
        try {
          const response = await axios.get(`/api/automations/${automationId}`)
          if (response.data?.success && response.data?.automation) {
            const normalized = normalizeAutomationFromApi(response.data.automation)
            setAutomation(normalized)
          }
        } catch (error) {
          console.error("Failed to load automation:", error)
        }
      }
      loadAutomation()
    }
  }, [isEditMode, automationId])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/workspaces/${wsid}/user`)
        if (response.data?.success && response.data?.user) {
          const userData = response.data.user
          setUserProfile(userData)
          setPosts(userData.thumbnails || [])
        } else {
          setPosts([])
          setUserProfile(null)
        }
      } catch (error) {
        console.error("Failed to fetch user data", error)
        setPosts([])
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [wsid])

  const validateLink = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await axios.get(`/api/workspaces/${wsid}/instagram/stories`)
        if (data?.success && Array.isArray(data?.stories)) {
          setStories(data.stories)
          setStoriesPagination({
            hasNext: data.pagination?.hasNext || false,
            nextCursor: data.pagination?.nextCursor || null,
            loading: false,
          })
        } else {
          setStories([])
        }
      } catch (error) {
        console.error("Failed to fetch stories", error)
        setStories([])
      }
    }
    fetchStories()
  }, [wsid])

  const loadMoreStories = async () => {
    if (!storiesPagination.hasNext || storiesPagination.loading) return

    setStoriesPagination((prev) => ({ ...prev, loading: true }))

    try {
      const { data } = await axios.get(
        `/api/workspaces/${wsid}/instagram/stories?after=${storiesPagination.nextCursor}`,
      )
      if (data?.success && Array.isArray(data?.stories)) {
        setStories((prev) => [...prev, ...data.stories])
        setStoriesPagination({
          hasNext: data.pagination?.hasNext || false,
          nextCursor: data.pagination?.nextCursor || null,
          loading: false,
        })
      }
    } catch (error) {
      console.error("Failed to load more stories", error)
      setStoriesPagination((prev) => ({ ...prev, loading: false }))
    }
  }

  // Handle image upload for main DM and opening DM
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "dm" | "opening") => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Image must be less than 5MB",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file",
      })
      return
    }

    try {
      if (type === "dm") {
        setIsUploadingImage(true)
      } else {
        setIsUploadingOpeningImage(true)
      }

      const formData = new FormData()
      formData.append("image", file)

      const response = await axios.post("/api/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        const imageUrl = response.data.imageUrl

        if (type === "dm") {
          setAutomation({
            ...automation,
            actions: {
              ...automation.actions,
              sendDM: {
                ...automation.actions.sendDM,
                image_url: imageUrl,
              },
            },
          })
        } else {
          setAutomation({
            ...automation,
            actions: {
              ...automation.actions,
              openingDM: {
                ...automation.actions.openingDM,
                image_url: imageUrl,
              },
            },
          })
        }

        toast.success("Image uploaded", {
          description: "Your image has been uploaded successfully",
        })
      } else {
        toast.error("Upload failed", {
          description: response.data.error || "Failed to upload image",
        })
      }
    } catch (error: any) {
      console.error("Image upload error:", error)
      toast.error("Upload failed", {
        description: error.message || "Failed to upload image",
      })
    } finally {
      if (type === "dm") {
        setIsUploadingImage(false)
      } else {
        setIsUploadingOpeningImage(false)
      }
      // Reset file input
      e.target.value = ""
    }
  }

  const removeImage = (type: "dm" | "opening") => {
    if (type === "dm") {
      setAutomation({
        ...automation,
        actions: {
          ...automation.actions,
          sendDM: {
            ...automation.actions.sendDM,
            image_url: undefined,
          },
        },
      })
    } else {
      setAutomation({
        ...automation,
        actions: {
          ...automation.actions,
          openingDM: {
            ...automation.actions.openingDM,
            image_url: undefined,
          },
        },
      })
    }
  }



const handleSubmit = async () => {
  try {
    setIsSubmitting(true)

    // 🧩 Step 1: Validate story selection
    if (!automation.storyId) {
      toast.error("Story Required", {
        description: "Please select a story before saving your automation.",
      })
      setIsSubmitting(false)
      return
    }

    // 🧩 Step 2: Validate required fields
    if (!automation.actions.sendDM.message.trim()) {
      toast.error("Missing Message", {
        description: "Please enter a main DM message before saving your automation.",
      })
      setIsSubmitting(false)
      return
    }

    // 🧠 Step 2: Build payload and send API request depending on mode
    const payload = {
      ...automation,
      type: "story_reply_flow",
      storyId: automation.storyId,
    }

    let response
    if (isEditMode && automationId) {
      response = await axios.put(`/api/automations/${automationId}`, payload)
    } else {
      response = await axios.post(`/api/workspaces/${wsid}/automations`, payload)
    }

    // 💡 Step 3: Handle successful or failed response
    if (response.data.success) {
      toast.success(`Automation ${isEditMode ? "Updated" : "Saved"} Successfully`, {
        description: isEditMode
          ? "Your automation changes have been saved successfully."
          : "Your new automation has been created and activated.",
      })

      // Add a short delay so users can see the toast before redirect
      if (!isEditMode) {
        setTimeout(() => router.push(`/${wsid}/automations`), 1500)
      }
    } else {
      toast.error(`Failed to ${isEditMode ? "Update" : "Save"} Automation`, {
        description: "Something went wrong. Please try again.",
      })
    }
  } catch (error) {
    // ⚠️ Step 4: Handle unexpected errors gracefully
    console.error("Error saving automation:", error)
    toast.error("Unexpected Error", {
      description: `Failed to ${isEditMode ? "update" : "save"} automation. Please try again.`,
    })
  } finally {
    // 🔄 Step 5: Reset loading state
    setIsSubmitting(false)
  }
}


  // Get selected story
  const selectedStory = stories.find((s) => s.id === automation.storyId)

  // Remove button from main DM
  const removeDMButton = (index: number) => {
    setAutomation({
      ...automation,
      actions: {
        ...automation.actions,
        sendDM: {
          ...automation.actions.sendDM,
          buttons: automation.actions.sendDM.buttons.filter((_, i) => i !== index),
        },
      },
    })
  }

  // Remove follow button
  const removeFollowButton = (index: number) => {
    setAutomation({
      ...automation,
      actions: {
        ...automation.actions,
        followButtons: automation.actions.followButtons.filter((_, i) => i !== index),
      },
    })
  }

  // Edit button
  const editButton = (index: number, type: "dm" | "opening") => {
    if (type === "dm") {
      const button = automation.actions.sendDM.buttons[index]
      setButtonText(button.text)
      setLink(button.link)
      setEditingButton({ index, type })
      setShowLinkModal(true)
    } else {
      const button = automation.actions.openingDM.buttons[index]
      setOpeningButtonText(button.text)
      setOpeningLink(button.link)
      setEditingButton({ index, type })
      setShowOpeningLinkModal(true)
    }
  }

  // Edit follow button
  const editFollowButton = (index: number) => {
    const button = automation.actions.followButtons[index]
    setFollowButtonText(button.text)
    setEditingFollowButton(index)
    setShowFollowButtonModal(true)
  }

  // Save edited button
  const saveEditedButton = () => {
    if (editingButton && editingButton.type === "dm") {
      const updatedButtons = [...automation.actions.sendDM.buttons]
      updatedButtons[editingButton.index] = { text: buttonText, link }
      setAutomation({
        ...automation,
        actions: {
          ...automation.actions,
          sendDM: {
            ...automation.actions.sendDM,
            buttons: updatedButtons,
          },
        },
      })
    }
    setEditingButton(null)
    setShowLinkModal(false)
    setLink("")
    setButtonText("")
  }

  // Save edited opening button
  const saveEditedOpeningButton = () => {
    if (editingButton && editingButton.type === "opening") {
      const updatedButtons = [...automation.actions.openingDM.buttons]
      updatedButtons[editingButton.index] = { text: openingButtonText, link: openingLink }
      setAutomation({
        ...automation,
        actions: {
          ...automation.actions,
          openingDM: {
            ...automation.actions.openingDM,
            buttons: updatedButtons,
          },
        },
      })
    }
    setEditingButton(null)
    setShowOpeningLinkModal(false)
    setOpeningLink("")
    setOpeningButtonText("")
  }

  // Save edited follow button
  const saveEditedFollowButton = () => {
    if (editingFollowButton !== null) {
      const updatedButtons = [...automation.actions.followButtons]
      updatedButtons[editingFollowButton] = {
        text: followButtonText,
        type: automation.actions.followButtons[editingFollowButton].type,
      }
      setAutomation({
        ...automation,
        actions: {
          ...automation.actions,
          followButtons: updatedButtons,
        },
      })
    }
    setEditingFollowButton(null)
    setShowFollowButtonModal(false)
    setFollowButtonText("")
  }

  // Render mobile preview based on active step
  const renderMobilePreview = () => {
    if (activeStep === 1) {
      // Story view for step 1
      return (
        <div className="relative flex flex-col h-full text-white text-sm px-3 pt-[65px] pb-[80px]">
          <div className="absolute top-8 left-4 right-4 z-30">
            <div className="h-[2px] bg-white/30 rounded-full overflow-hidden">
              <div className="h-full w-[40%] bg-white animate-pulse" />
            </div>
          </div>

          <div className="absolute top-10 left-4 right-4 flex justify-between items-center z-30">
            <div className="flex items-center gap-2">
              <Image
                src={userProfile?.profilePictureUrl || "/placeholder.svg"}
                alt="Profile"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm font-semibold">{userProfile?.username || "username"}</span>
            </div>
            <button className="text-white text-lg font-bold">×</button>
          </div>

          <div className="mt-3 border border-dotted border-white/30 rounded-lg overflow-hidden">
            <AspectRatio ratio={10 / 18}>
              {automation.storyId ? (
                <img
                  src={
                    selectedStory?.thumbnail_url || selectedStory?.media_url || "/placeholder.svg?height=400&width=200"
                  }
                  alt="Selected Story"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white/50 text-xs">
                  Story preview thumbnail
                </div>
              )}
            </AspectRatio>
          </div>

          <div className="absolute bottom-[25px] left-4 right-4 flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#121212] border border-white/20 rounded-full px-3 py-2">
              <input
                type="text"
                placeholder="Send message..."
                value={automation.actions.sendDM.message}
                onChange={(e) =>
                  setAutomation({
                    ...automation,
                    actions: {
                      ...automation.actions,
                      sendDM: {
                        ...automation.actions.sendDM,
                        message: e.target.value,
                      },
                    },
                  })
                }
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/60"
              />
            </div>
            <div className="w-5 h-5 text-red-500">❤️</div>
          </div>

          <div className="absolute bottom-[11px] left-1/2 -translate-x-1/2 flex justify-center z-[999]">
            <div className="w-[98px] h-[3px] bg-white rounded-full opacity-100" />
          </div>
        </div>
      )
    } else {
      // Chat view for steps 2, 3, and 4
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

          {/* Chat Messages - Scrollable with hidden scrollbar */}
          <div className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
            {/* 1. Story thumbnail message - Always at top */}
            {selectedStory && (
              <div className="flex justify-end">
                <div className="max-w-[140px]">
                  <div className="bg-purple-600 rounded-2xl p-2">
                    <img
                      src={selectedStory.thumbnail_url || selectedStory.media_url}
                      alt="Story"
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Keyword messages */}
            {automation.trigger.keywords.map((keyword, index) => (
              <div key={index} className="flex justify-end">
                <div className="bg-purple-600 rounded-2xl px-3 py-1.5 max-w-[140px]">
                  <span className="text-white text-[10px]">{keyword}</span>
                </div>
              </div>
            ))}

            {/* 3. Opening DM message - if enabled */}
            {automation.actions.openingDM.enabled && automation.actions.openingDM.message && (
              <div className="flex justify-start">
                <div className="flex items-start gap-1.5">
                  <Image
                    src={userProfile?.profilePictureUrl || "/placeholder.svg"}
                    alt="Profile"
                    width={16}
                    height={16}
                    className="rounded-full mt-1"
                  />
                  <div className="bg-neutral-800 rounded-2xl px-3 py-1.5 max-w-[140px]">
                    <span className="text-white text-[10px] leading-tight">{automation.actions.openingDM.message}</span>
                    {/* Show buttons if any */}
                    {automation.actions.openingDM.buttons.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {automation.actions.openingDM.buttons.map((button, index) => (
                          <div
                            key={index}
                            className="bg-neutral-700 text-white text-[9px] px-2 py-1 rounded-lg text-center cursor-pointer hover:bg-neutral-600 border border-neutral-600"
                          >
                            {button.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* User opening button click response */}
            {automation.actions.openingDM.enabled && automation.actions.openingDM.buttons.length > 0 && (
              <div className="flex justify-end">
                <div className="bg-purple-600 rounded-2xl px-3 py-1.5 max-w-[140px]">
                  <span className="text-white text-[10px]">{automation.actions.openingDM.buttons[0]?.text}</span>
                </div>
              </div>
            )}

            {/* 4. Ask Follow message - if enabled */}
            {automation.actions.askFollow && automation.actions.followMessage && (
              <>
                <div className="flex justify-start">
                  <div className="flex items-start gap-1.5">
                    <Image
                      src={userProfile?.profilePictureUrl || "/placeholder.svg"}
                      alt="Profile"
                      width={16}
                      height={16}
                      className="rounded-full mt-1"
                    />
                    <div className="bg-neutral-800 rounded-2xl px-3 py-1.5 max-w-[140px]">
                      <span className="text-white text-[10px] leading-tight">{automation.actions.followMessage}</span>
                      <div className="mt-1.5 space-y-1">
                        {automation.actions.followButtons.map((button, index) => (
                          <div
                            key={index}
                            className="bg-neutral-700 text-white text-[9px] px-2 py-1 rounded-lg text-center cursor-pointer hover:bg-neutral-600 border border-neutral-600"
                          >
                            {button.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User follow response */}
                <div className="flex justify-end">
                  <div className="bg-purple-600 rounded-2xl px-3 py-1.5 max-w-[140px]">
                    <span className="text-white text-[10px]">
                      {automation.actions.followButtons.find((b) => b.type === "confirm")?.text || "I'm following ✅"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* 5. Main Send DM message - Always shows */}
            {automation.actions.sendDM.message && (
              <div className="flex justify-start">
                <div className="flex items-start gap-1.5">
                  <Image
                    src={userProfile?.profilePictureUrl || "/placeholder.svg"}
                    alt="Profile"
                    width={16}
                    height={16}
                    className="rounded-full mt-1"
                  />
                  <div className="bg-neutral-800 rounded-2xl px-3 py-1.5 max-w-[140px]">
                    <span className="text-white text-[10px] leading-tight">{automation.actions.sendDM.message}</span>
                    {/* Show buttons if any */}
                    {automation.actions.sendDM.buttons.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {automation.actions.sendDM.buttons.map((button, index) => (
                          <div
                            key={index}
                            className="bg-neutral-700 text-white text-[9px] px-2 py-1 rounded-lg text-center cursor-pointer hover:bg-neutral-600 border border-neutral-600"
                          >
                            {button.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* User main DM button click response */}
            {automation.actions.sendDM.buttons.length > 0 && (
              <div className="flex justify-end">
                <div className="bg-purple-600 rounded-2xl px-3 py-1.5 max-w-[140px]">
                  <span className="text-white text-[10px]">{automation.actions.sendDM.buttons[0]?.text}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input 
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-neutral-700 rounded-full px-3 py-2">
                <input
                  type="text"
                  placeholder="Message..."
                  className="flex-1 bg-transparent text-white text-xs outline-none placeholder-white/60"
                />
              </div>
              <button className="text-white p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <button className="text-white p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                  <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <button className="text-white p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
                  <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          <div className="absolute bottom-[11px] left-1/2 -translate-x-1/2 flex justify-center">
            <div className="w-[98px] h-[3px] bg-white rounded-full opacity-100" />
          </div>

          */}

          {/* Chat Input Wrapper (Absolute at bottom) */}
          <div className="absolute bottom-0 left-0 w-full bg-black">
            <div className="border-t border-white/10">
              {/* Input Row */}
              <div className="flex items-center gap-2 bg-neutral-800 rounded-full px-3 py-2 mt-2 mx-3">
                <input
                  type="text"
                  placeholder="Message..."
                  className="flex-1 bg-transparent text-white text-sm outline-none"
                />
                {/* Send Icon */}
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
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Toaster position="top-center" richColors closeButton />

      {/* Left: Mobile Preview */}
      <div className="flex items-center justify-center w-full md:w-[calc(100%-450px)] bg-gray-100 ">
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
        {/* Step 1: Select a Story Card */}
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
            <h3 className="text-lg font-semibold text-gray-900">Select a Story</h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700">Any story</span>
            <Switch
              checked={true}
              onChange={() => {}}
              className="bg-gray-300 relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
            </Switch>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {stories.length === 0 ? (
              <div className="col-span-3 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-500">No content</span>
              </div>
            ) : (
              stories.slice(0, 3).map((story: any) => (
                <div
                  key={story.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setAutomation({ ...automation, storyId: story.id })
                  }}
                  className={`h-24 rounded-lg cursor-pointer overflow-hidden ring-2 ${
                    automation.storyId === story.id ? "ring-purple-500" : "ring-transparent"
                  }`}
                >
                  <img
                    src={story.thumbnail_url || story.media_url}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowStoryModal(true)
            }}
            className="col-span-3 mt-3 text-sm text-purple-600 hover:underline"
          >
            Show More
          </button>
        </div>

        {/* Step 2: Setup Keywords Card */}
        <div
          className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${
            activeStep === 2 ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"
          }`}
          onClick={() => setActiveStep(2)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                activeStep === 2 ? "bg-purple-600 text-white" : "bg-slate-800 text-white"
              }`}
            >
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Setup Keywords</h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700">Any keyword</span>
            <Switch
              checked={automation.trigger.anyReply}
              onChange={(val) => setAutomation({ ...automation, trigger: { ...automation.trigger, anyReply: val } })}
              className={`${
                automation.trigger.anyReply ? "bg-purple-600" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  automation.trigger.anyReply ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </Switch>
          </div>

          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onFocus={() => setActiveStep(2)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && keywordInput.trim()) {
                e.preventDefault()
                if (!automation.trigger.keywords.includes(keywordInput.trim())) {
                  setAutomation({
                    ...automation,
                    trigger: {
                      ...automation.trigger,
                      keywords: [...automation.trigger.keywords, keywordInput.trim()],
                    },
                  })
                }
                setKeywordInput("")
              }
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Type & Hit Enter to add Keyword"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />

          {automation.trigger.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {automation.trigger.keywords.map((word, i) => (
                <div
                  key={i}
                  className="flex items-center bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full shadow-sm"
                >
                  {word}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setAutomation({
                        ...automation,
                        trigger: {
                          ...automation.trigger,
                          keywords: automation.trigger.keywords.filter((k) => k !== word),
                        },
                      })
                    }}
                    className="ml-2 text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Send a DM Card */}
        <div
          className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${
            activeStep === 3 ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"
          }`}
          onClick={() => setActiveStep(3)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                activeStep === 3 ? "bg-purple-600 text-white" : "bg-slate-800 text-white"
              }`}
            >
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Send a DM</h3>
          </div>

          {/* Main DM Composition Area */}
          <div className="border-2 border-purple-500 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3 text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" />
                <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <textarea
              placeholder="Enter your message here..."
              value={automation.actions.sendDM.message}
              onChange={(e) =>
                setAutomation({
                  ...automation,
                  actions: {
                    ...automation.actions,
                    sendDM: {
                      ...automation.actions.sendDM,
                      message: e.target.value,
                    },
                  },
                })
              }
              onFocus={() => setActiveStep(3)}
              onClick={(e) => e.stopPropagation()}
              className="w-full border-0 outline-none text-sm min-h-[60px] resize-none mb-2"
            />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">{automation.actions.sendDM.message.length} / 640</span>
              <div className="flex items-center gap-1"></div>
            </div>

            {/* 🆕 Main DM Image Upload Section */}
            <div className="mb-3">
              {automation.actions.sendDM.image_url ? (
                <div className="relative">
                  <img
                    src={automation.actions.sendDM.image_url}
                    alt="Main DM Preview"
                    className="w-full rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage("dm")
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
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
                </div>
              ) : (
                <label className="w-full border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-lg p-4 cursor-pointer transition-colors flex flex-col items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "dm")}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Upload Image</span>
                      <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                    </>
                  )}
                </label>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditingButton(null)
                setShowLinkModal(true)
              }}
              className="w-full border border-purple-500 text-purple-600 py-2 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
              </svg>
              Add Link
            </button>
          </div>

          {/* Main DM Buttons */}
          {automation.actions.sendDM.buttons.length > 0 && (
            <div className="space-y-2 mb-4">
              {automation.actions.sendDM.buttons.map((button, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-gray-700 truncate">{button.text}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        editButton(index, "dm")
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeDMButton(index)
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Opening Message Toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700">Opening message</span>
            <Switch
              checked={automation.actions.openingDM.enabled}
              onChange={(val) =>
                setAutomation({
                  ...automation,
                  actions: {
                    ...automation.actions,
                    openingDM: {
                      ...automation.actions.openingDM,
                      enabled: val,
                    },
                  },
                })
              }
              className={`${
                automation.actions.openingDM.enabled ? "bg-purple-600" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  automation.actions.openingDM.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </Switch>
          </div>

          {/* Show opening message details when enabled */}
          {automation.actions.openingDM.enabled && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <textarea
                placeholder="Enter opening message..."
                value={automation.actions.openingDM.message}
                onChange={(e) =>
                  setAutomation({
                    ...automation,
                    actions: {
                      ...automation.actions,
                      openingDM: {
                        ...automation.actions.openingDM,
                        message: e.target.value,
                      },
                    },
                  })
                }
                onClick={(e) => e.stopPropagation()}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />

              <div className="text-xs text-gray-400">{automation.actions.openingDM.message.length} / 640</div>

              {/* Opening Message Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Opening Buttons:</label>
                {automation.actions.openingDM.buttons.map((button, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                    <span className="text-sm text-gray-700 truncate">{button.text}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        editButton(index, "opening")
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Advanced Automations Card */}
        <div
          className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${
            activeStep === 4 ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"
          }`}
          onClick={() => setActiveStep(4)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                activeStep === 4 ? "bg-purple-600 text-white" : "bg-slate-800 text-white"
              }`}
            >
              4
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Advanced Automations</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ask to follow before sending DM</span>
              <Switch
                checked={automation.actions.askFollow}
                onChange={(val) =>
                  setAutomation({
                    ...automation,
                    actions: {
                      ...automation.actions,
                      askFollow: val,
                    },
                  })
                }
                className={`${
                  automation.actions.askFollow ? "bg-purple-600" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    automation.actions.askFollow ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </Switch>
            </div>

            {automation.actions.askFollow && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <textarea
                  placeholder="Enter follow request message..."
                  value={automation.actions.followMessage}
                  onChange={(e) =>
                    setAutomation({
                      ...automation,
                      actions: {
                        ...automation.actions,
                        followMessage: e.target.value,
                      },
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />

                <div className="text-xs text-gray-400">{automation.actions.followMessage.length} / 640</div>

                {/* Follow Buttons */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Follow Buttons:</label>
                  {automation.actions.followButtons.map((button, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                      <span className="text-sm text-gray-700 truncate">{button.text}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          editFollowButton(index)
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ask for emails in DMs</span>
              <Switch
                checked={automation.actions.askEmail}
                onChange={(val) =>
                  setAutomation({
                    ...automation,
                    actions: {
                      ...automation.actions,
                      askEmail: val,
                    },
                  })
                }
                className={`${
                  automation.actions.askEmail ? "bg-purple-600" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    automation.actions.askEmail ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </Switch>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">React with heart</span>
              <Switch
                checked={automation.actions.reactHeart}
                onChange={(val) =>
                  setAutomation({
                    ...automation,
                    actions: {
                      ...automation.actions,
                      reactHeart: val,
                    },
                  })
                }
                className={`${
                  automation.actions.reactHeart ? "bg-purple-600" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    automation.actions.reactHeart ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </Switch>
            </div>

            {/* Follow-up Message Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Send follow-up message</span>
              <Switch
                checked={automation.actions.followUp.enabled}
                onChange={(val) =>
                  setAutomation({
                    ...automation,
                    actions: {
                      ...automation.actions,
                      followUp: { ...automation.actions.followUp, enabled: val },
                    },
                  })
                }
                className={`${automation.actions.followUp.enabled ? "bg-purple-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.followUp.enabled ? "translate-x-6" : "translate-x-1"}`}
                />
              </Switch>
            </div>

            {automation.actions.followUp.enabled && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3 mt-3">
                <textarea
                  placeholder="Enter follow-up message..."
                  value={automation.actions.followUp.message}
                  onChange={(e) =>
                    setAutomation({
                      ...automation,
                      actions: {
                        ...automation.actions,
                        followUp: { ...automation.actions.followUp, message: e.target.value },
                      },
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <div className="text-xs text-gray-400">{automation.actions.followUp.message.length} / 640</div>
                
                {/* Delay selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Send after:</label>
                  <select
                    value={automation.actions.followUp.delay}
                    onChange={(e) =>
                      setAutomation({
                        ...automation,
                        actions: {
                          ...automation.actions,
                          followUp: { ...automation.actions.followUp, delay: parseInt(e.target.value) },
                        },
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="60000">1 minute</option>
                    <option value="300000">5 minutes</option>
                    <option value="600000">10 minutes</option>
                    <option value="1800000">30 minutes</option>
                    <option value="3600000">1 hour</option>
                    <option value="7200000">2 hours</option>
                    <option value="21600000">6 hours</option>
                    <option value="43200000">12 hours</option>
                    <option value="86400000">24 hours</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-4">
          {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "UPDATE FLOW" : "GO LIVE"}
        </Button>
      </div>
      {/* Mobile Edit Button (added) */}
      <div className="md:hidden fixed bottom-6 inset-x-0 flex justify-center z-[40]">
        <button
          onClick={() => setShowMobileDrawer(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg"
        >
          Edit
        </button>
      </div>

      {/* Mobile Bottom Drawer (added) */}
      <div
        className={`md:hidden fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-xl z-[70] transition-transform duration-300 ${showMobileDrawer ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "90vh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Story"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit Story</h2>
          <button onClick={() => setShowMobileDrawer(false)} className="text-gray-600" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(90vh-60px)] px-4 pb-6">
          {/* Step 1: Select a Story Card */}
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
              <h3 className="text-lg font-semibold text-gray-900">Select a Story</h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700">Any story</span>
              <Switch
                checked={true}
                onChange={() => {}}
                className="bg-gray-300 relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </Switch>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {stories.length === 0 ? (
                <div className="col-span-3 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-gray-500">No content</span>
                </div>
              ) : (
                stories.slice(0, 3).map((story: any) => (
                  <div
                    key={story.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setAutomation({ ...automation, storyId: story.id })
                    }}
                    className={`h-24 rounded-lg cursor-pointer overflow-hidden ring-2 ${
                      automation.storyId === story.id ? "ring-purple-500" : "ring-transparent"
                    }`}
                  >
                    <img
                      src={story.thumbnail_url || story.media_url}
                      alt="Story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowStoryModal(true)
              }}
              className="col-span-3 mt-3 text-sm text-purple-600 hover:underline"
            >
              Show More
            </button>
          </div>

          {/* Step 2: Setup Keywords Card */}
          <div
            className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${
              activeStep === 2 ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"
            }`}
            onClick={() => setActiveStep(2)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                  activeStep === 2 ? "bg-purple-600 text-white" : "bg-slate-800 text-white"
                }`}
              >
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Setup Keywords</h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700">Any keyword</span>
              <Switch
                checked={automation.trigger.anyReply}
                onChange={(val) => setAutomation({ ...automation, trigger: { ...automation.trigger, anyReply: val } })}
                className={`${
                  automation.trigger.anyReply ? "bg-purple-600" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    automation.trigger.anyReply ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </Switch>
            </div>

            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onFocus={() => setActiveStep(2)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && keywordInput.trim()) {
                  e.preventDefault()
                  if (!automation.trigger.keywords.includes(keywordInput.trim())) {
                    setAutomation({
                      ...automation,
                      trigger: {
                        ...automation.trigger,
                        keywords: [...automation.trigger.keywords, keywordInput.trim()],
                      },
                    })
                  }
                  setKeywordInput("")
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Type & Hit Enter to add Keyword"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />

            {automation.trigger.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {automation.trigger.keywords.map((word, i) => (
                  <div
                    key={i}
                    className="flex items-center bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full shadow-sm"
                  >
                    {word}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setAutomation({
                          ...automation,
                          trigger: {
                            ...automation.trigger,
                            keywords: automation.trigger.keywords.filter((k) => k !== word),
                          },
                        })
                      }}
                      className="ml-2 text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Send a DM Card */}
          <div
            className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${
              activeStep === 3 ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"
            }`}
            onClick={() => setActiveStep(3)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                  activeStep === 3 ? "bg-purple-600 text-white" : "bg-slate-800 text-white"
                }`}
              >
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Send a DM</h3>
            </div>

            {/* Main DM Composition Area */}
            <div className="border-2 border-purple-500 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              <textarea
                placeholder="Enter your message here..."
                value={automation.actions.sendDM.message}
                onChange={(e) =>
                  setAutomation({
                    ...automation,
                    actions: {
                      ...automation.actions,
                      sendDM: {
                        ...automation.actions.sendDM,
                        message: e.target.value,
                      },
                    },
                  })
                }
                onFocus={() => setActiveStep(3)}
                onClick={(e) => e.stopPropagation()}
                className="w-full border-0 outline-none text-sm min-h-[60px] resize-none mb-2"
              />

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{automation.actions.sendDM.message.length} / 640</span>
                <div className="flex items-center gap-1"></div>
              </div>

              {/* 🆕 Mobile Drawer - Image Upload Section */}
              <div className="mb-3">
                {automation.actions.sendDM.image_url ? (
                  <div className="relative">
                    <img
                      src={automation.actions.sendDM.image_url}
                      alt="Main DM Preview"
                      className="w-full rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage("dm")
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
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
                  </div>
                ) : (
                  <label className="w-full border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-lg p-4 cursor-pointer transition-colors flex flex-col items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "dm")}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                    {isUploadingImage ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Upload Image</span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                      </>
                    )}
                  </label>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingButton(null)
                  setShowLinkModal(true)
                }}
                className="w-full border border-purple-500 text-purple-600 py-2 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
                  <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
                </svg>
                Add Link
              </button>
            </div>

            {/* Main DM Buttons */}
            {automation.actions.sendDM.buttons.length > 0 && (
              <div className="space-y-2 mb-4">
                {automation.actions.sendDM.buttons.map((button, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm text-gray-700 truncate">{button.text}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          editButton(index, "dm")
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeDMButton(index)
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
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Opening Message Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700">Opening message</span>
              <Switch
                checked={automation.actions.openingDM.enabled}
                onChange={(val) =>
                  setAutomation({
                    ...automation,
                    actions: {
                      ...automation.actions,
                      openingDM: {
                        ...automation.actions.openingDM,
                        enabled: val,
                      },
                    },
                  })
                }
                className={`${
                  automation.actions.openingDM.enabled ? "bg-purple-600" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    automation.actions.openingDM.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </Switch>
            </div>

            {/* Show opening message details when enabled */}
            {automation.actions.openingDM.enabled && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <textarea
                  placeholder="Enter opening message..."
                  value={automation.actions.openingDM.message}
                  onChange={(e) =>
                    setAutomation({
                      ...automation,
                      actions: {
                        ...automation.actions,
                        openingDM: {
                          ...automation.actions.openingDM,
                          message: e.target.value,
                        },
                      },
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />

                <div className="text-xs text-gray-400">{automation.actions.openingDM.message.length} / 640</div>

                {/* Opening Message Buttons */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Opening Buttons:</label>
                  {automation.actions.openingDM.buttons.map((button, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                      <span className="text-sm text-gray-700 truncate">{button.text}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          editButton(index, "opening")
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Advanced Automations Card */}
          <div
            className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${
              activeStep === 4 ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"
            }`}
            onClick={() => setActiveStep(4)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                  activeStep === 4 ? "bg-purple-600 text-white" : "bg-slate-800 text-white"
                }`}
              >
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Advanced Automations</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Ask to follow before sending DM</span>
                <Switch
                  checked={automation.actions.askFollow}
                  onChange={(val) =>
                    setAutomation({
                      ...automation,
                      actions: {
                        ...automation.actions,
                        askFollow: val,
                      },
                    })
                  }
                  className={`${
                    automation.actions.askFollow ? "bg-purple-600" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      automation.actions.askFollow ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </Switch>
              </div>

              {automation.actions.askFollow && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <textarea
                    placeholder="Enter follow request message..."
                    value={automation.actions.followMessage}
                    onChange={(e) =>
                      setAutomation({
                        ...automation,
                        actions: {
                          ...automation.actions,
                          followMessage: e.target.value,
                        },
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />

                  <div className="text-xs text-gray-400">{automation.actions.followMessage.length} / 640</div>

                  {/* Follow Buttons */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Follow Buttons:</label>
                    {automation.actions.followButtons.map((button, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                        <span className="text-sm text-gray-700 truncate">{button.text}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            editFollowButton(index)
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Ask for emails in DMs</span>
                <Switch
                  checked={automation.actions.askEmail}
                  onChange={(val) =>
                    setAutomation({
                      ...automation,
                      actions: {
                        ...automation.actions,
                        askEmail: val,
                      },
                    })
                  }
                  className={`${
                    automation.actions.askEmail ? "bg-purple-600" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      automation.actions.askEmail ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">React with heart</span>
                <Switch
                  checked={automation.actions.reactHeart}
                  onChange={(val) =>
                    setAutomation({
                      ...automation,
                      actions: {
                        ...automation.actions,
                        reactHeart: val,
                      },
                    })
                  }
                  className={`${
                    automation.actions.reactHeart ? "bg-purple-600" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      automation.actions.reactHeart ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </Switch>
              </div>

              {/* 🆕 Mobile Drawer - Follow-up Message */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Send follow-up message</span>
                <Switch
                  checked={automation.actions.followUp.enabled}
                  onChange={(val) =>
                    setAutomation({
                      ...automation,
                      actions: {
                        ...automation.actions,
                        followUp: { ...automation.actions.followUp, enabled: val },
                      },
                    })
                  }
                  className={`${automation.actions.followUp.enabled ? "bg-purple-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.followUp.enabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </Switch>
              </div>

              {automation.actions.followUp.enabled && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <textarea
                    placeholder="Enter follow-up message..."
                    value={automation.actions.followUp.message}
                    onChange={(e) =>
                      setAutomation({
                        ...automation,
                        actions: {
                          ...automation.actions,
                          followUp: { ...automation.actions.followUp, message: e.target.value },
                        },
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <div className="text-xs text-gray-400">{automation.actions.followUp.message.length} / 640</div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Send after:</label>
                    <select
                      value={automation.actions.followUp.delay}
                      onChange={(e) =>
                        setAutomation({
                          ...automation,
                          actions: {
                            ...automation.actions,
                            followUp: { ...automation.actions.followUp, delay: parseInt(e.target.value) },
                          },
                        })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="60000">1 minute</option>
                      <option value="300000">5 minutes</option>
                      <option value="600000">10 minutes</option>
                      <option value="1800000">30 minutes</option>
                      <option value="3600000">1 hour</option>
                      <option value="7200000">2 hours</option>
                      <option value="21600000">6 hours</option>
                      <option value="43200000">12 hours</option>
                      <option value="86400000">24 hours</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-4">
            {isSubmitting ? "Saving..." : "GO LIVE"}
          </Button>
        </div>
      </div>

      {/* Story Selection Modal */}
      {/* Story Selection Modal */}
<Dialog open={showStoryModal} onClose={() => setShowStoryModal(false)} className="relative z-[80]">
  <div className="fixed inset-0 bg-black/40" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
      <h2 className="text-lg font-semibold mb-4">Select Story</h2>

      {/* Close button */}
      <button
        onClick={() => setShowStoryModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ✕
      </button>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto">
        {stories.map((story: any) => (
          <div
            key={story.id}
            onClick={() => setAutomation({ ...automation, storyId: story.id })}
            className={`relative h-24 bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 ${
              automation.storyId === story.id ? "border-purple-600" : "border-transparent"
            }`}
          >
            <img
              src={story.thumbnail_url || story.media_url}
              alt="Story"
              className="w-full h-full object-cover"
            />
            {automation.storyId === story.id && (
              <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs rounded-full p-1">✓</div>
            )}
          </div>
        ))}
      </div>

      <Button onClick={() => setShowStoryModal(false)} className="mt-4 w-full">
        Confirm Selection
      </Button>
    </div>
  </div>
</Dialog>

{/* Main DM Link Modal */}
<Dialog open={showLinkModal} onClose={() => setShowLinkModal(false)} className="relative z-[80]">
  <div className="fixed inset-0 bg-black/40" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
      <h2 className="text-lg font-semibold mb-4">{editingButton ? "Edit Link" : "Add Link"}</h2>

      {/* Close button */}
      <button
        onClick={() => setShowLinkModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ✕
      </button>

      <input
        type="text"
        placeholder="Button Text"
        value={buttonText}
        onChange={(e) => setButtonText(e.target.value)}
        className="w-full mb-3 border border-gray-300 rounded px-3 py-1.5 text-sm"
      />
      <input
        type="text"
        placeholder="Paste your link"
        value={link}
        onChange={(e) => {
          setLink(e.target.value)
          setValidLink(validateLink(e.target.value))
        }}
        className={`w-full mb-2 border ${validLink ? "border-gray-300" : "border-red-500"} rounded px-3 py-1.5 text-sm`}
      />
      {!validLink && <p className="text-red-500 text-xs mb-2">Please enter a valid link (https://…)</p>}

      <Button
        onClick={() => {
          if (validateLink(link) && buttonText.trim()) {
            if (editingButton) {
              saveEditedButton()
            } else {
              setAutomation({
                ...automation,
                actions: {
                  ...automation.actions,
                  sendDM: {
                    ...automation.actions.sendDM,
                    buttons: [...automation.actions.sendDM.buttons, { text: buttonText, link }],
                  },
                },
              })
              setShowLinkModal(false)
              setLink("")
              setButtonText("")
            }
          }
        }}
        disabled={!buttonText.trim() || !validLink}
        className="w-full"
      >
        {editingButton ? "Update" : "Save"}
      </Button>
    </div>
  </div>
</Dialog>

{/* Opening DM Link Modal */}
<Dialog open={showOpeningLinkModal} onClose={() => setShowOpeningLinkModal(false)} className="relative z-[80]">
  <div className="fixed inset-0 bg-black/40" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
      <h2 className="text-lg font-semibold mb-4">Edit Opening Button</h2>

      {/* Close button */}
      <button
        onClick={() => setShowOpeningLinkModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ✕
      </button>

      <input
        type="text"
        placeholder="Button Text"
        value={openingButtonText}
        onChange={(e) => setOpeningButtonText(e.target.value)}
        className="w-full mb-3 border border-gray-300 rounded px-3 py-1.5 text-sm"
      />

      <Button
        onClick={() => {
          if (validateLink(openingLink) && openingButtonText.trim()) {
            saveEditedOpeningButton()
          }
        }}
        disabled={!openingButtonText.trim() || !validOpeningLink}
        className="w-full"
      >
        Update
      </Button>
    </div>
  </div>
</Dialog>

{/* Follow Button Modal */}
<Dialog open={showFollowButtonModal} onClose={() => setShowFollowButtonModal(false)} className="relative z-[80]">
  <div className="fixed inset-0 bg-black/40" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
      <h2 className="text-lg font-semibold mb-4">
        {editingFollowButton !== null ? "Edit Follow Button" : "Add Follow Button"}
      </h2>

      {/* Close button */}
      <button
        onClick={() => setShowFollowButtonModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ✕
      </button>

      <input
        type="text"
        placeholder="Button Text (e.g., Visit Profile, I'm following)"
        value={followButtonText}
        onChange={(e) => setFollowButtonText(e.target.value)}
        className="w-full mb-3 border border-gray-300 rounded px-3 py-1.5 text-sm"
      />

      <Button
        onClick={() => {
          if (followButtonText.trim()) {
            if (editingFollowButton !== null) {
              saveEditedFollowButton()
            } else {
              setAutomation({
                ...automation,
                actions: {
                  ...automation.actions,
                  followButtons: [
                    ...automation.actions.followButtons,
                    { text: followButtonText, type: "profile" },
                  ],
                },
              })
              setShowFollowButtonModal(false)
              setFollowButtonText("")
            }
          }
        }}
        disabled={!followButtonText.trim()}
        className="w-full"
      >
        {editingFollowButton !== null ? "Update" : "Save"}
      </Button>
    </div>
  </div>
</Dialog>

    </div>
  )

}
