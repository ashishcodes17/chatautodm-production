"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { MessageSquare, Users, Link as LinkIcon, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react"

export function ScrollFeatures() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const features = [
    {
      icon: MessageSquare,
      title: "Respond to every comment",
      subtitle: "Instant engagement",
      description:
        "Automatically reply to Instagram comments, DMs, and Story mentions instantly. Never miss an engagement opportunity.",
      gradient: "from-pink-500 to-rose-600",
      accentColor: "bg-pink-500",
    },
    {
      icon: Users,
      title: "Smart follow detection",
      subtitle: "Quality over quantity",
      description:
        "Smart filtering ensures you only share valuable content with engaged followers. Build a quality audience that matters.",
      gradient: "from-purple-500 to-indigo-600",
      accentColor: "bg-purple-500",
    },
    {
      icon: LinkIcon,
      title: "Build your email list",
      subtitle: "Own your audience",
      description:
        "Automatically collect emails so you can reach your audience directly — anytime, anywhere without the algorithm.",
      gradient: "from-blue-500 to-cyan-600",
      accentColor: "bg-blue-500",
    },
    {
      icon: TrendingUp,
      title: "Never miss a conversation",
      subtitle: "24/7 automation",
      description:
        "Monitor all conversations in real-time. Respond authentically and close sales through rapid, automated conversation flows.",
      gradient: "from-emerald-500 to-teal-600",
      accentColor: "bg-emerald-500",
    },
  ]

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const sectionHeight = 1 / features.length
      const newIndex = Math.min(Math.floor(latest / sectionHeight), features.length - 1)
      setActiveIndex(newIndex)
    })

    return () => unsubscribe()
  }, [scrollYProgress, features.length])

  return (
    <section ref={containerRef} className="relative bg-white overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50" />
      
      <div className="relative container mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        {/* Section Header - Apple Style */}
        <div className="text-center mb-20 md:mb-32 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Powerful automation</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tight text-gray-900 mb-6 leading-[1.1]"
          >
            Everything you need.
            <br />
            <span className="text-gray-400">All in one place.</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            Turn every comment into a conversation and every conversation into a customer.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start max-w-7xl mx-auto">
          {/* Left side - Scrolling text content */}
          <div className="space-y-24 lg:space-y-[40vh]">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isActive = activeIndex === index
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-20%" }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.6 }
                  }}
                  className={`transition-all duration-700 ease-out ${
                    isActive ? "opacity-100 scale-100" : "opacity-30 scale-95 lg:opacity-100 lg:scale-100"
                  }`}
                >
                  {/* Minimalist Icon */}
                  <div className="mb-8">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {feature.subtitle}
                      </p>
                      <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 leading-tight">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg font-normal">
                      {feature.description}
                    </p>
                  </div>

                  {/* Mobile visual - show on mobile */}
                  <div className="mt-12 lg:hidden">
                    <FeatureVisual index={index} isActive={true} accentColor={feature.accentColor} gradient={feature.gradient} />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Right side - Sticky visual content (desktop only) */}
          <div className="hidden lg:block sticky top-32 h-[70vh]">
            <div className="relative w-full h-full flex items-center justify-center">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: activeIndex === index ? 1 : 0,
                    scale: activeIndex === index ? 1 : 0.92,
                    y: activeIndex === index ? 0 : 20,
                  }}
                  transition={{ 
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <FeatureVisual index={index} isActive={activeIndex === index} accentColor={feature.accentColor} gradient={feature.gradient} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureVisual({ index, isActive, accentColor, gradient }: { index: number; isActive: boolean; accentColor: string; gradient: string }) {
  // Different visual styles for each feature - Apple Style
  const visuals = [
    // Feature 1: Instagram Comment Auto-reply
    <div key="visual-1" className="relative w-full h-full flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isActive ? 1 : 0.8, scale: isActive ? 1 : 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Glass morphism card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl overflow-hidden border border-gray-200/50">
          {/* Gradient header */}
          <div className={`bg-gradient-to-br ${gradient} p-8 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_50%)]" />
            <div className="relative flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30" />
              <div>
                <div className="font-semibold text-white text-sm">fitness.star</div>
                <div className="text-white/70 text-xs">Active now</div>
              </div>
            </div>
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
              <div className="aspect-video bg-gradient-to-br from-white/20 to-white/5 rounded-2xl mb-4 flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-white/50" />
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                Morning workout! Who&apos;s in? 💪
              </p>
            </div>
          </div>
          
          {/* Comment section */}
          <div className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">jessica_fit</span>
                  <span className="text-xs text-gray-400">2m</span>
                </div>
                <p className="text-sm text-gray-700">🙋‍♀️ Me!</p>
              </div>
            </div>
            
            {/* Auto-reply */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="ml-11 bg-gray-50 rounded-2xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-green-600">Auto-replied</span>
              </div>
              <p className="text-sm text-gray-700">Check your DM! 📩</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>,

    // Feature 2: Smart Follow Detection
    <div key="visual-2" className="relative w-full h-full flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isActive ? 1 : 0.8, scale: isActive ? 1 : 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="relative bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl overflow-hidden border border-gray-200/50">
          {/* Header with gradient */}
          <div className={`bg-gradient-to-br ${gradient} p-8 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),transparent_70%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-medium text-white mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Follower detected
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-white text-lg mb-1">sarah_creative</div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Following you</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action card */}
          <div className="p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200 space-y-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Sending exclusive content
              </div>
              <div className={`bg-gradient-to-br ${gradient} text-white rounded-xl px-5 py-3 text-center font-medium shadow-lg`}>
                🎁 Get Your Free Guide
              </div>
              <p className="text-xs text-gray-500 text-center">Only available to followers</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>,

    // Feature 3: Email Collection & Link Sharing
    <div key="visual-3" className="relative w-full h-full flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isActive ? 1 : 0.8, scale: isActive ? 1 : 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-[32px] shadow-2xl overflow-hidden border border-gray-800">
          {/* Chat header */}
          <div className="px-6 py-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
                <div>
                  <div className="font-semibold text-white text-sm">Customer Chat</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="p-6 space-y-4 min-h-[400px] flex flex-col justify-end">
            {/* Customer message */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0" />
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-gray-100">Do you sell black wallets?</p>
              </div>
            </div>

            {/* Bot response */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3 flex-row-reverse"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0`} />
              <div className={`bg-gradient-to-br ${gradient} rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]`}>
                <p className="text-sm text-white">Yes! What&apos;s your email? I&apos;ll send the link 🔗</p>
              </div>
            </motion.div>

            {/* Email provided */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0" />
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-gray-100">alex@company.com</p>
              </div>
            </motion.div>

            {/* Link sent */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-start gap-3 flex-row-reverse"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0`} />
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-white mb-2">Perfect! Here you go ✨</p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                  <p className="text-xs text-emerald-100 font-mono break-all">shop.com/black-wallet</p>
                </div>
              </div>
            </motion.div>
            
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-xs font-medium text-blue-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Email collected • Link sent
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>,

    // Feature 4: 24/7 Automation Dashboard
    <div key="visual-4" className="relative w-full h-full flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isActive ? 1 : 0.8, scale: isActive ? 1 : 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="relative bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl overflow-hidden border border-gray-200/50">
          {/* Dashboard header */}
          <div className={`bg-gradient-to-br ${gradient} p-8 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.2),transparent_60%)]" />
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Automation Status</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>Active 24/7</span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-white/60" />
              </div>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">847</div>
                  <div className="text-xs text-white/70">Messages sent</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">94%</div>
                  <div className="text-xs text-white/70">Response rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active features */}
          <div className="p-6 space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">Comment monitoring</div>
                <div className="text-xs text-gray-500">Real-time tracking</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">Instant DM replies</div>
                <div className="text-xs text-gray-500">Automated responses</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">Lead collection</div>
                <div className="text-xs text-gray-500">Building your list</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>,
  ]

  return visuals[index]
}
