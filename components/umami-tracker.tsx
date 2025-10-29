// components/umami-tracker.tsx
'use client'
import { useEffect } from 'react'

export default function UmamiTracker() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/api/umami-proxy'  // <- our proxy route
    script.dataset.websiteId = '313e103b-6d28-42dc-ba75-c876cfdbe8e0'
    script.defer = true
    document.body.appendChild(script)
  }, [])
  return null
}
