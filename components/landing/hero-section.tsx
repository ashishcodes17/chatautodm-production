// import React from "react";


// const HeroSection = () => {
//   return (
//     <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 py-12 md:py-20 overflow-hidden">
//       {/* Gradient Background — inline style (RELIABLE) */}
//      <div
//   style={{
//     position: "absolute",
//     inset: 0,
//     pointerEvents: "none",
//     zIndex: 0,
//     background:
//       "linear-gradient(to bottom, white 0%, #e9f1ff 25%, #d4e5ff 60%, #c8dcff 80%, white 100%)",
//   }}
// />


//       {/* Content (above gradient) */}
//       <div className="relative z-10 w-full mx-auto text-center space-y-8 md:space-y-10">
//         <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2 rounded-full shadow-sm border text-sm font-medium">
//           <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs font-semibold">New</span>
//           <span className="text-gray-700">Turn Instagram DMs into revenue</span>
//         </div>

//         <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-black leading-[1.1]">
//           Convert DMs into <br className="hidden md:block" />
//           customers automatically.
//         </h1>

//         <p className="text-lg md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
//           Automate Instagram conversations with AI-powered responses. Never miss a sale—
//           engage with <span className="font-semibold text-gray-900">instant replies</span> and turn followers into paying customers.
//         </p>

//         <div className="pt-4">
//           <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-full text-lg font-semibold inline-flex items-center gap-2 transition-all shadow-lg hover:shadow-xl">
//             Start Free Trial
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//             </svg>
//           </button>
//         </div>
//         {/* Cards Section */}
//        <div className="pt-16 max-w-6xl mx-auto">
//   <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">

//     {/* Card 1 – wide */}
//     <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 min-h-[320px] flex flex-col justify-between">
//       <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-4 h-40 flex items-center justify-center">
//         <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></div>
//       </div>
//       <div>
//         <h3 className="text-xl font-bold text-gray-900 mb-2">AI Automation</h3>
//         <p className="text-gray-600 text-sm">
//           Respond to DMs instantly with intelligent AI-powered conversations
//         </p>
//       </div>
//     </div>

//     {/* Card 2 – narrow */}
//     <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 min-h-[320px] flex flex-col justify-between">
//       <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-4 h-40 flex items-center justify-center">
//         <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
//       </div>
//       <div>
//         <h3 className="text-xl font-bold text-gray-900 mb-2">Lead Capture</h3>
//         <p className="text-gray-600 text-sm">
//           Convert followers into qualified leads automatically
//         </p>
//       </div>
//     </div>

//   </div>
// </div>

//           {/* Card 3 */}
//           {/* <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 min-h-[320px] flex flex-col justify-between">
//             <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-4 h-40 flex items-center justify-center">
//               <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full"></div>
//             </div>
//             <div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Availability</h3>
//               <p className="text-gray-600 text-sm">Never miss a customer inquiry, day or night</p>
//             </div>
//           </div> */}
//         </div>

//         {/* Trust Badges Section */}
//         <div className="pt-16 md:pt-24 space-y-6">
//           <p className="text-sm md:text-base text-gray-500 font-medium">Trusted by leading companies</p>
          
//           <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
//             {/* Logo Placeholder 1 - Meta */}
//             <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
//               <div className="w-32 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
//                 Meta Logo
//               </div>
//               <div className="hidden md:block">
//                 <p className="text-xs font-semibold text-gray-700">Tech provider</p>
//               </div>
//             </div>

//             {/* Logo Placeholder 2 - Inc42 */}
//             <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
//               <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
//                 Inc42
//               </div>
//               <div className="hidden md:block">
//                 <p className="text-xs font-semibold text-gray-700">Top 30 Start-ups</p>
//                 <p className="text-xs text-gray-500">to look out for</p>
//               </div>
//             </div>

//             {/* Logo Placeholder 3 - Forbes */}
//             <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
//               <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
//                 Forbes
//               </div>
//               <div className="hidden md:block">
//                 <p className="text-xs font-semibold text-gray-700">Forbes 2022</p>
//                 <p className="text-xs text-gray-500">Top 200 companies</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       {/* </div> */}
//     </section>
//   );
// };

// export default HeroSection;



import React from "react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const HeroSection = () => {
  const [open, setOpen] = useState(false);
     const handleGoogleLogin = () => {
      window.location.href = "/api/auth/google"
    }
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 overflow-hidden">
      
      {/* Gradient Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "linear-gradient(to bottom, white 0%, #e9f1ff 25%, #d4e5ff 60%, #c8dcff 80%, white 100%)",
        }}
      />

      {/* HERO CONTENT */}
      <div className="relative z-10 w-full mx-auto text-center space-y-8 md:space-y-8 max-w-4xl">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2 rounded-full shadow-lg text-sm font-medium">
          <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs font-semibold">
            New
          </span>
          <span className="text-gray-700">Turn Instagram DMs into revenue</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-5xl lg:text-7xl font-black text-black leading-[0.9]">
         Automate Instagram DMs effortlessly. <br className="hidden md:block" />
         
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
       Grow your audience, capture more leads, and turn conversations into revenue — without living inside your DMs
        </p>

        {/* CTA */}
        <div className="pt-1 flex justify-center">
          <button 
           onClick={handleGoogleLogin}
          className="
  group
  relative
  flex 
  items-center 
  justify-center
  gap-2
  px-12 
  py-3
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
            GET STARTED
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* ⬇️ CARDS SECTION (SEPARATE) */}
      <div className="relative z-10 pt-24 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">



          {/* Card 1 - Flow Builder with Overlapping Modals */}
          <div className="bg-white rounded-3xl shadow-xl transition-all border border-gray-100 overflow-hidden">
            <div className="flex h-[450px]">
              {/* Left Sidebar with Icons */}
              <div className="flex flex-col items-center py-6 px-3 bg-gray-50 border-r border-gray-200 gap-4">
                <button className="w-10 h-10 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <Separator className="w-full" />
                
                <button className="w-10 h-10 rounded-lg bg-gray-600 text-white flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
                
                <button className="w-10 h-10 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                
                <button className="w-10 h-10 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">T</span>
                </button>
                
                <button className="w-10 h-10 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <div className="flex-1"></div>
                
                <button className="w-10 h-10 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              {/* Main Content Area with Overlapping Modals */}
              <div className="flex-1 bg-gradient-to-br from-gray-50 to-white relative p-6">
                
                {/* Select Post Modal (Behind) */}
                <div className="absolute top-16 sm:top-16 lg:top-20 left-3 sm:left-4 lg:left-6 right-12 sm:right-16 lg:right-20 bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 lg:p-5 z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">Select Post or Reel</h3>
                    <button className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
                    {/* Next Post Card with checkmark */}
                    <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg lg:rounded-xl p-2 sm:p-3 lg:p-4 border-2 border-gray-600">
                      <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 lg:top-2 lg:right-2 w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 bg-gray-600 rounded flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-lg lg:rounded-xl mx-auto mb-1 sm:mb-1.5 lg:mb-2 flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-[10px] sm:text-xs font-semibold text-center text-blue-700">Next Post or Reel</p>
                    </div>
                    
                    {/* Post thumbnails */}
                    <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg lg:rounded-xl h-16 sm:h-20 lg:h-24 flex items-center justify-center">
                      <p className="text-white font-bold text-[10px] sm:text-xs lg:text-sm px-1">reset. restart. refocus</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl h-16 sm:h-20 lg:h-24 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white rounded-md lg:rounded-lg"></div>
                    </div>
                  </div>
                  
                  <button className="mt-3 sm:mt-3.5 lg:mt-4 w-full bg-gray-900 text-white py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-800 transition-colors">
                    Confirm
                  </button>
                </div>

                {/* Add Message Modal (On Top) */}
                <div className="absolute top-24 sm:top-32 lg:top-40 left-12 sm:left-18 lg:left-24 right-4 sm:right-6 lg:right-8 bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 lg:p-5 z-20">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">Add Message</h3>
                    <button className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 border border-gray-200 rounded-lg px-2 sm:px-2.5 lg:px-3 py-1.5 sm:py-2">
                      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <input 
                        type="text" 
                        placeholder="Button Title" 
                        className="flex-1 text-xs sm:text-sm text-gray-800 outline-none bg-transparent min-w-0"
                        disabled
                      />
                    </div>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 border border-gray-200 rounded-lg px-2 sm:px-2.5 lg:px-3 py-1.5 sm:py-2">
                      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <input 
                        type="text" 
                        placeholder="Button Link" 
                        className="flex-1 text-xs sm:text-sm text-gray-900 outline-none bg-transparent min-w-0"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <button className="mt-3 sm:mt-3.5 lg:mt-4 w-full bg-gray-800 text-white py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-700 transition-colors">
                    Add Message
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Card 2 - Instagram Post Mockup */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl  pb-18 shadow-xl transition-all overflow-visible relative">
            
            {/* iOS Notification Banner */}
            <div className="absolute -top-1 left-8 right-8 z-50
    bg-white/90 backdrop-blur-2xl
    rounded-[1.125rem]
    shadow-[0_8px_32px_rgba(0,0,0,0.12)]
    border border-white/20
    p-3.5
    opacity-0
    animate-[slideDownOnce_0.6s_ease-out_3.2s_forwards]">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full flex-shrink-0 ring-2 ring-white/50 overflow-hidden">
                <img src="/blank_user.png" className="w-full h-full object-cover" alt="Profile"></img>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <p className="text-[13px] font-semibold text-gray-900 tracking-tight">Instagram</p>
                    <span className="text-[11px] text-gray-500 font-medium">just now</span>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-snug font-medium">@james.fashion sent you a message</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">Tap to open in Instagram</p>
                </div>
              </div>
            </div>

            {/* iPhone Frame */}
            <div className="bg-white w-full rounded-[2.75rem] p-[5px] shadow-2xl mt-6">
              <div className="bg-white w-full rounded-[2.625rem] overflow-hidden">
                {/* Status Bar */}
                <div className="bg-white w-full px-2 pt-3 pb-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    {/* <span className="text-gray-900">9:41</span> */}
                    {/* <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                      <svg className="w-4 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="6" width="18" height="12" rx="2" fill="currentColor"/><rect x="21" y="9" width="2" height="6" rx="1" fill="currentColor"/></svg>
                    </div> */}
                  </div>
                </div>

                <div className="h-[420px] w-full flex flex-col bg-white">
                  {/* Instagram Header */}
                  <div className="flex items-center justify-between w-full px-4 py-2.5 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] p-[2px]">
                          <div className="w-full h-full bg-white rounded-full p-[2px]">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#405de6] to-[#5851db]">
                               <img src="/blank_user.png" className="w-full h-full object-cover" alt="Profile"></img>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900 leading-tight">james.fashion</p>
                        <p className="text-[10px] text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <button className="text-gray-900">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="7" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="17" r="1.5"/>
                      </svg>
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 relative bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ff9a9e]">
                     <img src="/insta_hero.png" alt="Lightning Icon" className="w-full h-full"/>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        {/* <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg mb-3"> */}
                        {/* <img src="/insta_hero.png" alt="Lightning Icon" className="w-8 h-8"/> */}
                          {/* <svg className="w-8 h-8 text-[#405de6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"> */}
                            {/* <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /> */}
                          {/* </svg> */}
                        {/* </div> */}
                        {/* <p className="text-sm font-bold text-gray-900 tracking-tight">Limited Time Offer</p> */}
                        {/* <p className="text-xs text-gray-700 mt-1 font-medium">50% OFF Everything</p> */}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="px-4 py-2.5 bg-white border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <svg className="w-[26px] h-[26px] text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <svg className="w-[26px] h-[26px] text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <svg className="w-[26px] h-[26px] text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                      </div>
                      <svg className="w-[24px] h-[24px] text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                      </svg>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-900 leading-tight mb-1">2,847 likes</p>
                    <p className="text-[11px] text-gray-500 font-medium">View all 89 comments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Drawer - Instagram Style */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-b-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-gray-200 z-20 overflow-hidden">
              {/* Drawer Header */}
              <div className="flex items-center justify-center py-2 border-b border-gray-200">
                <div className="w-10 h-1 bg-gray-400 rounded-full"></div>
              </div>
              
              <div className="px-4 py-3 border-b justify-center border-gray-200">
                <h3 className="text-gray-900 justify-center font-semibold text-sm">Comments</h3>
              </div>

              <div className="px-4 py-3 space-y-3 max-h-[550px] overflow-y-auto scrollbar-hide">
                {/* Original Comment */}
                <div className="flex items-start gap-3 opacity-0 animate-[slideUpOnce_0.5s_ease-out_0.5s_forwards]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex-shrink-0">
                      <img src="/blank_user.png" alt="Purple Dot" className="w-8 h-8"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[13px] leading-tight">
                          <span className="font-semibold text-gray-900">you</span>
                          <span className="text-gray-500 text-xs ml-2">30sec</span>
                          <span className="text-gray-500 ml-1">●</span>
                          <span className="text-gray-500 text-xs ml-1">❤️ by author</span>
                        </p>
                        <p className="text-[13px] text-gray-900 mt-0.5">Link</p>
                        <button className="text-xs text-gray-500 font-semibold mt-1">Reply</button>
                      </div>
                      <div className="flex flex-col items-center gap-1 ml-2">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {/* <span className="text-[10px] text-gray-400">9</span> */}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Auto Reply */}
                <div className="flex items-start gap-3 opacity-0 animate-[slideUpOnce_0.5s_ease-out_1.5s_forwards]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#405de6] to-[#5851db] flex-shrink-0">
                      <img src="/blank_user.png" alt="Purple Dot" className="w-8 h-8"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[13px] leading-tight">
                          <span className="font-semibold text-gray-900">johndoe</span>
                          <span className="text-gray-500 text-xs ml-2">2hr</span>
                          <span className="text-gray-500 ml-1">●</span>
                          <span className="text-gray-500 text-xs ml-1">❤️ by author</span>
                        </p>
                        <p className="text-[13px] text-gray-900 mt-0.5">where can i find it ?</p>
                        <button className="text-xs text-gray-500 font-semibold mt-1">Reply</button>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="h-1 w-1 rounded-full ">
                            <img src="/blank_user.png" alt="Purple Dot" className="w-1 h-1"/>
                          </div>
                          <p className="text-[9px] text-purple-400 font-bold tracking-wider">AUTO-REPLY • CHATAUTODM</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 ml-2">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ⬇️ TRUST BADGES SECTION */}
      <div className="relative z-10 pt-24 space-y-6">
       

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">

          {/* Meta */}
          <div className="flex items-center gap-3  hover:grayscale-0 transition-all  hover:opacity-100">
            <div className="w-32 h-14  rounded flex items-center justify-center text-xs text-gray-500">
            
              <img src="/meta_logo0.png" alt="Meta Certified Badge" className="ml-2 h-10"/>  
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-800">ChatAutoDM has Certified as Tech Provider by Meta!.</p>
            </div>
          </div>

          {/* Inc42
          <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
              Inc42
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-gray-700">Top 30 Start-ups</p>
              <p className="text-xs text-gray-500">to look out for</p>
            </div>
          </div>

          {/* Forbes */}
          {/* <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
              Forbes
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-gray-700">Forbes 2022</p>
              <p className="text-xs text-gray-500">Top 200 companies</p>
            </div>
          </div> */} 

        </div>
      </div>

    </section>
  );
};

export default HeroSection;
