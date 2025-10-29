"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function InstagramErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    } else {
      setError("An unknown error occurred during Instagram connection.")
    }
  }, [searchParams])

  const handleRetry = () => {
    router.push("/connect-instagram")
  }

  const handleGoBack = () => {
    const returnUrl = sessionStorage.getItem("instagram_connect_return_url")
    if (returnUrl) {
      sessionStorage.removeItem("instagram_connect_return_url")
      router.push(returnUrl)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connection Failed</h1>

          <p className="text-gray-600 mb-6">{error}</p>

          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button onClick={handleGoBack} variant="outline" className="w-full bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Make sure you have an Instagram Business account connected to a Facebook Page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
