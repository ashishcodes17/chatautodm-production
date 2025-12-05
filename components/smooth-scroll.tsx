"use client"

import { useEffect } from 'react'

export default function SmoothScroll() {
  useEffect(() => {
    let lenis: any

    ;(async () => {
      const Lenis = (await import('lenis')).default
      
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      })

      function raf(time: number) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }

      requestAnimationFrame(raf)
    })()

    return () => {
      lenis?.destroy()
    }
  }, [])

  return null
}
