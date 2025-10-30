'use client'
export const dynamic = 'force-dynamic';


import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, X,  MessageSquare } from "lucide-react"
import { Footer } from '@/components/landing/footer'
import { FAQ } from '@/components/landing/faq'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Star, 
  Users, 
  MessageCircle, 
  Zap, 
  Shield, 
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  ChevronDown,
  Play,
  ArrowRight,
  Target
} from 'lucide-react'
import Navbar from '@/components/pagenavbar'

// Refined minimalist Badge component
const Badge = ({ children, variant = 'default', className = '', size = 'default' }: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'premium'
  className?: string
  size?: 'sm' | 'default' | 'lg'
}) => {
  const variants = {
    default: 'bg-white text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    danger: 'bg-rose-50 text-rose-600 border border-rose-200',
    warning: 'bg-amber-50 text-amber-600 border border-amber-200',
    premium: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border border-indigo-500/30'
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium tracking-tight transition-colors duration-300 ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

// Floating animation component
const FloatingElement = ({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) => {
  return (
    <div 
      className={`animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

// Gradient text component
const GradientText = ({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <span className={`bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

// Animated reveal component using IntersectionObserver
const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number; y?: number; once?: boolean; }>=({ children, className='', delay=0, y=24, once=true })=>{
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible,setVisible]=useState(false)
  useEffect(()=>{
    const el=ref.current
    if(!el) return
    const obs=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          setVisible(true)
          if(once) obs.unobserve(e.target)
        }
      })
    },{ threshold:0.15 })
    obs.observe(el)
    return ()=>obs.disconnect()
  },[once])
  return <div ref={ref} style={{transitionDelay:`${delay}ms`}} className={`transition-all duration-700 ease-out will-change-transform ${visible? 'opacity-100 translate-y-0' : `opacity-0 translate-y-[${y}px]`} ${className}`}>{children}</div>
}

// Animated number counter
const AnimatedCounter: React.FC<{ value: number; duration?: number; suffix?: string; className?: string; startOnView?: boolean }>=({ value, duration=1800, suffix='', className='', startOnView=true })=>{
  const [display,setDisplay]=useState(0)
  const ref=useRef<HTMLSpanElement|null>(null)
  const started=useRef(false)
  useEffect(()=>{
    if(!startOnView){
      started.current=true
      animate()
      return
    }
    const el=ref.current
    if(!el) return
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting && !started.current){
          started.current=true
          animate()
          obs.disconnect()
        }
      })
    },{ threshold:0.3 })
    obs.observe(el)
    return ()=>obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  function animate(){
    const start=performance.now()
    function step(ts:number){
      const progress=Math.min(1,(ts-start)/duration)
      const eased=1-Math.pow(1-progress,3)
      setDisplay(Math.floor(eased*value))
      if(progress<1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  return <span ref={ref} className={className}>{display.toLocaleString()}{progressDisplay(display, value)? suffix: ''}{display>=value ? suffix: ''}</span>
}

function progressDisplay(current:number, target:number){
  return current>=target
}

// Subtle tilt interaction wrapper
const Tilt: React.FC<{ children: React.ReactNode; className?: string; max?: number; scale?: number }>=({ children, className='', max=12, scale=1.02 })=>{
  const ref=useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    const el=ref.current
    if(!el) return
    function handle(e:MouseEvent){
      if(!el) return
      const r=el.getBoundingClientRect()
      const x=(e.clientX-r.left)/r.width
      const y=(e.clientY-r.top)/r.height
      const rx=(y-0.5)*max
      const ry=(x-0.5)*-max
      el.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`
    }
    function reset(){
      if(!el) return
      el.style.transform='perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'
    }
    el.addEventListener('pointermove',handle)
    el.addEventListener('pointerleave',reset)
    return ()=>{
      el.removeEventListener('pointermove',handle)
      el.removeEventListener('pointerleave',reset)
    }
  },[max,scale])
  return <div ref={ref} className={`transition-transform duration-300 ease-out ${className}`}>{children}</div>
}

const LinkdmComparePage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('features')

  useEffect(() => {
    setIsVisible(true)
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "ChatAutoDM vs Chatfuel Comparison",
      "description": "Comprehensive comparison between ChatAutoDM and Chatfuel Instagram automation platforms. Compare features, pricing, and capabilities.",
      "url": "https://chatautodm.com/compare/chatfuel",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://chatautodm.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Compare",
            "item": "https://chatautodm.com/compare"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "ChatAutoDM vs Chatfuel",
            "item": "https://chatautodm.com/compare/chatfuel"
          }
        ]
      },
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the best alternative to Chatfuel?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ChatAutoDM is the best Chatfuel alternative, offering unlimited contacts, more affordable pricing, and powerful Instagram-focused automation features including DM automation, comment replies, and story mentions."
            }
          },
          {
            "@type": "Question",
            "name": "How much does ChatAutoDM cost compared to Chatfuel?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ChatAutoDM offers a forever-free plan with unlimited features. Chatfuel starts at $15/month with limited contacts, while ChatAutoDM provides unlimited contacts and advanced automation at no cost."
            }
          },
          {
            "@type": "Question",
            "name": "Does ChatAutoDM support Instagram automation like Chatfuel?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, ChatAutoDM is a Meta-verified technology provider supporting full Instagram automation including DM automation, comment-to-DM, story replies, and more - with better Instagram-specific features than Chatfuel."
            }
          },
          {
            "@type": "Question",
            "name": "Is ChatAutoDM better than Chatfuel for Instagram?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ChatAutoDM is specifically built for Instagram automation, while Chatfuel focuses on multiple platforms. This makes ChatAutoDM more specialized with deeper Instagram features, better pricing, and simpler setup for Instagram use cases."
            }
          }
        ]
      }
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(structuredData)
    document.head.appendChild(script)
    
    // Add custom CSS for animations
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient 3s ease infinite;
      }
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      /* Premium glow hover */
      .glow-hover:hover {
        box-shadow: 0 0 0 1px rgba(139,92,246,0.25), 0 4px 24px -4px rgba(99,102,241,0.4), 0 0 0 4px rgba(255,255,255,0.05);
      }
  .row-glow:hover td { background: linear-gradient(90deg, rgba(99,102,241,0.04), rgba(139,92,246,0.04)); }
      .gradient-border {
        position: relative;
        background-clip: padding-box;
      }
      .gradient-border:before {
        content:"";
        position:absolute;inset:0;padding:1px;border-radius:inherit;pointer-events:none;
        background:linear-gradient(110deg,#6366f1, #8b5cf6, #0ea5e9);
        -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite:xor;mask-composite:exclude;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
          
      
      
      <div className="min-h-screen bg-white">
  <Navbar />

  {/* Hero Section - SEO optimized */}
  <section className="relative min-h-[70vh] pt-32 flex flex-col items-center justify-center overflow-hidden bg-white text-black px-4">
    <div className="absolute inset-0">
      {/* Optional background image */}
      {/* <Image src="/hero-bg.jpg" alt="Hero Background" layout="fill" objectFit="cover" priority /> */}
      <div className="bg-black/5" />
    </div>

    <div className="relative z-10 text-center max-w-4xl">
      {/* Logo placeholders with proper SEO */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
        <div className="flex items-center gap-2">
          <h2 className="text-base md:text-lg font-bold">ChatAutoDM</h2>
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src="/logo-branding2.png"
              alt="ChatAutoDM Logo - Instagram Automation Platform"
              className="w-10 h-10 object-contain"
              width={40}
              height={40}
            />
          </div>
        </div>

        <span className="font-bold text-base md:text-lg" aria-label="versus">vs</span>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src="/chatfuellogo.png"
              alt="Chatfuel Logo - Facebook Messenger Bot"
              className="w-10 h-10 object-contain"
              width={40}
              height={40}
            />
          </div>
          <h2 className="text-base md:text-lg font-bold">ChatFuel</h2>
        </div>
      </div>

      {/* Hero text - Primary H1 for SEO */}
      <h1 className="text-3xl md:text-5xl font-bold mb-3">
        Looking for the Best Chatfuel Alternative?
      </h1>
      <p className="text-xl md:text-2xl font-semibold mb-6 text-gray-800">
        ChatAutoDM - Better Instagram Automation & Lower Cost
      </p>
      <p className="text-base md:text-lg text-gray-700 mb-8">
        Get unlimited contacts, Instagram-native features, and affordable pricing. Join 50,000+ businesses who switched from Chatfuel.
      </p>

      {/* CTA button */}
      <Link href="/" aria-label="Start using ChatAutoDM for free">
  <button className="px-6 py-3 mb-12 bg-[#3076fd] hover:bg-[#1d5ddb] text-white font-semibold rounded-xl shadow-md transition" aria-label="Get started with ChatAutoDM free trial">
    Start Free - No Credit Card Required
  </button>
</Link>

      {/* Unique highlights - SEO rich content */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mb-20 text-left">
        <article className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
          <div className="w-10 h-10 mx-auto mb-3 bg-[#3076fd]/10 rounded-full flex items-center justify-center text-[#3076fd] font-bold">
            ✓
          </div>
          <h3 className="text-[#3076fd] font-semibold mb-2">
            Instagram-Native Platform
          </h3>
          <p className="text-gray-600 text-sm">
            Unlike Chatfuel's Facebook focus, ChatAutoDM is built specifically for Instagram automation with native features.
          </p>
        </article>

        <article className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
          <div className="w-10 h-10 mx-auto mb-3 bg-[#3076fd]/10 rounded-full flex items-center justify-center text-[#3076fd] font-bold">
            💰
          </div>
          <h3 className="text-[#3076fd] font-semibold mb-2">
            More Affordable Pricing
          </h3>
          <p className="text-gray-600 text-sm">
            Save money with transparent pricing and unlimited contacts. No per-user fees like Chatfuel.
          </p>
        </article>

        <article className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
          <div className="w-10 h-10 mx-auto mb-3 bg-[#3076fd]/10 rounded-full flex items-center justify-center text-[#3076fd] font-bold">
            ⭐
          </div>
          <h3 className="text-[#3076fd] font-semibold mb-2">
            24/7 Human Support
          </h3>
          <p className="text-gray-600 text-sm">
            Get instant help from real automation experts. No bots, no waiting - just solutions when you need them.
          </p>
        </article>
      </div>
    </div>
  </section>

      
      <div >
        {/* Hero Section refined */}
       {/* <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-white text-black px-4"> */}
         {/* <div className="absolute inset-0"> */}
           {/* <Image src="/hero-bg.jpg" alt="Hero Background" layout="fill" objectFit="cover" priority /> */}
           {/* <div className="bg-black/30" />
         </div>
         <div className="relative z-10">
           <h1 className="text-5xl font-bold items-center justify-center mb-4">Looking for the best</h1>
           <h1 className="text-5xl font-bold mb-4">alternative for manychat?</h1>
           <p className="text-lg">The ultimate solution for automated messaging on social media.</p>
         </div> */}
          
         
       {/* </section> */}
          {/* <div className="bg-black text-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          Why Choose <span className="text-[#3076fd]">ChatAutoDM</span> over ManyChat?
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ManyChat Issues */}
          {/* <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-red-400 mb-3">
              ManyChat is Costlier
            </h3>
            <p className="text-zinc-400">
              Higher monthly pricing with fewer features compared to ChatAutoDM. 
              Scaling costs rise quickly for growing businesses.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-red-400 mb-3">
              Limited Value for Money
            </h3>
            <p className="text-zinc-400">
              ManyChat often charges extra for automation features that 
              ChatAutoDM includes by default.
            </p>
          </div> */}
          

          {/* ChatAutoDM Strengths */}
          {/* <div className="bg-gradient-to-br from-purple-600 to-purple-400 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-3">
              ChatAutoDM: Best Value
            </h3>
            <p className="text-white/90">
              Offers enterprise-level automation and integrations at a 
              fraction of ManyChat’s cost. Perfect for startups & scaling brands.
            </p>
          </div> */}

          {/* <div className="bg-gradient-to-br from-purple-600 to-purple-400 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-3">
              Transparent & Affordable
            </h3>
            <p className="text-white/90">
              Simple pricing model with no hidden fees. Pay less, do more.
            </p>
          </div>
        </div>

        <p className="mt-10 text-sm text-zinc-500">
          Sourced from verified user feedback & real pricing comparisons.
        </p> */}
      {/* </div> */}
     {/* </div> */}
    <section>
       <div className="bg-black text-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          Why Choose <span className="text-purple-400">ChatAutoDM</span> over ChatFuel?
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* LinkDM Issues */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition text-left">
            {/* ❌ Icon Placeholder */}
            
            <div className="mb-3 w-8 h-8 bg-red-500/30 rounded flex items-center justify-center">
              {/* <span className="text-red-400 font-bold">X</span> */}
              <img src='/chatfuellogo.png' alt='ManyChat Logo' className='w-8 h-8 rounded'/>
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              ChatFuel is Costlier
            </h3>
            <p className="text-zinc-400">
              Higher monthly pricing with fewer features compared to ChatAutoDM. 
              Scaling costs rise quickly for growing businesses.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition text-left">
            {/* ❌ Icon Placeholder */}
            <div className="mb-3 w-8 h-8 bg-red-500/30 rounded flex items-center justify-center">
              {/* <span className="text-red-400 font-bold">X</span> */}
              <img src='/chatfuellogo.png' alt='ManyChat Logo' className='w-8 h-8 rounded'/>
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Limited Value for Money
            </h3>
            <p className="text-zinc-400">
              ChatFuel often charges extra for automation features that 
              ChatAutoDM includes by default.
            </p>
          </div>

          {/* ChatAutoDM Strengths */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-400
 rounded-2xl p-6 shadow-lg hover:shadow-xl transition text-left">
            {/* ✅ Icon Placeholder */}
            <div className="mb-3 w-8 h-8 bg-white/20 rounded flex items-center justify-center">
              {/* <span className="text-white font-bold">✓</span> */}
              <img src='/logo-branding2.png' alt='ManyChat Logo' className='w-8 h-8 rounded'/>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              ChatAutoDM: Best Value
            </h3>
            <p className="text-white/90">
              Offers enterprise-level automation and integrations at a 
              fraction of ChatFuel’s cost. Perfect for startups & scaling brands.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-400
 rounded-2xl p-6 shadow-lg hover:shadow-xl transition text-left">
            {/* ✅ Icon Placeholder */}
            <div className="mb-3 w-8 h-8 bg-white/20 rounded flex items-center justify-center">
              {/* <span className="text-white font-bold">✓</span>
               */}
              <img src='/logo-branding2.png' alt='ManyChat Logo' className='w-8 h-8 rounded'/>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Transparent & Affordable
            </h3>
            <p className="text-white/90">
              Simple pricing model with no hidden fees. Pay less, do more.
            </p>
          </div>
        </div>

        <p className="mt-10 text-sm text-zinc-500">
          Sourced from verified user feedback & real pricing comparisons.
        </p>
      </div>
    </div>
    </section>

        {/* Stats Section refined */}
        {/* <section className="py-20 bg-white/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Users, value: 50000, suffix:'+', label: 'Teams Onboarded' },
                { icon: MessageCircle, value: 10000000, suffix:'+', label: 'Messages Orchestrated' },
                { icon: TrendingUp, value: 99.9, suffix:'%', label: 'Measured Uptime', isFloat:true },
                { icon: Award, value: 4.9, suffix:'★', label: 'User Rating', isFloat:true }
              ].map((stat, index) => (
                <Reveal key={index} delay={index*120}>
                  <div className="text-center p-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm h-full flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-slate-900 text-white mb-4">
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">
                      {stat.isFloat ? stat.value + stat.suffix : <AnimatedCounter value={stat.value as number} suffix={stat.suffix} />}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{stat.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section> */}
         {/* Feature Comparison Table */}
      <section id="comparison" className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Feature Comparison</h2>
            <p className="text-xl text-muted-foreground">See how ChatAutoDM stacks up against ChatFuel</p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50">
              <div className="p-6">
                <h3 className="font-semibold text-lg">Feature</h3>
              </div>
              <div className="p-6 text-center border-l border-border">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <img src="/logo-branding2.png" className='rounded' />
                  </div>
                  <span className="font-semibold">ChatAutoDM</span>
                </div>
              </div>
              <div className="p-6 text-center border-l border-border">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
                     <img src="/chatfuellogo.png" className='corner round' />
                  </div>
                  <span className="font-semibold">ChatFuel</span>
                </div>
              </div>
            </div>

            {[
              { feature: "Price", chatautodm: "Free & Unlimited for now", manychat: "$15/- but only 1000 contacts" },
              {
                feature: "Direct messages",
                chatautodm: "Unlimited",
                manychat: "Unlimited, but increases contacts which increases pricing",
              },
              { feature: "Contacts", chatautodm: "Unlimited", manychat: "Prices increase with contacts" },
              { feature: "Meta verified tech provider", chatautodm: true, manychat: true },
              { feature: "Forever free tier", chatautodm: true, manychat: "YES, BUT limited" },
              { feature: "Next post feature", chatautodm: true, manychat: true },
              { feature: "Ask for follow feature", chatautodm: true, manychat: true },
              { feature: "Comment reply", chatautodm: true, manychat: true },
              { feature: "Rerun automation", chatautodm: true, manychat: false },
              { feature: "Forms", chatautodm: false, manychat: false },
              { feature: "Story reply automation", chatautodm: true, manychat: true },
              { feature: "DM to DM automation", chatautodm: true, manychat: true },
              { feature: "Opening message", chatautodm: true, manychat: true },
            ].map((row, index) => (
              <div key={index} className="grid grid-cols-3 border-t border-border">
                <div className="p-6">
                  <span className="font-medium">{row.feature}</span>
                </div>
                <div className="p-6 text-center border-l border-border">
                  {typeof row.chatautodm === "boolean" ? (
                    row.chatautodm ? (
                      <Badge variant="default" className="bg-primary text-primary-foreground">
                        <Check className="w-4 h-4 mr-1" />
                        YES
                      </Badge>
                    ) : (
                      <Badge variant="danger">
                        <X className="w-4 h-4 mr-1" />
                        NO
                      </Badge>
                    )
                  ) : (
                    <span className="text-sm">{row.chatautodm}</span>
                  )}
                </div>
                <div className="p-6 text-center border-l border-border">
                  {typeof row.manychat === "boolean" ? (
                    row.manychat ? (
                      <Badge variant="default" className="bg-muted-foreground text-background">
                        <Check className="w-4 h-4 mr-1" />
                        YES
                      </Badge>
                    ) : (
                      <Badge variant="danger">
                        <X className="w-4 h-4 mr-1" />
                        NO
                      </Badge>
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">{row.manychat}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      

        {/* Testimonials refined */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
                Trusted by Product-Led Teams
              </h2>
              <p className="text-base text-slate-600 max-w-2xl mx-auto">
                Operators and growth leaders choose ChatAutoDM for reliability, scale and clarity of insight.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  text: "Switching to ChatAutoDM was the best decision for our business. 80% cost reduction and zero downtime , Absolutely Awesome!",
                  author: "Sarah Johnson",
                  role: "Marketing Director",
                  company: "TechStart Inc.",
                  avatar: "SJ",
                  stats: "↑ 300% engagement"
                },
                {
                  text: "The reliability is incredible. Our campaigns run flawlessly 24/7 without any manual intervention needed.",
                  author: "Michael Chen",
                  role: "Growth Manager", 
                  company: "E-commerce Pro",
                  avatar: "MC",
                  stats: "↑ 250% conversions"
                }
              ].map((testimonial, index) => (
                <FloatingElement key={index} delay={index * 0.3}>
                  <Card className="bg-white border border-slate-200 hover:border-slate-300 transition-colors duration-300 shadow-sm hover:shadow-md">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-5 mb-6">
                        <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium tracking-tight">
                          {testimonial.avatar}
                        </div>
                        <div className="flex-1">
                          <blockquote className="text-base font-medium mb-4 text-slate-800 leading-relaxed">
                            “{testimonial.text}”
                          </blockquote>
                          <div className="text-sm">
                            <div className="font-semibold text-slate-900">{testimonial.author}</div>
                            <div className="text-slate-500">{testimonial.role} — {testimonial.company}</div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-md px-3 py-1 inline-block bg-emerald-50 border border-emerald-200">
                        <span className="text-emerald-600 font-medium text-xs tracking-wide">{testimonial.stats}</span>
                      </div>
                    </CardContent>
                  </Card>
                </FloatingElement>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA refined */}
        <section className="py-24 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h2 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6">
                Ready to <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Upgrade</span>?
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Join the teams replacing legacy chat automation with a platform engineered for reliability and scale.
              </p>
            </div>

            <Link href="/">

           <button className="bg-[#3076fd] text-slate-900 hover:bg-slate-100 font-medium px-8 py-4 rounded-lg inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition">
            GET STARTED FREE
            <ArrowRight className="h-5 w-5" />
           </button>
           </Link>

            <div className="text-sm text-slate-400">
              <p className="mt-6">No lock‑in • SOC2 in progress • Production‑grade infrastructure</p>
            </div>
            <div className="text-sm text-slate-400 mt-2">
              <p>Need help deciding? <a href="/contact" className="underline hover:text-white">Contact us</a> for a personalized consultation.</p>
            </div>
          </div>
        </section>
      </div>
      {/* </FAQ /> */}
      <Footer />
      
    </div>
  )
}

export default LinkdmComparePage
