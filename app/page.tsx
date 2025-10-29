"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Head from "next/head"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Instagram, Shield, Zap, ArrowRight } from "lucide-react"
import { ComparisonSection } from "@/components/landing/comparison-section"
import { FAQ } from "@/components/landing/faq"
import { Footer } from "@/components/landing/footer"
import { Testimonials } from "@/components/landing/testimonials"
import { FunnelSection } from "@/components/landing/funnel-section"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import FloatingNav from "@/components/pagenavbar";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import HERO_COPY from "@/components/landing/hero-copy"

interface User {
  _id: string
  email: string
  name: string
  picture: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
    const prefersReduced = useReducedMotion()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const [authResponse, workspacesResponse] = await Promise.all([fetch("/api/auth/me"), fetch("/api/workspaces")])

      if (authResponse.ok) {
        const userData = await authResponse.json()
        setUser(userData)

        if (workspacesResponse.ok) {
          const workspacesData = await workspacesResponse.json()
          if (workspacesData.length >= 0) {
            router.replace("/select-workspace")
            return
          }
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect immediately, no need to show loading
  }

  return (
    <>

      <Head>
        {/* Primary SEO */}
        <title>Instagram Automation Tool Free - ChatAutoDM</title>
        <meta
          name="description"
          content="ChatAutoDM is a free Instagram automation tool that helps brands and creators automatically convert comments to DMs, respond instantly, and engage followers 24/7 with AI-driven automation."
        />
        <meta name="keywords" content="Instagram automation tool,free alternative for manychat zorcha linkdm, free Instagram DM tool, ChatAutoDM, Instagram auto responder, Instagram marketing, AI DM automation" />
        <meta name="robots" content="index, follow" />

      
      </Head>
     <main className="min-h-screen bg-white">
        {/* Header */}
        {/* <header className=" absolute top-0 left-0 w-full z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Image src="/favicon.png" alt="ChatAutoDM" width={100} height={40} className="object-contain" />
                </div>
                <span className="text-xl font-semibold text-white tracking-tight">ChatAutoDM</span>
              </div>
              <Button
                onClick={handleGoogleLogin}
                className="bg-black hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-full transition-all duration-200"
              >
                Get Started
              </Button>
            </div>
          </div>
        </header> */}
           <FloatingNav />

  {/* Hero Section */}
   <section className="relative min-h-[100svh] overflow-hidden bg-[#0B0213]" aria-labelledby="hero-heading">
              {/* Layered background: brand wash + soft glows + subtle grid */}
              <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
                {/* Brand wash using radial gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_10%,rgba(217,0,255,0.18),transparent_60%),radial-gradient(900px_500px_at_90%_20%,rgba(255,127,80,0.14),transparent_60%),radial-gradient(800px_600px_at_50%_100%,rgba(0,0,0,0.6),transparent_70%)]" />
                {/* Soft glows */}
                <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/25 blur-[120px]" />
                <div className="absolute top-1/3 -right-20 h-[26rem] w-[26rem] rounded-full bg-rose-400/25 blur-[120px]" />
                {/* Subtle grid overlay */}
                <div
                  className="absolute inset-0 opacity-[0.10] mix-blend-screen"
                  style={{
                    backgroundImage:
                      "linear-gradient(0deg, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
              </div>
        
              {/* Small Label */}
              {/* <div className="relative z-10 pt-28 md:pt-32 px-6 md:px-12">
                <span className="text-white/80 text-xs md:text-sm font-medium tracking-wider uppercase">
                  {HERO_COPY.label}
                </span>
              </div> */}
        
              {/* Content */}
              <div className="relative z-10 container mx-auto px-6 md:px-12 pb-24 pt-6 mt-16">
                <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-start">
                  {/* Left Content */}
                  <div className="space-y-9 max-w-2xl">
                    <h1
                      id="hero-heading"
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] sm:leading-[1] md:leading-[0.95] tracking-tight"
                    >
                     Engage Customers Instantly with  
                      <span className="block bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-200 via-white to-rose-200">
                        Instagram Auto‑Replies
                      </span>
                    </h1>
                    <p className="text-base md:text-lg text-white/90 leading-relaxed">
                      {HERO_COPY.description}
                    </p>
        
                    {/* Feature badges row */}
                    <div className="flex flex-wrap items-center gap-2.5 md:gap-3 text-[13px] md:text-sm">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1.5 ring-1 ring-white/20">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M12 2v5M12 17v5M4.22 4.22l3.54 3.54M16.24 16.24l3.54 3.54M2 12h5M17 12h5M4.22 19.78l3.54-3.54M16.24 7.76l3.54-3.54" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        Boost conversions
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1.5 ring-1 ring-white/20">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Instant auto‑replies
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1.5 ring-1 ring-white/20">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        No‑code setup
                      </span>
                    </div>
        
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                     <Button
                      onClick={handleGoogleLogin}
                      aria-label={HERO_COPY.cta}
                      className="inline-flex items-center justify-center bg-[#db2777] hover:bg-black text-white font-bold text-base md:text-lg px-8 py-4 md:py-6 rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.35)] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 focus:outline-none min-h-[56px] md:min-h-[72px]"
                      >
                       {HERO_COPY.cta}
                      </Button>
                      {/* <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center border-2 border-white/80 text-white hover:bg-white/10 font-semibold text-base md:text-lg px-8 py-4 md:py-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 focus:outline-none"
                      >
                        See pricing
                      </Link> */}
                    </div>
        
                    {/* Trust avatars row */}
                    <div className="mt-5 md:mt-6 flex items-center gap-3 text-white/90">
                      {/* <div className="-space-x-3 flex">
                        <Image src="/placeholder-user.jpg" alt="Happy customer avatar" width={36} height={36} className="rounded-full ring-2 ring-white/40" />
                        <Image src="/placeholder.jpg" alt="Happy customer avatar" width={36} height={36} className="rounded-full ring-2 ring-white/40" />
                        <Image src="/placeholder-logo.png" alt="Happy customer avatar" width={36} height={36} className="rounded-full ring-2 ring-white/40" />
                      </div> */}
                      <p className="text-xs md:text-sm">Trusted by our Early 200+ creators and brands automating their Instagram growth</p>
                    </div>
                  </div>
        
                  {/* Right Content - Instagram Post Mockup */}
                  <div className="relative flex justify-center lg:justify-end mt-10 lg:mt-0 lg:pr-6 xl:pr-10">
                    <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-[21rem] xl:max-w-[22rem] motion-safe:transform motion-safe:lg:rotate-3 motion-safe:hover:rotate-0 motion-reduce:transform-none transition-transform duration-500 lg:-translate-x-6 xl:-translate-x-8 lg:-translate-y-3">
                      {/* Instagram Post Card */}
                      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5 group">
                        {/* Subtle reflection overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                        {/* Instagram Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="relative h-8 w-8">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                                <div className="h-full w-full rounded-full bg-white overflow-hidden">
                                  <Image src="/placeholder-user.jpg" alt="Profile" width={32} height={32} className="h-full w-full object-cover" />
                                </div>
                              </div>
                            </div>
                            <span className="font-semibold text-sm">hoodies.shop</span>
                          </div>
                          <MoreHorizontal className="h-5 w-5 text-gray-700" aria-hidden="true" />
                        </div>
        
                        {/* Instagram Post Image */}
                        <div className="relative aspect-square bg-gradient-to-br from-orange-400 to-orange-300">
                          <Image
                            src="https://cdn.jsdelivr.net/gh/ashishexplains17/images@main/hero-hoodie.png"
                            alt="Instagram post showing a product with comments preview"
                            fill
                            priority
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9JyNmMmE2NDAnIC8+PC9zdmc+"
                            className="object-cover"
                            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 400px"
                          />
                          {/* Small 'Automated' sticker */}
                          <div className="absolute top-3 left-3 bg-black/80 text-white text-[10px] px-2 py-1 rounded-full tracking-wide uppercase ring-1 ring-white/20">
                            Automated
                          </div>
                        </div>
        
                        {/* Instagram Actions */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Heart className="h-6 w-6 text-gray-900" aria-hidden="true" />
                              <MessageCircle className="h-6 w-6 text-gray-900" aria-hidden="true" />
                              <Send className="h-6 w-6 text-gray-900" aria-hidden="true" />
                            </div>
                            <Bookmark className="h-6 w-6 text-gray-900" aria-hidden="true" />
                          </div>
        
                          {/* Meta: likes/time */}
                          <div className="text-xs text-gray-600 flex items-center gap-2">
                            <span className="font-semibold text-gray-900">9,841 likes</span>
                            <span aria-hidden="true">•</span>
                            <span>2 hours ago</span>
                          </div>
        
                          {/* Comments Section */}
                          <div className="bg-black text-white rounded-2xl p-4 space-y-2 shadow-inner">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Comments</span>
                              <Send className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-semibold">mark_ram</span>{" "}
                                  <span className="text-gray-300">now</span>
                                </p>
                                <p className="text-sm mt-1">ommmggg 😍 share me the link!</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
        
                      {/* Floating auto-reply bubble (communicates right content clearly) */}
                      <motion.div
                        className="hidden md:block absolute -right-16 top-1/2 -translate-y-[60%] text-white min-w-[300px] md:min-w-[320px] lg:min-w-[340px] space-y-3"
                        aria-hidden="true"
                        initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
                        animate={prefersReduced ? undefined : { opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                        transition={prefersReduced ? undefined : { duration: 6, times: [0, 0.15, 0.85, 1], repeat: Infinity, repeatDelay: 1 }}
                      >
                        <div className="rounded-[40px] px-8 py-6 bg-black/90 shadow-2xl border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold tracking-wide">Auto‑Reply DM</span>
                            <Send className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="text-sm leading-snug space-y-2">
                            <p className="text-white/90">Thanks for the comment! What’s your best email?</p>
                            <p className="text-white/70">I’ll send the link right away.</p>
                          </div>
                        </div>
                        {/* Tiny user reply chip */}
                        <div className="ml-auto w-fit rounded-full bg-white/10 backdrop-blur px-4 py-2 text-xs border text-black border-white/15">
                          alex@company.com <span className="text-green-300">• saved</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
        

        {/* Feature Highlights */}
        <section className="pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
            <Card className="border-0 bg-gray-50 hover:shadow-lg transition-all duration-300 group rounded-3xl">
              <CardContent className="p-10 text-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:shadow-md">
                  <Instagram className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Comment to DM</h3>
                <p className="text-gray-600 text-lg">
                  Automatically convert Instagram comments into personalized direct messages.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gray-50 hover:shadow-lg transition-all duration-300 group rounded-3xl">
              <CardContent className="p-10 text-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:shadow-md">
                  <Zap className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Auto Responder</h3>
                <p className="text-gray-600 text-lg">
                  Respond instantly with smart automation and interactive buttons.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gray-50 hover:shadow-lg transition-all duration-300 group rounded-3xl">
              <CardContent className="p-10 text-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:shadow-md">
                  <Shield className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">24/7 Automation</h3>
                <p className="text-gray-600 text-lg">
                  Never miss a customer inquiry with round-the-clock automated responses.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Callout Banner */}
        <section className="text-center pb-20 md:pb-24">
          <div className="bg-black text-white max-w-5xl mx-auto rounded-3xl overflow-hidden">
            <div className="p-8 sm:p-12 lg:p-20">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Ready to Automate Your Instagram?</h2>
              <p className="text-base sm:text-lg lg:text-2xl mb-8 lg:mb-10 opacity-80 font-light">
                Join thousands of businesses growing with ChatAutoDM
              </p>
              <Button
                onClick={handleGoogleLogin}
                size="lg"
                className="bg-white text-black hover:bg-gray-100 text-base sm:text-lg px-8 sm:px-10 py-4 h-14 sm:h-16 font-medium rounded-full shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Outside sections */}
      {/* <HeroLinktrStyle /> */}
      <Testimonials />
      <FunnelSection />
      <ComparisonSection />
      <FAQ />
      <Footer />
    </>
  )
}
