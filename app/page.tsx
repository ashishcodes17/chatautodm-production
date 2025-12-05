"use client"

import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'

import HeroSection from '@/components/landing/hero-section'
import FeaturesSection from '@/components/landing/features-section'
import TestimonialsSection from '@/components/landing/testimonials-section'
import PricingSection from '@/components/landing/pricing'
import FloatingNav from '@/components/navbar'
import { ComparisonSection } from '@/components/landing/comaprison'
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'

interface User {
  _id: string
  email: string
  name: string
  picture: string
}

const Page = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [authResponse, workspacesResponse] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/workspaces'),
        ])

        if (authResponse.ok) {
          const userData = await authResponse.json()
          setUser(userData)

          if (workspacesResponse.ok) {
            const workspacesData = await workspacesResponse.json()
            if (workspacesData.length >= 0) {
              router.replace('/select-workspace')
              return
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    void checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-gray-600 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Instagram Automation Tool Free - ChatAutoDM</title>
        <meta
          name="description"
          content="ChatAutoDM is a free Instagram automation tool that helps brands and creators automatically convert comments to DMs, respond instantly, and engage followers 24/7 with AI-driven automation."
        />
        <meta
          name="keywords"
          content="Instagram automation tool,free alternative for manychat zorcha linkdm, free Instagram DM tool, ChatAutoDM, Instagram auto responder, Instagram marketing, AI DM automation"
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="min-h-screen bg-white">
        <FloatingNav />
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <ComparisonSection />
        <FAQ />
        <Footer />
      </main>
    </>
  )
}
export default Page