"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { Switch } from "@headlessui/react"
import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast, Toaster } from "sonner"


import Image from "next/image"

// Public Reply Templates Pool
const PUBLIC_REPLY_TEMPLATES = [
  // Short & Natural (Professional + Clean)
  "Sent to your DMs.",
  "Check your inbox.",
  "Just DMed you.",
  "Sent you the details in DM.",
  "Dropped you a message.",
  "Check your DMs.",
  "Message sent.",
  "Sent everything to your inbox.",
  "Replied to you in DMs.",
  "Take a look at your DMs.",
  
  // Friendly / Conversational
  "Just messaged you — check it out!",
  "DMed you all the info.",
  "Sent you something in your DMs — let's talk there!",
  "Hey! Just dropped the details in your inbox.",
  "You got a message from us!",
  "Just sent you the info privately.",
  "DMed you the full details — check it out.",
  "Sent you a quick message, take a look.",
  "Check your inbox, just sent it!",
  "Shared the details with you via DM.",
  
  // Professional / Brand Tone
  "We've shared the details via DM.",
  "Kindly check your DMs for more info.",
  "Details have been sent to your inbox.",
  "Please check your direct messages for assistance.",
  "Sent the info privately to your DMs.",
  "Our team has reached out via DM.",
  "Please review the message we sent you.",
  "Shared everything you need in your inbox.",
  "Sent you the requested details in DM.",
  "Kindly check your DMs to continue.",
  
  // Casual / Creator Vibe
  "check ur DMs 👀",
  "just slid into ur inbox 😏",
  "sent u the deets 👌",
  "hit you up in DMs 🔥",
  "peep ur DMs fr 💬",
  "dm'd you real quick 😎",
  "just dropped the info in ur inbox 📩",
  "check messages, got you 😉",
  "slid a msg your way 👀",
  "sent it over, check DMs ✨",
  
  // Friendly & Chill (Creator Tone)
  "just messaged you, let's talk there 🤝",
  "dm'd you the stuff you asked for 🙌",
  "look in ur DMs — I got you 😌",
  "sent everything there, take a peek 👇",
  "yo check ur inbox 👋",
  "replied in DMs, let's go 🚀",
  "all set — check your DMs 🔥",
  "sent the details, lmk what u think 👀",
  "dm check time 😁",
  "dropped a msg — see u there 💬",
  
  // Mixed & Smart Replies
  "Just sent it your way — check your DMs 📬",
  "Reached out privately, check messages 💬",
  "Sent all the info you need via DM 🙌",
  "DM'd you — let's continue there 🤝",
  "Dropped the full details in your inbox ✉️",
  "Check your DMs for the next step 🚀",
  "All set — details waiting in your inbox 👀",
  "DM sent, take a quick look 👇",
  "Hit your inbox with the info 😎",
  "Sent the message — talk soon 💬",
]

// Function to get 3 random unique replies
function getRandomPublicReplies(count: number = 3): { text: string; enabled: boolean }[] {
  const shuffled = [...PUBLIC_REPLY_TEMPLATES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count).map(text => ({ text, enabled: true }))
}

interface InstagramPost {
  id: string
  thumbnail: string
  type: string
  caption: string
  permalink: string
}

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

type DMButton = { text: string; link: string }
type FollowButton = { text: string; type: "profile" | "confirm" }

export default function PostDMBuilder() {
  const params = useParams()
  const wsid = params.wsid as string
  const searchParams = useSearchParams()
  const automationId = searchParams.get("edit")
  const isEditMode = !!automationId

  const [showDrawer, setShowDrawer] = useState(false)
  // Mobile drawer state (added)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)


  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostModal, setShowPostModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showFollowButtonModal, setShowFollowButtonModal] = useState(false)
  const [showOpeningLinkModal, setShowOpeningLinkModal] = useState(false)
  const [showPublicReplyModal, setShowPublicReplyModal] = useState(false)
  const [editingPublicReply, setEditingPublicReply] = useState<number | null>(null)
  const [publicReplyText, setPublicReplyText] = useState("")
  const [link, setLink] = useState("")
  const [buttonText, setButtonText] = useState("")
  const [followButtonText, setFollowButtonText] = useState("")
  const [openingButtonText, setOpeningButtonText] = useState("")
  const [openingLink, setOpeningLink] = useState("")
  const [validLink, setValidLink] = useState(true)
  const [validOpeningLink, setValidOpeningLink] = useState(true)
  const [activeStep, setActiveStep] = useState(1)
  const [editingButton, setEditingButton] = useState<{ index: number; type: "dm" | "opening" } | null>(null)
  const [editingFollowButton, setEditingFollowButton] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingOpeningImage, setIsUploadingOpeningImage] = useState(false)
    const router = useRouter()

  // Feature flags
  const ENABLE_OPENING_DM_IMAGE = false // 🚫 Temporarily disabled for testing

  const [isTokenValid, setIsTokenValid] = useState(false)
  const [tokenChecked, setTokenChecked] = useState(false)
  const [isNextPost, setIsNextPost] = useState(false) // NEW: Track if this is a "Next Post" automation

  const [automation, setAutomation] = useState<{
    trigger: { anyReply: boolean; keywords: string[] }
    actions: {
      sendDM: { message: string; buttons: DMButton[]; image_url?: string }
      openingDM: { enabled: boolean; message: string; buttons: DMButton[]; image_url?: string }
      publicReply: { enabled: boolean; replies: { text: string; enabled: boolean }[] }
      askFollow: boolean
      askEmail: boolean
      reactHeart: boolean
      followMessage: string
      followButtons: FollowButton[]
      followUp: { enabled: boolean; message: string; delay: number } // 🆕 Follow-up message
    }
    postId: string | null
    isNextPost?: boolean // NEW: Flag for next post automations
  }>({
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
      publicReply: {
        enabled: false,
        replies: [
          { text: "Dropped it in for you 📦✨", enabled: true },
          { text: "Please check your DM's ✅✨", enabled: true },
          { text: "Sent your way ❤️📬", enabled: true },
        ],
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
    postId: null,
  })

  const [keywordInput, setKeywordInput] = useState("")

  // Map API automation format back to builder-friendly state
  const normalizeAutomationFromApi = (apiAutomation: any) => {
    const mapButtonsBack = (buttons: any[] = []): DMButton[] =>
      buttons.map((b): DMButton => {
        if (b?.type === "web_url") {
          return { text: b.title || "", link: b.url || "" }
        }
        // postback or others => keep text, no link
        return { text: b?.title || "", link: "" }
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
        publicReply: {
          enabled: apiAutomation?.actions?.publicReply?.enabled || false,
          replies: apiAutomation?.actions?.publicReply?.replies || [],
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
      postId: apiAutomation?.selectedPost || null,
    }
  }

  // Load existing automation in edit mode
  useEffect(() => {
    if (!isEditMode || !automationId) return
    const load = async () => {
      try {
        const resp = await axios.get(`/api/automations/${automationId}`)
        if (resp.data?.success && resp.data?.automation) {
          const normalized = normalizeAutomationFromApi(resp.data.automation)
          setAutomation(normalized)
          
          // Set isNextPost flag if this is a Next Post automation
          if (resp.data.automation?.isNextPost || resp.data.automation?.selectedPost === "NEXT_POST") {
            setIsNextPost(true)
          }
        }
      } catch (e: unknown) {
        const err = e as any
        console.error("Failed to load automation for edit", err)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, automationId])

   useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axios.get("/api/auth/me")
        if (response.data && response.data._id) {
          setIsTokenValid(true)
        } else {
          router.push("/")
        }
      } catch (error: any) {
        console.log(" Token validation failed:", error.message)
        router.push("/")
      } finally {
        setTokenChecked(true)
      }
    }

    validateToken()
  }, [router])


useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/workspaces/${wsid}/user`)

        if (response.status === 403 || response.status === 401) {
          window.location.href = "/"
          return
        }

        if (response.data?.success && response.data?.user) {
          const userData = response.data.user
          setUserProfile(userData)
          setPosts(userData.thumbnails || [])
        } else {
          setPosts([])
          setUserProfile(null)
        }
      } catch (error: any) {
        console.error("[v0] Failed to fetch user data:", error.message)
        if (error.response?.status === 401 || error.response?.status === 403) {
          window.location.href = "/"
          return
        }
        setPosts([])
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }

    if (isTokenValid) {
      fetchUserData()
    }
  }, [wsid, isTokenValid])

  const validateLink = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Handle image upload for main DM
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

      console.log("Submitting automation:", automation)

      // ✅ Feature 3: Validate DM message is entered
      if (!automation.actions.sendDM.message.trim()) {
        toast.error("Missing DM Message", {
          description: "Please enter a DM message before going live.",
        })
        setIsSubmitting(false)
        return
      }

      // ✅ Feature 3: Validate post selection (either specific post or next post)
      if (!isNextPost && !automation.postId) {
        toast.error("No Post Selected", {
          description: "Please select a post or enable 'Next Post' mode before going live.",
        })
        setIsSubmitting(false)
        return
      }

      console.log(" Making API call to:", `/api/workspaces/${wsid}/automations`)

      const automationData = {
        ...automation,
        type: "comment_reply_flow",
        postId: isNextPost ? "NEXT_POST" : automation.postId,
        isNextPost: isNextPost,
      }

      console.log("📤 Sending automation data with image URLs:", {
        sendDM_image: automationData.actions.sendDM.image_url,
        openingDM_image: automationData.actions.openingDM.image_url,
      })

      let response
      if (isEditMode && automationId) {
        response = await axios.put(`/api/automations/${automationId}`, automationData)
      } else {
        response = await axios.post(`/api/workspaces/${wsid}/automations`, automationData)
      }

      console.log("API response:", response.data)

      if (response.data.success) {
         toast.success(`Automation ${isEditMode ? "Updated" : "Saved"} Successfully`, {
        description: isEditMode
          ? "Your automation changes have been saved successfully."
          : isNextPost 
            ? "Your Next Post automation is ready! It will activate when you post new content."
            : "Your new automation has been created and activated.",
      })
        // Optionally redirect or reset form
          if (!isEditMode) {
        setTimeout(() => router.push(`/${wsid}/automations`), 1500)
      }
      }

        
      else {
        console.error(" API returned error:", response.data.error)
        toast.error(`Failed to ${isEditMode ? "Update" : "Save"} Automation`, {
        description: "Something went wrong. Please try again.",
      })
      }
    } catch (error: unknown) {
      console.error(" Error saving automation:", error)
      const anyErr = error as any
      if (anyErr?.response) {
        console.error("Response error:", anyErr.response.status, anyErr.response.data)
      }
      alert("Failed to save automation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get selected post
  const selectedPost = posts.find((p) => p.id === automation.postId)

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

  const removeFollowButton = (index: number) => {
    setAutomation({
      ...automation,
      actions: {
        ...automation.actions,
        followButtons: automation.actions.followButtons.filter((_, i) => i !== index),
      },
    })
  }

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

  const editFollowButton = (index: number) => {
    const button = automation.actions.followButtons[index]
    setFollowButtonText(button.text)
    setEditingFollowButton(index)
    setShowFollowButtonModal(true)
  }

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

  const renderMobilePreview = () => {
    if (activeStep === 1 || activeStep === 2) {
      return (
        <div className="relative flex flex-col h-full text-white text-sm px-3 pt-[65px] pb-[80px]">
          {/* Top Bar */}
          <div className="absolute top-[30px] left-0 w-full px-4 flex items-center justify-center z-20">
            <div className="absolute left-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-base font-semibold text-white">Posts</h1>
            <div className="absolute right-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               
              </svg>
            </div>
          </div>

          {/* User Profile Header */}
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-600">
              {userProfile?.profilePictureUrl ? (
                <img
                  src={userProfile.profilePictureUrl || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600" />
              )}
            </div>
            <span className="font-medium text-white text-sm">@{userProfile?.username || "username"}</span>
            <div className="ml-auto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2" />
                <circle cx="19" cy="12" r="1" stroke="currentColor" strokeWidth="2" />
                <circle cx="5" cy="12" r="1" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Selected Post or Placeholder */}
{/* Selected Post or Placeholder */}
{selectedPost ? (
  <div className="flex-1 bg-black rounded-lg overflow-hidden flex flex-col">
    {/* Post Image */}
    <AspectRatio ratio={19 / 19} className="bg-black rounded-none">
      <img
        src={selectedPost.thumbnail || "/placeholder.svg"}
        alt="Selected Post"
        className="h-full w-full object-cover"
      />
    </AspectRatio>

    {/* Action Icons (always visible) */}
    <div className="flex items-center justify-between px-2 mt-2 shrink-0">
      <div className="flex gap-2">
        <Image src="/qa_love_icon.svg" alt="Like" width={20} height={20} className="w-6 h-5" />
        <Image src="/qa_comment_icon.svg" alt="Comment" width={20} height={20} className="w-6 h-5" />
        <Image src="/qa_message_icon.svg" alt="Share" width={20} height={20} className="w-6 h-5" />
      </div>
      <Image src="/qa_bookmark_icon.svg" alt="Save" width={20} height={20} className="w-6 h-5" />
    </div>

    {/* Caption Area (scrollable, hidden scrollbar) */}
    <div className="px-2 mt-1 flex-1 overflow-y-auto scrollbar-hide">
      <p className="text-white/90 text-xs leading-snug">
        <span className="font-semibold">{userProfile?.username || "username"}</span>{" "}
        {selectedPost.caption || "Post caption..."}
      </p>

      <button
        onClick={() => setShowDrawer(true)}
        className="block mt-1 text-white/70 hover:text-white transition text-xs"
      >
        View all comments
      </button>
    </div>
  </div>
) : (
  <div className="flex-1 bg-black rounded-lg overflow-hidden flex flex-col">
    {/* Placeholder Image */}
    <AspectRatio ratio={19 / 19} className="bg-black rounded-none">
      <img
        src="/placeholder.svg"
        alt="Placeholder"
        className="h-full w-full object-cover opacity-60"
      />
    </AspectRatio>

    {/* Action Icons */}
    <div className="flex items-center justify-between px-2 mt-2 shrink-0">
      <div className="flex gap-2">
        <Image src="/qa_love_icon.svg" alt="Like" width={20} height={20} className="w-6 h-5" />
        <Image src="/qa_comment_icon.svg" alt="Comment" width={20} height={20} className="w-6 h-5" />
        <Image src="/qa_message_icon.svg" alt="Share" width={20} height={20} className="w-6 h-5" />
      </div>
      <Image src="/qa_bookmark_icon.svg" alt="Save" width={20} height={20} className="w-6 h-5" />
    </div>

    {/* Placeholder Caption */}
    <div className="px-2 mt-1 flex-1 overflow-y-auto scrollbar-hide">
      <p className="text-white/50 text-xs leading-snug">
        You haven’t picked a post yet
      </p>
    </div>
  </div>
)}

              {/* Comments Drawer */}
              {showDrawer && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-40" onClick={() => setShowDrawer(false)} />
              )}

              <div
                className={`absolute left-0 w-full z-50 bg-[#262624] rounded-t-[30px] px-4 py-3 transition-all duration-300 ease-in-out ${
                  showDrawer ? 'bottom-0' : '-bottom-[100%]'
                }`}
                style={{ height: '50%' }}
              >
                <div className="text-center mb-2">
                  <h2 className="text-base font-semibold text-white">Comments</h2>
                  <hr className="border-white/30 mt-2 w-[80px] mx-auto" />
                </div>

                <div className="overflow-y-auto mb-2 h-[48%] pr-1 space-y-2">
                  <p className="text-sm text-white">
                    <span className="font-semibold">User</span> Leaves a Comment!
                  </p>
                  <p className="text-sm text-white">
                    <span className="font-semibold">{userProfile?.username || "username"}</span> Awesome design 💜
                  </p>
                   
                </div>

                <div className="w-full mb-2">
                  <Image src="/qa_reactions_icon.svg" alt="Reactions" width={1000} height={24} className="w-full h-auto" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 rounded-full bg-[#222] text-white px-3 py-1 text-sm placeholder-gray-300 outline-none border border-white"
                  />
                </div>
              </div>


              {/* Bottom Nav */}
              <div className="absolute bottom-6 left-0 w-full px-4 py-1 bg-black z-10">
                <div className="flex justify-between items-center">
                  <Image src="/qa_home_icon.svg" alt="Home" width={20} height={24} />
                  <Image src="/qa_search_icon.svg" alt="Search" width={20} height={24} />
                  <Image src="/qa_add_icon.svg" alt="Add" width={20} height={24} />
                  <Image src="/qa_reel_icon.svg" alt="Reels" width={20} height={24} />
                  <Image src={userProfile?.profilePictureUrl || "/placeholder.svg"}alt="Profile" width={20} height={24} className="rounded-full object-cover" />
                </div>
              </div>

              {/* iOS Home Bar */}
               <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2">
                 <div className="w-[120px] h-[4px] bg-white/70 rounded-full" />
              </div>
            
        </div>
      )
    }

    if (activeStep >= 3) {
      const selectedPost = posts.find((p) => p.id === automation.postId)

      return (
        <div className="relative flex flex-col h-full text-white text-sm px-3 pt-[65px] pb-[80px]">
          {/* DM Header */}
          <div className="absolute top-[30px] left-0 w-full px-4 flex items-center justify-center z-20">
            <div className="absolute left-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={userProfile?.profilePictureUrl || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-medium">@{userProfile?.username || "username"}</span>
            </div>
          </div>

          {/* DM Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mt-4 px-1 pb-28 scrollbar-hide">
            {/* User comment */}
            
            

            {/* Opening DM message - if enabled */}
            {automation.actions.openingDM.enabled && automation.actions.openingDM.message && (
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
                      {automation.actions.openingDM.image_url && (
                        <img
                          src={automation.actions.openingDM.image_url}
                          alt="Opening DM"
                          className="w-full rounded-lg mb-1.5"
                        />
                      )}
                      <span className="text-white text-[10px] leading-tight">
                        {automation.actions.openingDM.message}
                      </span>
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

                {automation.actions.openingDM.buttons.length > 0 && (
                  <div className="flex justify-end">
                    <div className="bg-purple-600 rounded-2xl px-3 py-1.5 max-w-[140px]">
                      <span className="text-white text-[10px]">{automation.actions.openingDM.buttons[0]?.text}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Ask Follow message - if enabled */}
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

                <div className="flex justify-end">
                  <div className="bg-purple-600 rounded-2xl px-3 py-1.5 max-w-[140px]">
                    <span className="text-white text-[10px]">
                      {automation.actions.followButtons.find((b) => b.type === "confirm")?.text || "I'm following ✅"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Main Send DM message - Always shows */}
            {automation.actions.sendDM.message && (
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
                      {automation.actions.sendDM.image_url && (
                        <img
                          src={automation.actions.sendDM.image_url}
                          alt="Main DM"
                          className="w-full rounded-lg mb-1.5"
                        />
                      )}
                      <span className="text-white text-[10px] leading-tight">{automation.actions.sendDM.message}</span>
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

                
              </>
            )}
          </div>

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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Toaster position="top-center" richColors closeButton />
  {/* <p className="mb-2 ml-2 text-gray-700 font-semibold">Preview:</p> */}
 {/* Left: Mobile Preview */}
<div className="flex items-center justify-center w-full md:w-[calc(100%-450px)] bg-gray-100">

  <div className="relative w-full max-w-sm aspect-[360/520] md:translate-x-26">
    <Image
      src="/mobile-frame.png"
      alt="Phone Frame"
      fill
      className="object-contain z-[40] pointer-events-none select-none"
      priority
    />
    <div className="absolute top-[2.5%] left-[18.6%] w-[63%] h-[95.5%] rounded-[30px] overflow-hidden bg-black z-10 shadow-inner">
      {renderMobilePreview()}
    </div>
  </div>
</div>



      {/* Right Sidebar with Card Layout - DESKTOP VIEW */}
      <div className="hidden md:block w-[500px] border-l border-gray-200 bg-gray-50 px-4 py-6 overflow-y-scroll flex-shrink-0 space-y-4" style={{ scrollBehavior: 'auto' }}>
        {/* Step 1: Select a Post Card - DESKTOP VIEW */}
        <h2 className="text-gray-800 text-base">Setup Comment to DM Flow :</h2>
        <div
          className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer transition-all ${activeStep === 1 ? "border-gray-500 ring-2 ring-gray-200" : "border-gray-200"}`}
          onClick={() => setActiveStep(1)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${activeStep === 1 ? "bg-slate-800 text-white" : "bg-slate-800 text-white"}`}
            >
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Select a Post</h3>
          </div>

          {/* Next Post Toggle */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">⚡ Next Post</span>
              <span className="text-xs text-gray-600">Create automation before posting</span>
            </div>
            <Switch
              checked={isNextPost}
              onChange={(val) => {
                setIsNextPost(val)
                if (val) {
                  // Clear post selection when enabling Next Post
                  setAutomation({ ...automation, postId: "NEXT_POST", isNextPost: true })
                } else {
                  setAutomation({ ...automation, postId: null, isNextPost: false })
                }
              }}
              className={`${isNextPost ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isNextPost ? "translate-x-6" : "translate-x-1"}`}
              />
            </Switch>
          </div>

          {!isNextPost && (
            <>
              <div className="flex items-center justify-between mb-4">
                 <span className=" font-semibold text-gray-800">Choose a Post :</span>
                {/* <Switch
                  checked={true}
                  onChange={() => {}}
                  className="bg-gray-300 relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                </Switch> */}
              </div> 
            </>
          )}

          {!isNextPost && (
            <div className="mt-4 grid grid-cols-3 gap-2">
            {posts.length === 0 ? (
              <div className="col-span-3 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-500">No content</span>
              </div>
            ) : (
              posts.slice(0, 3).map((post: InstagramPost) => (
                <div
                  key={post.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setAutomation({ ...automation, postId: post.id, isNextPost: false })
                  }}
                  className={`h-24 rounded-lg cursor-pointer overflow-hidden ring-2 ${automation.postId === post.id ? "ring-blue-500" : "ring-transparent"}`}
                >
                  <img src={post.thumbnail || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
                </div>
              ))
            )}
          </div>
          )}

          {!isNextPost && (
            <Button
            onClick={(e) => {
              e.stopPropagation()
              setShowPostModal(true)
            }}
            className="col-span-3 bg-transparent mt-3 w-full text-black text-sm hover:bg-transparent border border-gray-300"
          >
            Show More
          </Button>
          )}

          {isNextPost && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                ✅ <strong>Next Post automation ready!</strong>
              </p>
              <p className="text-xs text-gray-600">
                This automation will automatically activate when you post new content to Instagram.
              </p>
            </div>
          )}
        </div>

         

        {/* Step 2: Setup Keywords Card */}
        <div
          className={`bg-white rounded-lg  p-4 shadow-sm cursor-pointer transition-all ${activeStep === 2 ? "border-gray-800 ring-2 ring-gray-100" : "border-gray-800"}`}
          onClick={() => setActiveStep(2)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${activeStep === 2 ? "bg-gray-800 text-white" : "bg-slate-800 text-white"}`}
            >
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Add Keywords</h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700">Any keyword</span>
            <Switch
              checked={automation.trigger.anyReply}
              onChange={(val) => setAutomation({ ...automation, trigger: { ...automation.trigger, anyReply: val } })}
              className={`${automation.trigger.anyReply ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.trigger.anyReply ? "translate-x-6" : "translate-x-1"}`}
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
                
                // ✅ Feature 2: Check if "Any keyword" mode is enabled
                if (automation.trigger.anyReply) {
                  toast.error("Already in Any Keyword Mode", {
                    description: "Turn off 'Any keyword' to add specific keywords",
                  })
                  setKeywordInput("")
                  return
                }
                
                if (!automation.trigger.keywords.includes(keywordInput.trim())) {
                  setAutomation({
                    ...automation,
                    trigger: { ...automation.trigger, keywords: [...automation.trigger.keywords, keywordInput.trim()] },
                  })
                }
                setKeywordInput("")
              }
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Type & Hit Enter to add Keyword"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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

        <div
          className={`bg-white rounded-lg  p-4 shadow-sm cursor-pointer transition-all ${activeStep === 3 ? "border-gray-800 ring-2 ring-gray-100" : "border-gray-200"}`}
          onClick={() => setActiveStep(3)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${activeStep === 3 ? "bg-slate-800 text-white" : "bg-slate-800 text-white"}`}
            >
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Send DM Message</h3>
          </div>

          {/* Main DM Composition Area */}
          <div className="border-2 border-gray-200 rounded-lg p-4 mb-4">
            <textarea
              placeholder="Enter your message here..."
              value={automation.actions.sendDM.message}
              onChange={(e) => {
                const newMessage = e.target.value;
                if (newMessage.length > 1000) {
                  toast.error("Message too long", {
                    description: "Main DM message cannot exceed 1000 characters",
                  });
                  return;
                }
                setAutomation({
                  ...automation,
                  actions: { ...automation.actions, sendDM: { ...automation.actions.sendDM, message: newMessage } },
                });
              }}
              onFocus={() => setActiveStep(3)}
              onClick={(e) => e.stopPropagation()}
              className="w-full border-0 outline-none text-sm min-h-[120px] resize-y mb-2"
              maxLength={1000}
            />

            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs ${automation.actions.sendDM.message.length > 1000 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                {automation.actions.sendDM.message.length} / 1000
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditingButton(null)
                setShowLinkModal(true)
              }}
              className="w-full border border-gray-300 text-gray-800 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
              </svg>
              Add Link
            </button>

            {/* Image Upload Section */}
            <div className="mt-3">
              {automation.actions.sendDM.image_url ? (
                <div className="relative">
                  <img
                    src={automation.actions.sendDM.image_url}
                    alt="DM Preview"
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
                <label className="w-full border-2 border-dashed border-gray-300 hover:border-gray-500 rounded-lg p-4 cursor-pointer transition-colors flex flex-col items-center gap-2">
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
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
                  actions: { ...automation.actions, openingDM: { ...automation.actions.openingDM, enabled: val } },
                })
              }
              className={`${automation.actions.openingDM.enabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.openingDM.enabled ? "translate-x-6" : "translate-x-1"}`}
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
                      openingDM: { ...automation.actions.openingDM, message: e.target.value },
                    },
                  })
                }
                onClick={(e) => e.stopPropagation()}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[120px] resize-y focus:outline-none"
              />

              <div className="text-xs text-gray-400">{automation.actions.openingDM.message.length} / 640</div>

              {/* Opening DM Image Upload Section */}
              {/*}
              <div className="mt-3">
                {automation.actions.openingDM.image_url ? (
                  <div className="relative">
                    <img
                      src={automation.actions.openingDM.image_url}
                      alt="Opening DM Preview"
                      className="w-full rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage("opening")
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
                      onChange={(e) => handleImageUpload(e, "opening")}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden"
                      disabled={isUploadingOpeningImage}
                    />
                    {isUploadingOpeningImage ? (
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
              */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Opening Buttons:</label>
                {automation.actions.openingDM.buttons.map((button, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                    <span className="text-sm text-gray-700 truncate">{button.text}</span>
                    <div className="flex items-center gap-2">
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
                  </div>
                ))}

                 
              </div>
            </div>
          )}
        </div>

        <div
            className={`bg-white rounded-lg  p-4 shadow-sm cursor-pointer transition-all ${activeStep === 4? "border-gray-800 ring-2 ring-gray-100" : "border-gray-200"}`}
          onClick={() => setActiveStep(4)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${activeStep === 4 ? "bg-gray-800 text-white" : "bg-slate-800 text-white"}`}
            >
              4
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Advanced Automations</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Smart engagement automations</p>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Publicly reply to comments</span>
                <Switch
                  checked={automation.actions.publicReply.enabled}
                  onChange={(val) => {
                    // Generate new random replies when toggling on
                    const newReplies = val ? getRandomPublicReplies(3) : automation.actions.publicReply.replies
                    
                    setAutomation({
                      ...automation,
                      actions: {
                        ...automation.actions,
                        publicReply: { 
                          enabled: val,
                          replies: newReplies
                        },
                      },
                    })
                  }}
                  className={`${automation.actions.publicReply.enabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.publicReply.enabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </Switch>
              </div>

              {automation.actions.publicReply.enabled && (
                <div className="bg rounded-lg p-4 space-y-3 border border-blue-100">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        {/* <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg> */}
                      
                      </label>
                      {/* <span className="text-xs text-blue-600 font-medium">{automation.actions.publicReply.replies.filter(r => r.enabled).length} Active</span> */}
                    </div>
                    {automation.actions.publicReply.replies.map((reply, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:border-blue-300 transition-all group">
                        <div className="flex items-start gap-3">
                          <Switch
                            checked={reply.enabled}
                            onChange={(val) => {
                              const updatedReplies = [...automation.actions.publicReply.replies]
                              updatedReplies[index].enabled = val
                              setAutomation({
                                ...automation,
                                actions: {
                                  ...automation.actions,
                                  publicReply: { ...automation.actions.publicReply, replies: updatedReplies },
                                },
                              })
                            }}
                            className={`${reply.enabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 mt-0.5`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${reply.enabled ? "translate-x-5" : "translate-x-1"}`}
                            />
                          </Switch>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 break-words leading-relaxed whitespace-pre-wrap">{reply.text}</p>
                            <span className="text-xs text-gray-400 mt-1 inline-block">{reply.text.length} chars</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingPublicReply(index)
                              setPublicReplyText(reply.text)
                              setShowPublicReplyModal(true)
                            }}
                            className="text-gray-400 hover:text-gray-700transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                          >
                            <svg
                              width="18"
                              height="18"
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
                      </div>
                    ))}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingPublicReply(null)
                        setPublicReplyText("")
                        setShowPublicReplyModal(true)
                      }}
                      className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
                        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Add Public Reply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ask to follow before sending DM</span>
              <Switch
                checked={automation.actions.askFollow}
                onChange={(val) => setAutomation({ ...automation, actions: { ...automation.actions, askFollow: val } })}
                className={`${automation.actions.askFollow ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.askFollow ? "translate-x-6" : "translate-x-1"}`}
                />
              </Switch>
            </div>

            {automation.actions.askFollow && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <textarea
                  placeholder="Enter follow request message..."
                  value={automation.actions.followMessage}
                  onChange={(e) =>
                    setAutomation({ ...automation, actions: { ...automation.actions, followMessage: e.target.value } })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />

                <div className="text-xs text-gray-400">{automation.actions.followMessage.length} / 640</div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Follow Buttons:</label>
                  {automation.actions.followButtons.map((button, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                      <span className="text-sm text-gray-700 truncate">{button.text}</span>
                      <div className="flex items-center gap-2">
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
                    </div>
                  ))}
                </div>
              </div>
            )}


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
                className={`${automation.actions.followUp.enabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px]"
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

            {/*

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ask for emails in DMs</span>
              <Switch
                checked={automation.actions.askEmail}
                onChange={(val) => setAutomation({ ...automation, actions: { ...automation.actions, askEmail: val } })}
                className={`${automation.actions.askEmail ? "bg-purple-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.askEmail ? "translate-x-6" : "translate-x-1"}`}
                />
              </Switch>
            </div>
            */}
          </div>
        </div>

        {/* Go Live Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!isNextPost && !automation.postId) || !automation.actions.sendDM.message}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <polygon points="10,8 16,12 10,16 10,8" stroke="currentColor" strokeWidth="2" />
                </svg>
                GO LIVE
              </>
            )}
          </button>
        </div>
      </div>
      {/* Mobile Edit Button (added) */}
      <div className="md:hidden fixed bottom-6 inset-x-0 flex justify-center z-[50]">
        <button
          onClick={() => setShowMobileDrawer(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg"
        >
          Edit
        </button>
      </div>

      {/* Mobile Bottom Drawer (added) */}
      <div
        className={`md:hidden fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-xl z-[80] transition-transform duration-300 ${showMobileDrawer ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "90vh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Flow"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit Flow</h2>
          <button onClick={() => setShowMobileDrawer(false)} className="text-gray-600" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(90vh-60px)] px-4 pb-6">
{/* Step 1: Select a Post Card - MOBILE VIEW */}
        <div
          className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${activeStep === 1 ? "border-gray-500 ring-2 ring-gray-200" : "border-gray-200"}`}
          onClick={() => setActiveStep(1)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${activeStep === 1 ? "bg-slate-800 text-white" : "bg-slate-800 text-white"}`}
            >
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Select a Post</h3>
          </div>

          {/* Next Post Toggle - Mobile View */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">⚡ Next Post</span>
              <span className="text-xs text-gray-600">Create automation before posting</span>
            </div>
            <Switch
              checked={isNextPost}
              onChange={(val) => {
                setIsNextPost(val)
                if (val) {
                  // Clear post selection when enabling Next Post
                  setAutomation({ ...automation, postId: "NEXT_POST", isNextPost: true })
                } else {
                  setAutomation({ ...automation, postId: null, isNextPost: false })
                }
              }}
              className={`${isNextPost ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isNextPost ? "translate-x-6" : "translate-x-1"}`}
              />
            </Switch>
          </div>

          {!isNextPost && (
            <>
              <div className="flex items-center justify-between mb-4">
                {/* <span className="text-sm text-gray-700">Any post</span>
                <Switch
                  checked={true}
                  onChange={() => {}}
                  className="bg-gray-300 relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                </Switch> */}
              </div>
            </>
          )}

          {!isNextPost && (
            <div className="mt-4 grid grid-cols-3 gap-2">
            {posts.length === 0 ? (
              <div className="col-span-3 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-500">No content</span>
              </div>
            ) : (
              posts.slice(0, 3).map((post: InstagramPost) => (
                <div
                  key={post.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setAutomation({ ...automation, postId: post.id, isNextPost: false })
                  }}
                  className={`h-24 rounded-lg cursor-pointer overflow-hidden ring-2 ${automation.postId === post.id ? "ring-gray-500" : "ring-transparent"}`}
                >
                  <img src={post.thumbnail || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
                </div>
              ))
            )}
          </div>
          )}

          {!isNextPost && (
            <Button
            onClick={(e) => {
              e.stopPropagation()
              setShowPostModal(true)
            }}
            className="col-span-3 mt-3 bg-transparent w-full text-black text-sm hover:bg-transparent border border-gray-300  "
          >
            Show More
          </Button>
          )}

          {isNextPost && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                ✅ <strong>Next Post automation ready!</strong>
              </p>
              <p className="text-xs text-gray-600">
                This automation will automatically activate when you post new content to Instagram.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center">
  <Separator orientation="vertical" className="mx-4 h-4" />
</div>

        {/* Step 2: Setup Keywords Card */}
        <div
          className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${activeStep === 2 ? "border-gray-800 ring-2 ring-gray-100" : "border-gray-200"}`}
          onClick={() => setActiveStep(2)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${activeStep === 2 ? "bg-gray-800 text-white" : "bg-slate-800 text-white"}`}
            >
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Add Keywords</h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700">Any keyword</span>
            <Switch
              checked={automation.trigger.anyReply}
              onChange={(val) => setAutomation({ ...automation, trigger: { ...automation.trigger, anyReply: val } })}
              className={`${automation.trigger.anyReply ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.trigger.anyReply ? "translate-x-6" : "translate-x-1"}`}
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
                    trigger: { ...automation.trigger, keywords: [...automation.trigger.keywords, keywordInput.trim()] },
                  })
                }
                setKeywordInput("")
              }
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Type & Hit Enter to add Keyword"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />

          {automation.trigger.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {automation.trigger.keywords.map((word, i) => (
                <div
                  key={i}
                  className="flex items-center bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full shadow-sm"
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
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

          <div className="flex items-center">
  <Separator orientation="vertical" className="mx-4 h-4" />
</div>

        <div
          className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${activeStep === 3 ? "border-gray-800 ring-2 ring-gray-100" : "border-gray-200"}`}
          onClick={() => setActiveStep(3)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${activeStep === 3 ? "bg-slate-800 text-white" : "bg-slate-800 text-white"}`}
            >
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Send DM Message</h3>
          </div>

          {/* Main DM Composition Area */}
          <div className="border-2 border-gray-200 rounded-lg p-4 mb-4">
            <textarea
              placeholder="Enter your message here..."
              value={automation.actions.sendDM.message}
              onChange={(e) => {
                const newMessage = e.target.value;
                if (newMessage.length > 1000) {
                  toast.error("Message too long", {
                    description: "Main DM message cannot exceed 1000 characters",
                  });
                  return;
                }
                setAutomation({
                  ...automation,
                  actions: { ...automation.actions, sendDM: { ...automation.actions.sendDM, message: newMessage } },
                });
              }}
              onFocus={() => setActiveStep(3)}
              onClick={(e) => e.stopPropagation()}
              className="w-full border-0 outline-none text-sm min-h-[120px] resize-y mb-2"
              maxLength={1000}
            />

            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs ${automation.actions.sendDM.message.length > 1000 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                {automation.actions.sendDM.message.length} / 1000
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditingButton(null)
                setShowLinkModal(true)
              }}
              className="w-full border border-gray-300 text-gray-800 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
              </svg>
              Add Link
            </button>

            {/* Image Upload Section */}
            <div className="mt-3">
              {automation.actions.sendDM.image_url ? (
                <div className="relative">
                  <img
                    src={automation.actions.sendDM.image_url}
                    alt="DM Preview"
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
                  actions: { ...automation.actions, openingDM: { ...automation.actions.openingDM, enabled: val } },
                })
              }
              className={`${automation.actions.openingDM.enabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.openingDM.enabled ? "translate-x-6" : "translate-x-1"}`}
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
                      openingDM: { ...automation.actions.openingDM, message: e.target.value },
                    },
                  })
                }
                onClick={(e) => e.stopPropagation()}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[120px] resize-y focus:outline-none"
              />

              <div className="text-xs text-gray-400">{automation.actions.openingDM.message.length} / 640</div>

              {/* Opening DM Image Upload Section */}
              {/*
              <div className="mt-3">
                {automation.actions.openingDM.image_url ? (
                  <div className="relative">
                    <img
                      src={automation.actions.openingDM.image_url}
                      alt="Opening DM Preview"
                      className="w-full rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage("opening")
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
                      onChange={(e) => handleImageUpload(e, "opening")}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden"
                      disabled={isUploadingOpeningImage}
                    />
                    {isUploadingOpeningImage ? (
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
              */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Opening Buttons:</label>
                {automation.actions.openingDM.buttons.map((button, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                    <span className="text-sm text-gray-700 truncate">{button.text}</span>
                    <div className="flex items-center gap-2">
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
                  </div>
                ))}

             
              </div>
            </div>
          )}
        </div>

           <div className="flex items-center">
  <Separator orientation="vertical" className="mx-4 h-4" />
</div>

        <div
          className={`bg-white rounded-lg border p-4 shadow-sm cursor-pointer transition-all ${activeStep === 4 ? "border-gray-800 ring-2 ring-gray-100" : "border-gray-200"}`}
          onClick={() => setActiveStep(4)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${activeStep === 4 ? "bg-gray-800 text-white" : "bg-slate-800 text-white"}`}
            >
              4
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Advanced Automations</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Smart engagement automations</p>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Publicly reply to comments</span>
                <Switch
                  checked={automation.actions.publicReply.enabled}
                  onChange={(val) => {
                    const newReplies = val ? getRandomPublicReplies(3) : automation.actions.publicReply.replies
                    setAutomation({
                      ...automation,
                      actions: {
                        ...automation.actions,
                        publicReply: { enabled: val, replies: newReplies },
                      },
                    })
                  }}
                  className={`${automation.actions.publicReply.enabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.publicReply.enabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </Switch>
              </div>

              {automation.actions.publicReply.enabled && (
                <div className="bg rounded-lg p-4 space-y-3 border border-blue-100">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Public Replies
                      </label>
                      <span className="text-xs text-blue-600 font-medium">{automation.actions.publicReply.replies.filter(r => r.enabled).length} Active</span>
                    </div>
                    {automation.actions.publicReply.replies.map((reply, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:border-blue-300 transition-all group">
                        <div className="flex items-start gap-3">
                          <Switch
                            checked={reply.enabled}
                            onChange={(val) => {
                              const updatedReplies = [...automation.actions.publicReply.replies]
                              updatedReplies[index].enabled = val
                              setAutomation({
                                ...automation,
                                actions: {
                                  ...automation.actions,
                                  publicReply: { ...automation.actions.publicReply, replies: updatedReplies },
                                },
                              })
                            }}
                            className={`${reply.enabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 mt-0.5`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${reply.enabled ? "translate-x-5" : "translate-x-1"}`}
                            />
                          </Switch>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 break-words leading-relaxed whitespace-pre-wrap">{reply.text}</p>
                            <span className="text-xs text-gray-400 mt-1 inline-block">{reply.text.length} chars</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingPublicReply(index)
                              setPublicReplyText(reply.text)
                              setShowPublicReplyModal(true)
                            }}
                            className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                          >
                            <svg
                              width="18"
                              height="18"
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
                      </div>
                    ))}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingPublicReply(null)
                        setPublicReplyText("")
                        setShowPublicReplyModal(true)
                      }}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2.5 rounded-lg text-sm font-medium hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
                        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Add Public Reply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ask to follow before sending DM</span>
              <Switch
                checked={automation.actions.askFollow}
                onChange={(val) => setAutomation({ ...automation, actions: { ...automation.actions, askFollow: val } })}
                className={`${automation.actions.askFollow ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.askFollow ? "translate-x-6" : "translate-x-1"}`}
                />
              </Switch>
            </div>

            {automation.actions.askFollow && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <textarea
                  placeholder="Enter follow request message..."
                  value={automation.actions.followMessage}
                  onChange={(e) =>
                    setAutomation({ ...automation, actions: { ...automation.actions, followMessage: e.target.value } })
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[120px] resize-y focus:outline-none"
                />

                <div className="text-xs text-gray-400">{automation.actions.followMessage.length} / 640</div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Follow Buttons:</label>
                  {automation.actions.followButtons.map((button, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                      <span className="text-sm text-gray-700 truncate">{button.text}</span>
                      <div className="flex items-center gap-2">
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Message */}
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
                className={`${automation.actions.followUp.enabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.followUp.enabled ? "translate-x-6" : "translate-x-1"}`}
                />
              </Switch>
            </div>

            {automation.actions.followUp.enabled && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <textarea
                  placeholder="Enter your follow-up message..."
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px]"
                />
                <div className="text-xs text-gray-400">{automation.actions.followUp.message.length} / 1000</div>

                <div className="space-y-1">
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={360}>6 hours</option>
                    <option value={720}>12 hours</option>
                    <option value={1440}>24 hours</option>
                  </select>
                </div>
              </div>
            )}

            {/* <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ask for emails in DMs</span>
              <Switch
                checked={automation.actions.askEmail}
                onChange={(val) => setAutomation({ ...automation, actions: { ...automation.actions, askEmail: val } })}
                className={`${automation.actions.askEmail ? "bg-purple-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${automation.actions.askEmail ? "translate-x-6" : "translate-x-1"}`}
                />
              </Switch>
            </div> */}
          </div>
        </div>

        {/* Go Live Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!isNextPost && !automation.postId) || !automation.actions.sendDM.message}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <polygon points="10,8 16,12 10,16 10,8" stroke="currentColor" strokeWidth="2" />
                </svg>
                GO LIVE
              </>
            )}
          </button>
        </div>
        </div>
      </div>


      {/* Modals */}
      <Dialog open={showLinkModal} onClose={() => setShowLinkModal(false)} className="relative z-[100]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm rounded bg-white p-6">
            <DialogTitle className="text-lg font-medium mb-4">Add Link Button</DialogTitle>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Button text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value)
                  setValidLink(e.target.value === "" || /^https?:\/\/.+/.test(e.target.value))
                }}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${validLink ? "border-gray-300 focus:ring-purple-500" : "border-red-300 focus:ring-red-500"}`}
              />
              {!validLink && (
                <p className="text-red-500 text-xs">Please enter a valid URL starting with http:// or https://</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (editingButton) {
                      saveEditedButton()
                    } else {
                      // ✅ Feature 1: Limit buttons to 3 maximum
                      if (automation.actions.sendDM.buttons.length >= 3) {
                        toast.error("Button Limit Reached", {
                          description: "Only 3 buttons are supported per message",
                        })
                        return
                      }
                      
                      if (buttonText && link && validLink) {
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
                        setButtonText("")
                        setLink("")
                      }
                    }
                  }}
                  disabled={!buttonText || !link || !validLink}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {editingButton ? "Update" : "Add"} Button
                </button>
                <button
                  onClick={() => {
                    setShowLinkModal(false)
                    setButtonText("")
                    setLink("")
                    setEditingButton(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

   <Dialog open={showOpeningLinkModal} onClose={() => setShowOpeningLinkModal(false)} className="relative z-[100]">
  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <DialogPanel className="mx-auto max-w-sm rounded bg-white p-6">
      <DialogTitle className="text-lg font-medium mb-4">Add Opening Button</DialogTitle>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Button text"
          value={openingButtonText}
          onChange={(e) => setOpeningButtonText(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (editingButton) {
                saveEditedOpeningButton()
              } else {
                if (openingButtonText) {
                  setAutomation({
                    ...automation,
                    actions: {
                      ...automation.actions,
                      openingDM: {
                        ...automation.actions.openingDM,
                        buttons: [
                          ...automation.actions.openingDM.buttons,
                          { text: openingButtonText, link: "" },
                        ],
                      },
                    },
                  })
                  setShowOpeningLinkModal(false)
                  setOpeningButtonText("")
                }
              }
            }}
            disabled={!openingButtonText}
            className="flex-1 bg-purple-600 text-white py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
          >
            {editingButton ? "Update" : "Add"} Button
          </button>

          <button
            onClick={() => {
              setShowOpeningLinkModal(false)
              setOpeningButtonText("")
              setEditingButton(null)
            }}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </DialogPanel>
  </div>
</Dialog>


   {/* Post/Reel Selection Modal */}
<Dialog
  open={showPostModal}
  onClose={() => setShowPostModal(false)}
  className="relative z-[100]"
>
  {/* Dark overlay */}
  <div className="fixed inset-0 bg-black/40" />

  {/* Modal container */}
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">

      {/* Heading */}
      <h2 className="text-lg font-semibold mb-4">Select Post or Reel</h2>

      {/* Close button */}
      <button
        onClick={() => setShowPostModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ✕
      </button>

      {/* Posts Grid */}
   {/* Posts Grid */}
<div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto">
  {posts.map((post: any) => (
    <div
      key={post.id}
      onClick={() => setAutomation({ ...automation, postId: post.id })}
      className={`relative h-28 bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
        automation.postId === post.id ? "border-purple-600 scale-105" : "border-transparent"
      }`}
    >
      {/* Thumbnail */}
      <img
        src={post.thumbnail || post.media_url}
        alt="Post"
        className="w-full h-full object-cover"
      />

      {/* Likes & comments overlay */}
      <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs flex justify-between px-2 py-1">
        <span className="flex items-center gap-1">
          <img src="/qa_love_icon.svg" alt="Likes" className="w-4 h-4 rounded-sm" />
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1">
          <img src="/qa_comment_icon.svg" alt="Comments" className="w-4 h-4 rounded-sm" />
          {post.commentCount}
        </span>
      </div>

      {/* Checkmark if selected */}
      {automation.postId === post.id && (
        <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs rounded-full p-1">✓</div>
      )}
    </div>
  ))}
</div>

{/* Confirm button */}
<Button onClick={() => setShowPostModal(false)} className="mt-4 w-full">
  Confirm Selection
</Button>

    </div>
  </div>
</Dialog>



      <Dialog open={showPublicReplyModal} onClose={() => setShowPublicReplyModal(false)} className="relative z-[90]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm rounded bg-white p-6">
            <DialogTitle className="text-lg font-medium mb-4">
              {editingPublicReply !== null ? "Edit" : "Add"} Public Reply
            </DialogTitle>
            <div className="space-y-4">
              <textarea
                placeholder="Enter public reply text..."
                value={publicReplyText}
                onChange={(e) => setPublicReplyText(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (publicReplyText.trim()) {
                      if (editingPublicReply !== null) {
                        const updatedReplies = [...automation.actions.publicReply.replies]
                        updatedReplies[editingPublicReply].text = publicReplyText
                        setAutomation({
                          ...automation,
                          actions: {
                            ...automation.actions,
                            publicReply: { ...automation.actions.publicReply, replies: updatedReplies },
                          },
                        })
                      } else {
                        setAutomation({
                          ...automation,
                          actions: {
                            ...automation.actions,
                            publicReply: {
                              ...automation.actions.publicReply,
                              replies: [
                                ...automation.actions.publicReply.replies,
                                { text: publicReplyText, enabled: true },
                              ],
                            },
                          },
                        })
                      }
                      setShowPublicReplyModal(false)
                      setPublicReplyText("")
                      setEditingPublicReply(null)
                    }
                  }}
                  disabled={!publicReplyText.trim()}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {editingPublicReply !== null ? "Update" : "Add"} Reply
                </button>
                <button
                  onClick={() => {
                    setShowPublicReplyModal(false)
                    setPublicReplyText("")
                    setEditingPublicReply(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={showFollowButtonModal} onClose={() => setShowFollowButtonModal(false)} className="relative z-[90]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm rounded bg-white p-6">
            <DialogTitle className="text-lg font-medium mb-4">
              {editingFollowButton !== null ? "Edit" : "Add"} Follow Button
            </DialogTitle>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Button text"
                value={followButtonText}
                onChange={(e) => setFollowButtonText(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2">
                <button
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
                              { text: followButtonText, type: "confirm" },
                            ],
                          },
                        })
                      }
                      setShowFollowButtonModal(false)
                      setFollowButtonText("")
                      setEditingFollowButton(null)
                    }
                  }}
                  disabled={!followButtonText.trim()}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {editingFollowButton !== null ? "Update" : "Add"} Button
                </button>
                <button
                  onClick={() => {
                    setShowFollowButtonModal(false)
                    setFollowButtonText("")
                    setEditingFollowButton(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}
