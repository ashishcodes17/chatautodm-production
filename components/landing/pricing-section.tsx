"use client"

import React, { useState } from 'react'

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center px-4 md:px-6 py-16 md:py-24">
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
        <div className="flex items-center justify-center gap-4">
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
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-md hover:shadow-xl transition-all p-8 space-y-6 border border-gray-200">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">Starter plan</h3>
              <p className="text-gray-500 text-sm leading-tight">
                For individuals & new<br />creators
              </p>
            </div>

            <div className="flex items-baseline gap-1 pb-2">
              <span className="text-6xl font-bold text-gray-900">
                ${isYearly ? '15' : '19'}
              </span>
              <span className="text-gray-500 text-base">/month</span>
            </div>

            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-full font-semibold transition-all shadow-md hover:shadow-lg text-base">
              Get Started
            </button>

            <div className="pt-4 space-y-4 bg-gradient-to-br from-gray-100/50 to-gray-50/50 rounded-2xl p-6 -mx-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Included features:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">1 active project</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Basic collaboration tools</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Limited prototyping options</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">500MB cloud storage</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400 line-through">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Seamless third-party integrations</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400 line-through">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Community support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan - Featured */}
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 space-y-6 border border-gray-200 relative">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">Pro plan</h3>
              <p className="text-gray-500 text-sm leading-tight">
                For freelancers & small<br />teams
              </p>
            </div>

            <div className="flex items-baseline gap-1 pb-2">
              <span className="text-6xl font-bold text-gray-900">
                ${isYearly ? '39' : '49'}
              </span>
              <span className="text-gray-500 text-base">/month</span>
            </div>

            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl text-base">
              Get Started
            </button>

            <div className="pt-4 space-y-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl p-6 -mx-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Included features:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Unlimited projects</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Real-time collaboration</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Advanced prototyping tools</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Cloud storage & version history</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Seamless third-party integrations</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400 line-through">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Email & chat support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Business Plan */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-md hover:shadow-xl transition-all p-8 space-y-6 border border-gray-200">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">Business plan</h3>
              <p className="text-gray-500 text-sm leading-tight">
                For growing teams &<br />agencies
              </p>
            </div>

            <div className="flex items-baseline gap-1 pb-2">
              <span className="text-6xl font-bold text-gray-900">
                ${isYearly ? '63' : '79'}
              </span>
              <span className="text-gray-500 text-base">/month</span>
            </div>

            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-full font-semibold transition-all shadow-md hover:shadow-lg text-base">
              Get Started
            </button>

            <div className="pt-4 space-y-4 bg-gradient-to-br from-gray-100/50 to-gray-50/50 rounded-2xl p-6 -mx-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Included features:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Everything in Pro +</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Team management & permissions</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Enhanced security controls</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Priority integrations & API access</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">Advanced cloud storage</span>
                </li>
                <li className="flex items-start gap-2 text-gray-800">
                  <span className="text-base mt-0.5">•</span>
                  <span className="text-base">24/7 priority support</span>
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
