"use client"

import React, { useEffect, useRef, useState } from 'react'

const FeaturesSection = () => {
  const workflowSteps = [
    {
      number: '01',
      title: 'Select Post',
      description: 'Choose any Instagram post or reel where you want automation to run.',
    },
    {
      number: '02',
      title: 'Choose Keyword',
      description: 'Add trigger words like "link", "price", or "info" to launch the flow.',
    },
    {
      number: '03',
      title: 'Set Link or Response',
      description: 'Drop in links, discount codes, or full scripts to reply instantly.',
    },
  ]

  const [activeStep, setActiveStep] = useState(0)
  const [showFreeBanner, setShowFreeBanner] = useState(true)
  const workflowScrollRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false);
   const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  useEffect(() => {
    const handleScroll = () => {
      const zone = workflowScrollRef.current
      if (!zone) return

      const rect = zone.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      if (rect.top >= viewportHeight) {
        setActiveStep(0)
        return
      }

      if (rect.bottom <= 0) {
        setActiveStep(workflowSteps.length - 1)
        return
      }

      const scrollable = rect.height - viewportHeight
      if (scrollable <= 0) return

      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1)
      const candidate = Math.min(
        workflowSteps.length - 1,
        Math.floor(progress * workflowSteps.length)
      )

      setActiveStep((prev) => (prev === candidate ? prev : candidate))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  const renderPreview = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop"
                alt="Selected post"
                className="w-20 h-20 rounded-2xl object-cover"
              />
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-400">Selected Reel</p>
                <p className="text-xl font-semibold text-slate-900">Holiday Drop</p>
                <p className="text-sm text-slate-500">Live • comments flowing in</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                <span>Post status</span>
                <span>Connected</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                {['Reel', 'Story', 'Comments'].map((chip) => (
                  <div key={chip} className="rounded-xl bg-slate-50 py-2 text-sm font-semibold text-slate-700">
                    {chip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-400">Triggers</p>
                <span className="text-[11px] font-semibold text-emerald-500">Active</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['link', 'price', 'info', 'drop'].map((keyword) => (
                  <span key={keyword} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              Auto-start flow whenever a comment or DM includes the chosen keywords.
            </div>
          </div>
        )
      case 2:
      default:
        return (
          <div className="space-y-5">
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Auto reply</div>
              <p className="text-lg font-semibold">Here’s the link you requested! 🎉</p>
              <div className="bg-white text-slate-900 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold">
                yourstore.com/offer
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center justify-between text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Delivery time</p>
                <p className="text-base font-semibold text-slate-900">1.2s</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Click-through</p>
                <p className="text-base font-semibold text-slate-900">74%</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Revenue</p>
                <p className="text-base font-semibold text-slate-900">$4.8K</p>
              </div>
            </div>
          </div>
        )
    }
  }
  return (
    <section className="min-h-screen bg-white flex flex-col items-center justify-center px-4 md:px-6 py-16 md:py-24">
      {showFreeBanner && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-8 z-50">
          <div className="group relative w-[320px] sm:w-[380px] overflow-hidden rounded-[30px] border border-white/20 bg-white/15 px-6 py-5 shadow-[0_45px_120px_rgba(15,23,42,0.55)] backdrop-blur-[40px]">
            <div className="pointer-events-none absolute inset-px rounded-[28px] border border-white/40" />
            <div className="pointer-events-none absolute -inset-10 bg-gradient-to-br from-slate-100/30 via-white/5 to-transparent" />
            <div className="pointer-events-none absolute -top-12 -right-10 h-36 w-36 rounded-full bg-gradient-to-br from-[#a5b4fc]/30 via-white/10 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-[#38bdf8]/25 via-transparent to-transparent blur-3xl" />
            <div className="relative flex items-start gap-4">
              {/* <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_20px_40px_rgba(15,23,42,0.5)]">
                <span className="text-sm font-semibold tracking-[0.25em]">CA</span>
              </div> */}
              <div className="flex-1 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-400">BANGER!</p>
                <p className="text-[1.55rem] font-semibold text-slate-900 leading-tight">
                 Everything’s FREE.⚡
                </p>
                <p className="text-sm text-slate-500">Unlock unlimited flows, contacts & analytics</p>
              </div>
              <button
                aria-label="Dismiss free plans banner"
                onClick={() => setShowFreeBanner(false)}
                className="text-slate-400 transition hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="relative mt-6 space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                live unlock • no credit-card
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/60 bg-white/40 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900">
                  unlimited seats
                </span>
                <span className="inline-flex items-center rounded-full border border-white/40 bg-white/30 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                  ₹0 for now
                </span>
              </div>
              <button 
               onClick={handleGoogleLogin}
              className="inline-flex w-full items-center justify-between rounded-2xl border border-white/30 bg-white/20 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_15px_30px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/40">
                <span>Lets roll</span>
                <svg
                  className="h-4 w-4 text-slate-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">
            The ultimate toolkit for<br />
            Creators & Brands
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Have your CAKE!!. Eat it tooooooo, We’ll answer your customers.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-8">
          {/* Card 1 - Ask to Follow Feature */}
          <div className="bg-white rounded-3xl p-8 space-y-6 shadow-xl transition-all">
            {/* Visual Content - Chat Conversation */}
            <div className="bg-gray-50 rounded-2xl p-6 h-80 flex flex-col justify-end space-y-3 relative overflow-hidden">
              
              {/* Incoming message - User didn't follow */}
              <div className="flex items-start gap-2 opacity-100">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gray-400"></div>
                </div>
                <div className="flex flex-col gap-2 max-w-[75%]">
                  <div className="bg-white  rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                    <p className="text-sm text-gray-800 font-medium">Hey! Are you following mee??
                      makesure you follow to get that link? 🔥</p>
                       <button className="bg-gray-100 mt-2 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium w-full hover:bg-gray-200 transition-colors">
                  Yeah, i'm following!
                    </button>
                  </div>
                  
                </div>
              </div>

              {/* Outgoing message - Auto reply */}
              <div className="flex items-end gap-2 justify-end opacity-100">
                <div className="flex flex-col gap-2 items-end max-w-[75%]">
                  <div className="bg-gray-800 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-md">
                    <p className="text-sm text-white font-medium">Yeah, i'm following!</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img src="https://i.pravatar.cc/32" alt="User" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Incoming offer message - From other side */}
              <div className="flex items-start gap-2 opacity-100">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gray-400"></div>
                </div>
                <div className="flex flex-col gap-2 max-w-[75%]">
                  
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-800 font-medium mb-2">Here's the link you asked for. Enjoy!</p>
                    {/* </button> */}
                     <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium w-full hover:bg-gray-200 transition-colors">
                 Click Me
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Card Content */}
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Ask to Follow Feature</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Automatically verify followers and send personalized offers instantly.
              </p>
            </div>
          </div>

          {/* Card 2 - Increase Engagement */}
          <div className="bg-white rounded-3xl p-8 space-y-6 shadow-xl transition-all">
            {/* Visual Content */}
            <div className="bg-gray-50 backdrop-blur-sm rounded-2xl p-6 h-80 flex flex-col relative overflow-hidden">
              
              {/* Header Stats */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-5xl font-black text-gray-900">11X</h3>
                  <p className="text-xs font-semibold text-gray-500 mt-1">Engagement Growth</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#3b82f6]">22K</p>
                  <p className="text-xs text-gray-500">Total Reach</p>
                </div>
              </div>

              {/* Area Graph */}
              <div className="relative flex-1 w-full">
                <svg viewBox="0 0 300 140" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="35" x2="300" y2="35" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="70" x2="300" y2="70" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="105" x2="300" y2="105" stroke="#e5e7eb" strokeWidth="1" />
                  
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area path */}
                  <path
                    d="M 0 110 L 60 100 L 120 85 L 180 60 L 240 25 L 300 15 L 300 140 L 0 140 Z"
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Line stroke */}
                  <path
                    d="M 0 110 L 60 100 L 120 85 L 180 60 L 240 25 L 300 15"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  <circle cx="0" cy="110" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="60" cy="100" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="120" cy="85" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="180" cy="60" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="240" cy="25" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="300" cy="15" r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
                </svg>

                {/* X-axis labels */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1 text-[10px] text-gray-500 font-medium">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>

              {/* Bottom badge */}
              <div className="mt-8 flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 w-fit mx-auto">
                <div className="w-2 h-2 bg-[#3b82f6] rounded-full"></div>
                <p className="text-xs font-semibold text-gray-700">Auto-reply to all comments & DMs</p>
              </div>

            </div>

            {/* Card Content */}
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Increase Engagement by 11X</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Reply to every comment and DM automatically to boost engagement rates.
              </p>
            </div>
          </div>

          {/* Card 3 - Smart Follow-up Messages */}
          <div className="bg-white rounded-3xl p-8 space-y-6 shadow-xl transition-all">
            {/* Visual Content */}
            <div className="bg-[#f8f9fa] rounded-2xl p-6 h-80 flex flex-col justify-between relative overflow-hidden">
              
              {/* Message Status Cards */}
              <div className="space-y-4">
                
                {/* Sent Message Box */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-[#3b82f6] shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900">SENT</span>
                    <span className="text-xs text-gray-400">10:30 AM</span>
                  </div>
                  <p className="text-sm text-gray-700">Hey! Interested in our new product?</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>

                {/* Delay Indicator */}
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[10px] font-bold text-gray-500">2 HOURS</span>
                  </div>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>

                {/* Follow-up Box */}
                <div className="bg-[#10b981] rounded-lg p-4 shadow-md relative">
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-xs">⚡</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">AUTO FOLLOW-UP</span>
                    <span className="text-xs text-emerald-100">12:30 PM</span>
                  </div>
                  <p className="text-sm text-white font-medium">Still there? Here's 20% OFF just for you!</p>
                  <div className="mt-3 bg-white rounded px-3 py-1.5 inline-block">
                    <span className="text-xs font-bold text-emerald-600">GRAB OFFER →</span>
                  </div>
                </div>

              </div>

              {/* Stats Badge */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 tracking-wide">NO RESPONSE DETECTED</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                </div>
              </div>

            </div>

            {/* Card Content */}
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Smart Follow-up Messages</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Automatically send follow-ups if users haven't seen or clicked your message.
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div ref={workflowScrollRef} className="relative pt-16 lg:min-h-[220vh]">
          <div className="lg:sticky lg:top-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Side - Scroll-triggered steps */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-black">Set up in 3 simple steps</h2>
            <p className="text-gray-600">Scroll through the steps — the live preview adapts automatically.</p>

            <div className="space-y-6">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`rounded-3xl border p-6 transition-all duration-300 bg-white/90 backdrop-blur-sm ${
                    activeStep === index
                      ? 'border-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.1)]'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-semibold text-sm tracking-widest ${
                        activeStep === index ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                      <p className="text-slate-500 mt-2 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Dynamic preview */}
          <div className="relative mt-14">
            <div className="absolute -inset-6 bg-gradient-to-br from-slate-100 via-white to-slate-50 rounded-[32px] blur-2xl"></div>
            <div className="relative bg-white rounded-[28px] border border-gray-100 shadow-[0_25px_70px_rgba(15,23,42,0.08)] p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-semibold">
                    CA
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Flow preview</p>
                    <p className="text-xl font-semibold text-gray-900">{workflowSteps[activeStep].title}</p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-500">Step {activeStep + 1} of 3</div>
              </div>

              <div className="mt-8 min-h-[260px]">
                <div key={activeStep} className="transition-all duration-500 ease-out">
                  {renderPreview(activeStep)}
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between">
                <div className="flex gap-2">
                  {workflowSteps.map((step, index) => (
                    <span
                      key={step.title}
                      className={`h-2 w-8 rounded-full transition-all ${
                        activeStep === index ? 'bg-slate-900' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <button className="text-sm font-semibold text-slate-900 hover:underline">Go live →</button>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
