"use client"

import { SWRConfig } from "swr"

function localStorageProvider() {
  // Guard: only run in browser
  if (typeof window === "undefined") {
    return new Map()
  }

  // Restore data from localStorage
  const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"))

  // Save back on unload
  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()))
    localStorage.setItem("app-cache", appCache)
  })

  return map
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: localStorageProvider }}>
      {children}
    </SWRConfig>
  )
}
