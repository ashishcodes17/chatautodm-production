"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function LoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Reset and start loading
    setProgress(0)
    setIsLoading(true)

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(30), 100)
    const timer2 = setTimeout(() => setProgress(60), 300)
    const timer3 = setTimeout(() => setProgress(80), 600)
    
    // Complete after navigation
    const timer4 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setIsLoading(false), 200)
    }, 800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [pathname, searchParams])

  if (!isLoading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <div 
        className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
