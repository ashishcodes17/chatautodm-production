"use client"

export default function PremiumBottomLoader() {
  return (
    <div className="min-h-screen flex flex-col justify-end items-center pb-12 select-none pointer-events-none">
      
      {/* Dot Loader */}
      <div className="flex items-center gap-2">
        <span className="block h-2.5 w-2.5 rounded-full bg-gray-400 animate-[pulseDot_0.9s_infinite]"></span>
        <span className="block h-2.5 w-2.5 rounded-full bg-gray-400 animate-[pulseDot_0.9s_infinite_0.2s]"></span>
        <span className="block h-2.5 w-2.5 rounded-full bg-gray-400 animate-[pulseDot_0.9s_infinite_0.4s]"></span>
      </div>

      <p className="text-gray-500 text-xs mt-3 tracking-wide">
        Loading…
      </p>
    </div>
  )
}
