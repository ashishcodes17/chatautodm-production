"use client"

import { useEffect } from 'react'

export default function SmoothScroll() {
  useEffect(() => {
    let lenis: any
    let rafId: number | null = null
    let observer: MutationObserver | null = null

    // Check if smooth scroll should be disabled
    const shouldDisable = () =>
      document.documentElement.hasAttribute('data-disable-smooth-scroll')

      ; (async () => {
        // Don't initialize if smooth scroll is disabled
        if (shouldDisable()) {
          return
        }

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
          lenis?.raf(time)
          rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        // Watch for attribute changes to disable smooth scroll dynamically
        observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-disable-smooth-scroll') {
              if (shouldDisable() && lenis) {
                // Stop animation frame and destroy lenis
                if (rafId !== null) {
                  cancelAnimationFrame(rafId)
                  rafId = null
                }
                lenis.destroy()
                lenis = null
              }
            }
          })
        })

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-disable-smooth-scroll']
        })
      })()

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      lenis?.destroy()
      observer?.disconnect()
    }
  }, [])

  return null
}
