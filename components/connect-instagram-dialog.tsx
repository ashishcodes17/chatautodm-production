"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Instagram, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConnectInstagramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  onInstagramConnected: (account: any) => void
}

export function ConnectInstagramDialog({
  open,
  onOpenChange,
  workspaceId,
  onInstagramConnected,
}: ConnectInstagramDialogProps) {
  const [step, setStep] = useState<"info" | "connecting" | "success" | "error">("info")
  const [error, setError] = useState("")

  const handleConnectInstagram = async () => {
    setStep("connecting")
    setError("")

    try {
      // Generate Instagram OAuth URL with your actual credentials
      const instagramAuthUrl = new URL("https://www.instagram.com/oauth/authorize")
      instagramAuthUrl.searchParams.set("force_reauth", "true")
      instagramAuthUrl.searchParams.set("client_id", process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || "1037242185028433")
      instagramAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`)
      instagramAuthUrl.searchParams.set("response_type", "code")
      instagramAuthUrl.searchParams.set(
        "scope",
        "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights",
      )
      instagramAuthUrl.searchParams.set("state", workspaceId)

      // Open Instagram OAuth in popup
      const popup = window.open(
        instagramAuthUrl.toString(),
        "instagram-auth",
        "width=600,height=700,scrollbars=yes,resizable=yes",
      )

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          // Check if connection was successful
          checkConnectionStatus()
        }
      }, 1000)

      // Listen for messages from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.success) {
          checkConnectionStatus()
        } else if (event.data.error) {
          setError(event.data.error)
          setStep("error")
        }

        window.removeEventListener("message", messageListener)
      }

      window.addEventListener("message", messageListener)
    } catch (error) {
      console.error("Error connecting Instagram:", error)
      setError("Failed to connect Instagram account. Please try again.")
      setStep("error")
    }
  }

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/instagram-accounts`)
      if (response.ok) {
        const accounts = await response.json()
        if (accounts.length > 0) {
          const newAccount = accounts[accounts.length - 1] // Get the latest account
          onInstagramConnected(newAccount)
          setStep("success")
          setTimeout(() => {
            onOpenChange(false)
            setStep("info")
          }, 2000)
        } else {
          setError("Instagram connection was cancelled or failed.")
          setStep("error")
        }
      }
    } catch (error) {
      console.error("Error checking connection status:", error)
      setError("Failed to verify Instagram connection.")
      setStep("error")
    }
  }

  const resetDialog = () => {
    setStep("info")
    setError("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetDialog()
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Instagram className="h-5 w-5 text-pink-600" />
            <span>Connect Instagram Account</span>
          </DialogTitle>
          <DialogDescription>
            Connect your Instagram Business account to start automating messages and managing content.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === "info" && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll need an Instagram Business or Creator account linked to a Facebook Page.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Requirements:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Instagram Business or Creator account</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Facebook Page linked to your Instagram account</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Admin access to the Facebook Page</span>
                  </li>
                </ul>
              </div>

              <Button onClick={handleConnectInstagram} className="w-full">
                <Instagram className="mr-2 h-4 w-4" />
                Connect Instagram Account
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === "connecting" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <h4 className="font-medium mb-2">Connecting your Instagram account...</h4>
              <p className="text-sm text-gray-600">Please complete the authorization in the popup window.</p>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h4 className="font-medium mb-2">Successfully connected!</h4>
              <p className="text-sm text-gray-600">Your Instagram account has been added to this workspace.</p>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => setStep("info")} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
