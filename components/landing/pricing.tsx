"use client"

import React, { useState } from 'react'

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false)
  const [open, setOpen] = useState(false);
   const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <section className="min-h-screen bg-white flex flex-col items-center justify-center px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">
            Flexible pricing plans
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Choose a plan that grows with you. Start for free and upgrade<br className="hidden md:block" />
            anytime for more features and support
          </p>
        </div>

        {/* Toggle Switch */}
        {/* <div className="flex items-center justify-center gap-4">
          <span className={`text-base font-medium transition-colors ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                isYearly ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-base font-medium transition-colors ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-full">
              20%off
            </span>
          )}
        </div> */}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
        {/* Starter Plan */}
<div className="bg-gray-100 pt-2 px-1 rounded-3xl shadow-md shadow-xl transition-all border border-gray-200">

  {/* INNER WHITE CARD */}
  <div className="bg-white rounded-2xl mx-1 p-6">

    {/* Title + Subtitle */}
    <h3 className="text-2xl font-bold text-gray-900">Free plan</h3>
    <p className="text-gray-500 text-sm pt-1 leading-tight">
      For individuals & new <br /> creators
    </p>

    {/* Price */}
    <div className="pt-4 space-y-1">
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-2xl line-through">₹{isYearly ? "0" : "0"}</span>
        <span className="text-xs uppercase tracking-widest">was</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-6xl font-bold text-gray-900">₹0</span>
        <span className="text-gray-500 text-base">/month</span>
      </div>
      <p className="text-xs font-semibold text-emerald-600">Limited-time: full access for free</p>
    </div>

    {/* Button */}
    <div className="pt-6">
      {/* <button className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-full font-semibold transition-all shadow-[0_4px_16px_rgba(0,0,0,0.25)] text-base">
        Get Started
      </button> */}
      {/* <button className="
  w-full 
  text-white 
  font-semibold 
  py-4 
  rounded-full 
  transition-all 
  shadow-[0_6px_20px_rgba(0,0,0,0.25)] 
  bg-gradient-to-b from-[#1b1b1b] to-[#3a3a3a]
  border border-black/20
  relative
  overflow-hidden
">
  {/* Shine Layer */}
  {/* <span className="
    absolute inset-0 
    bg-gradient-to-b 
    from-white/10 
    to-transparent
  "></span>

  <span className="relative z-10">
    Get Started
  </span>
</button> */} 
 <button
 onClick={handleGoogleLogin}
 className="
  group
  relative
  flex 
  items-center 
  justify-center
  px-12 
  py-2.5 
  rounded-full 
  text-white 
  font-semibold 
  text-xl
  border 
  border-black/40

  bg-[linear-gradient(to_bottom,_#1a1a1a,_#222222,_#2d2d2d)]
  shadow-[0_8px_30px_rgba(0,0,0,0.40)]

  transition-all 
  duration-200 
  
"
>
  Get Started

  {/* <span
    className="
      flex 
      items-center 
      justify-center 
      h-12 
      w-12 
      rounded-full 
      bg-white 
      text-black 
      shadow-md
      transition-transform
      duration-200
      group-hover:translate-x-1
    "
  >
    →
  </span> */}
</button>


    </div>

  </div> {/* END WHITE CARD */}

  {/* FEATURES SECTION (outside white card) */}
  <div className="pt-4 space-y-2 rounded-2xl p-6">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Included features:
    </p>

    <ul className="space-y-3">
      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
       Unlimited Automation Flows
      </li>

      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        1000 Monthly Contacts
      </li>

      {/* <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        1000 Contacts 
      </li> */}

      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Basic Analytics
      </li>

      <li className="flex items-start gap-2 text-gray-400 line-through">
        <span className="mt-0.5">•</span>
        Ask to Follow
      </li>

       <li className="flex items-start gap-2 text-gray-400 line-through">
        <span className="mt-0.5">•</span>
        AI FAQ's & Responses
      </li>

      <li className="flex items-start gap-2 text-gray-400 line-through">
        <span className="mt-0.5">•</span>
        Collect Data
      </li>
    </ul>
  </div>

</div>

          {/* Pro Plan - Featured */}
         <div className="bg-gray-100 pt-2 px-1 rounded-3xl shadow-md shadow-xl transition-all border border-gray-200">

  {/* INNER WHITE CARD */}
  <div className="bg-white rounded-2xl mx-1 p-6">

    {/* Title + Subtitle */}
    <h3 className="text-2xl font-bold text-gray-900">Pro plan</h3>
    <p className="text-gray-500 pt-1 text-sm leading-tight">
      For individuals & new <br /> creators
    </p>

    {/* Price */}
    <div className="pt-4 space-y-1">
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-2xl line-through">₹{isYearly ? "599" : "599"}</span>
        <span className="text-xs uppercase tracking-widest">was</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-6xl font-bold text-gray-900">₹0</span>
        <span className="text-gray-500 text-base">/month</span>
      </div>
      <p className="text-xs font-semibold text-emerald-600">All premium features, now free</p>
    </div>

    {/* Button */}
    <div className="pt-6">
      <button
      onClick={handleGoogleLogin}
  className="
    group
    relative
    flex 
    items-center 
    justify-center
    px-12 
    py-2.5 
    
    rounded-full 
    text-white 
    font-semibold 
    text-xl
    border 
    border-[#2a63d9]/50

    bg-[linear-gradient(to_bottom,_#3076fd,_#4d7dff,_#6ea0ff)]
    shadow-[0_8px_30px_rgba(48,118,253,0.45)]
    shadow-lg
   
    transition-all 
    duration-200 
    
  "
>
  Get Started

  {/* <span
    className="
      flex 
      items-center 
      justify-center 
      h-12 
      w-12 
      rounded-full 
      bg-white 
      text-black 
      shadow-md
      transition-transform
      duration-200
      group-hover:translate-x-1
    "
  >
    →
  </span> */}
</button>

    </div>

  </div> {/* END WHITE CARD */}

  {/* FEATURES SECTION (outside white card) */}
  <div className="pt-4 space-y-2 rounded-2xl p-6">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Included features:
    </p>

    <ul className="space-y-3">
      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Unlimited Automation Flows
      </li>

      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Unlimited Contacts
      </li>

      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Pro Analytics
      </li>

      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Ask to Follow
      </li>

      <li className="flex items-start gap-2 text-gray-800  ">
        <span className="mt-0.5">•</span>
       AI FAQ's & Responses
      </li>

      <li className="flex items-start gap-2 text-gray-400 line-through">
        <span className="mt-0.5">•</span>
        Community support
      </li>
    </ul>
  </div>

</div>

          {/* Business Plan */}
         <div className="bg-gray-100 pt-2 px-1 rounded-3xl shadow-md shadow-xl transition-all border border-gray-200">

  {/* INNER WHITE CARD */}
  <div className="bg-white rounded-2xl mx-1 p-6">

    {/* Title + Subtitle */}
    <h3 className="text-2xl font-bold text-gray-900">Elite plan</h3>
    <p className="text-gray-500 pt-1 text-sm leading-tight">
      For Agencies & new <br /> Businesses
    </p>

    {/* Price */}
    <div className="pt-4 space-y-1">
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-2xl line-through">₹{isYearly ? "999" : "1299"}</span>
        <span className="text-xs uppercase tracking-widest">was</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-6xl font-bold text-gray-900">₹0</span>
        <span className="text-gray-500 text-base">/month</span>
      </div>
      <p className="text-xs font-semibold text-emerald-600">Enterprise access, zero cost</p>
    </div>

    {/* Button */}
    <div className="pt-6">
      <button 
      onClick={handleGoogleLogin}
      className="
  group
  relative
  flex 
  items-center 
  justify-center
  px-12 
  py-2.5 
  rounded-full 
  text-white 
  font-semibold 
  text-xl
  border 
  border-black/40

  bg-[linear-gradient(to_bottom,_#1a1a1a,_#222222,_#2d2d2d)]
  shadow-[0_8px_30px_rgba(0,0,0,0.40)]
   
  transition-all 
  duration-200 
  
"
>
        Get Started
      </button>
    </div>

  </div> {/* END WHITE CARD */}

  {/* FEATURES SECTION (outside white card) */}
  <div className="pt-4 space-y-2 rounded-2xl p-6">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Included features:
    </p>

    <ul className="space-y-3">
      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Unlimited Automation Flows
      </li>

      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Unlimited Contacts
      </li>

      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Pro Analytics
      </li>

      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Ask to Follow
      </li>

      <li className="flex items-start gap-2 text-gray-800  ">
        <span className="mt-0.5">•</span>
       AI FAQ's & Responses
      </li>

      <li className="flex items-start gap-2 text-gray-800">
        <span className="mt-0.5">•</span>
        Community support
      </li>
    </ul>
  </div>

</div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
