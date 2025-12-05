"use client"

import React from 'react'
import { useState } from 'react';

const TestimonialsSection = () => {
  const [open, setOpen] = useState(false);
   const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }
  const testimonials = [
    {
      name: "Sandhya Techy",
      handle: "@sandhyatechy",
      content: "ChatAutoDM helped me increase sales by 73% in just 3 weeks! Auto-replies capture every lead while I sleep.",
      image: "/sandhyatechy.jpg",
    },
    {
      name: "BB Edits",
      handle: "@bb_edits00",
      content: "I used to spend 3+ hours daily replying to DMs. Now ChatAutoDM handles it all automatically. Game changer!",
      image: "/bbedits.jpg",
    },
    {
      name: "Designer Rajesh",
      handle: "@designer.rajesh",
      content: "My Instagram revenue increased after setting up automated flows. Every comment gets an instant reply with my resources link!",
      image: "/designerrajesh.jpg",
    },
    {
      name: "Faizah",
      handle: "@faizahfett",
      content: "ChatAutoDM turned my Instagram into a 24/7 sales machine. I'm capturing leads I would've missed before!",
      image: "/faizah.jpg",
    },
    {
      name: "Tejash",
      handle: "@fitwtej",
      content: "Best investment for my handle! Auto-replies + link sharing = more conversions with zero manual work.",
      image: "/fitwtej.jpg",
    },
    {
      name: "Madhura UX Designer",
      handle: "@uiuxmadhura",
      content: "Finally! A tool that sends links automatically when people comment. My engagement went through the roof!",
      image: "/madhuui.jpg",
    },
    {
      name: "Ajay Kumar",
      handle: "@the_exploreguy47",
      content: "ChatAutoDM's automation captured 200+ qualified leads in my first week. The ROI is incredible!",
      image: "/ajay.jpg",
    },
    {
      name: "Venkey tech",
      handle: "@venkeytech",
      content: "I went from manually DMing 50+ people daily to fully automated conversations. More time for creating content!",
      image: "/venkytech.jpg",
    },
    {
      name: "Diptimai Sahoo",
      handle: "@diptimaisahoo4",
      content: "Every Instagram post now drives traffic to my funnel automatically. ChatAutoDM handles all the heavy lifting!",
      image: "/diptimai.jpg",
    },
    // {
    //   name: "Sophia Martinez",
    //   handle: "@sophiawellness",
    //   content: "No more lost leads! ChatAutoDM instantly replies to every DM and shares my calendar link. Sales up 2x!",
    //   image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&h=400&fit=crop",
    // },
    // {
    //   name: "Ryan Pierce",
    //   handle: "@ryanbuilds",
    //   content: "Automated DM flows brought in $12K in new revenue last month. This tool pays for itself 100x over!",
    //   image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
    // },
    // {
    //   name: "Lisa Chen",
    //   handle: "@lisacreative.studio",
    //   content: "ChatAutoDM's smart replies feel natural and convert like crazy. My followers love the instant responses!",
    //   image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    // }
  ]

  return (
    <section className="relative bg-white py-24 md:py-32 overflow-hidden">
      
      <div className="max-w-[100vw] mx-auto relative">
        {/* Header */}
        <div className="text-center space-y-6 mb-16 px-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
            Join <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Thousands of</span> creators
            <br />
            and businesses
          </h2>
        </div>

        {/* Testimonials Rows - 4 rows with alternating scroll */}
        <div className="relative space-y-6">
          {/* Row 1 - Scrolling Right */}
          <div className="overflow-hidden">
            <div className="flex gap-4 animate-scroll-right">
              {[...testimonials.slice(0, 3), ...testimonials.slice(0, 3), ...testimonials.slice(0, 3)].map((testimonial, index) => (
                <div
                  key={`row1-${index}`}
                  className="flex-shrink-0 w-[400px]"
                >
                  <div className="bg-white rounded-2xl p-6   shadow-sm  transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{testimonial.name}</p>
                        <p className="text-xs text-gray-500 truncate">{testimonial.handle}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - Scrolling Left */}
          <div className="overflow-hidden">
            <div className="flex gap-4 animate-scroll-left">
              {[...testimonials.slice(3, 6), ...testimonials.slice(3, 6), ...testimonials.slice(3, 6)].map((testimonial, index) => (
                <div
                  key={`row2-${index}`}
                  className="flex-shrink-0 w-[400px]"
                >
                  <div className="bg-white rounded-2xl p-6   shadow-sm  transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{testimonial.name}</p>
                        <p className="text-xs text-gray-500 truncate">{testimonial.handle}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3 - Scrolling Right */}
          <div className="overflow-hidden">
            <div className="flex gap-4 animate-scroll-right">
              {[...testimonials.slice(6, 9), ...testimonials.slice(6, 9), ...testimonials.slice(6, 9)].map((testimonial, index) => (
                <div
                  key={`row3-${index}`}
                  className="flex-shrink-0 w-[400px]"
                >
                  <div className="bg-white rounded-2xl p-6   shadow-sm  transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{testimonial.name}</p>
                        <p className="text-xs text-gray-500 truncate">{testimonial.handle}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4 - Scrolling Left */}
          <div className="overflow-hidden">
            <div className="flex gap-4 animate-scroll-left">
              {[...testimonials.slice(9, 12), ...testimonials.slice(9, 12), ...testimonials.slice(9, 12)].map((testimonial, index) => (
                <div
                  key={`row4-${index}`}
                  className="flex-shrink-0 w-[400px]"
                >
                  <div className="bg-white rounded-2xl p-6   shadow-sm  transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{testimonial.name}</p>
                        <p className="text-xs text-gray-500 truncate">{testimonial.handle}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center px-4">
          <div className="inline-flex flex-col items-center gap-4">
            <p className="text-lg text-gray-600">Ready to transform your Instagram engagement?</p>
            <button 
            onClick={handleGoogleLogin}
            className="
            group
  relative
  flex 
  items-center 
  justify-center
  gap-2
  px-16
  py-4
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
 ">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
