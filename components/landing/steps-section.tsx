"use client"

import { Button } from "@/components/ui/button"
import { UserPlus, Link2, Rocket } from "lucide-react"
import { motion } from "framer-motion"

export function StepsSection() {
  const steps = [
    {
      number: 1,
      title: "Sign up for free",
      description: "Start your free trial — no credit card required",
      icon: UserPlus,
      color: "from-yellow-400 to-yellow-300",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      number: 2,
      title: "Connect to your channels",
      description: "Link all your favorite social or messaging apps",
      icon: Link2,
      color: "from-purple-300 to-purple-200",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      number: 3,
      title: "Go live in minutes",
      description: "Automate your selling, replying, and so much more!",
      icon: Rocket,
      color: "from-pink-300 to-pink-200",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
    },
  ]

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent"
          >
            Get Started in 3 Easy Steps
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Start automating your Instagram DMs and boost engagement in minutes
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Card */}
                <div className="relative h-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  {/* Decorative gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative p-8 md:p-10 h-full flex flex-col">
                    {/* Icon Container */}
                    <div className={`${step.bgColor} rounded-2xl w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-10 h-10 md:w-12 md:h-12 ${step.iconColor}`} strokeWidth={2} />
                    </div>

                    {/* Step Number Badge */}
                    <div className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg md:text-xl">{step.number}</span>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 group-hover:text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-base md:text-lg text-gray-600 leading-relaxed group-hover:text-gray-700">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={() => (window.location.href = "/api/auth/google")}
            size="lg"
            className="bg-black hover:bg-gray-800 text-white font-semibold text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Get Started Free
          </Button>
          <Button
            onClick={() => (window.location.href = "/pricing")}
            variant="outline"
            size="lg"
            className="border-2 border-gray-300 hover:border-gray-900 text-gray-900 font-semibold text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-full transition-all duration-300 hover:scale-105"
          >
            See Plans
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
