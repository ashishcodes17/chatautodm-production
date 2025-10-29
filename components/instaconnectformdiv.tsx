"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ConnectInstagramCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [connecting, setConnecting] = useState(false)

  const handleInstagramConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Failed to fetch auth")
      const data = await res.json()
      const token = data.token

      const redirectUri = encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`
      )
      const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_manage_insights&state=${token}`

      window.location.href = instagramAuthUrl
    } catch (error) {
      console.error("Error connecting Instagram:", error)
      setConnecting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left */}
          <div className="flex flex-col justify-center gap-6 p-6 md:p-10">
            {/* brand row: Zorcha ↔ Instagram */}
            <div className="flex items-center gap-4">
              {/* Zorcha logo placeholder */}
              <img
                src="/logoshort.png"
                alt="ChatAutoDM Logo"
                className="h-10 w-10"
              />

              {/* swap arrows */}
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 7h10m0 0-3-3m3 3-3 3M17 17H7m0 0 3 3m-3-3 3-3" />
              </svg>

              {/* Instagram logo placeholder */}
              <img
                src="/instagram.png"
                alt="Instagram Logo"
                className="h-10 w-10"
              />
            </div>

            {/* header + copy */}
            <div className="flex flex-col items-start gap-2">
              <h1 className="text-2xl font-bold">Connect Instagram</h1>
              <p className="text-muted-foreground">
                Use your Instagram account to connect to ChatAutoDM.
              </p>
            </div>

            {/* CTA */}
            <Button
              onClick={handleInstagramConnect}
              disabled={connecting}
              className="w-full bg-[#6F2BFF] text-base py-5 hover:bg-[#6F2BFF]/90"
            >
              {connecting ? "Connecting..." : "Go To Instagram"}
            </Button>

            {/* explainer text */}
            <p className="text-sm text-muted-foreground">
              Log in with Instagram and set your permissions. Once that’s done,
              you’re all set to connect to ChatAutoDM!
            </p>

            {/* Meta badge */}
            <div className="mt-2 flex items-center gap-3">
              <img
                src="/meta_logo0.png"
                alt="Meta Logo"
                className="h-6 w-auto"
              />
              <span className="text-xs text-muted-foreground">
                ChatAutoDM has been certified by Meta as an official Tech Provider.
              </span>
            </div>
          </div>

          {/* Right image */}
          <div className="bg-muted relative hidden md:block">
            <img
              src="/lc1.png"
              alt="Connect Instagram"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="/terms">Terms of Service</a>{" "}
        and <a href="/privacy">Privacy Policy</a>.
      </div>
    </div>
  )

}
