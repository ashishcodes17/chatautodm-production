"use client"
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function FloatingNav() {
  const [open, setOpen] = useState(false);
   const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <nav
      className={`
        fixed z-50 top-4 left-1/2 -translate-x-1/2
        w-full px-3
       lg:w-[60%] xl:w-[50%] 2xl:w-[45%]
      `}
    >
      <div
        className={`
          relative flex items-center justify-between
          rounded-xl bg-[#e9eaed]/90 backdrop-blur supports-[backdrop-filter]:bg-[#e9eaed]/70
          shadow-lg px-4 py-2.5
          transition-colors
        `}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image 
            src="/logolongblue1.png" 
            alt="Logo" 
            width={120}
            height={28}
            className="h-6 w-auto lg:h-7" 
            priority
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center justify-between gap-6">
           {/* --- Navigation Links --- */}
        <div className="hidden md:flex gap-8 font-medium items-center justify-center text-gray-700">
          <a href="/about" className="hover:text-gray-900">About</a>
          <a href="/blog" className="hover:text-gray-900">Resources</a>
          <a href="/pricing" className="hover:text-gray-900">Pricing</a>
        </div>
          {/* <Link
            href="/pricing"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Pricing
          </Link> */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#3076fd] text-white hover:bg-[#1d62ea] shadow-sm transition"
          >
            Start For Free
          </button>
        </div>

        {/* Mobile Right Side */}
        <div className="flex items-center gap-2 md:hidden">
          {/* <Link
            href="/pricing"
            className="text-xs font-medium text-gray-700 hover:text-gray-900"
          >
            Pricing
          </Link> */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen(o => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white active:scale-95 transition shadow-sm"
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 bg-gray-800 transition ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-gray-800 transition ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-gray-800 transition ${
                  open ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {open && (
          <div
            className="absolute left-0 right-0 top-full mt-2 origin-top rounded-xl border border-gray-200 bg-white/95 backdrop-blur px-4 py-4 shadow-xl animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex flex-col gap-3">
              <button
                
                 onClick={handleGoogleLogin}
                className="w-full rounded-md bg-[#3076fd] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#1d62ea] transition"
              >
                Start For Free
              </button>
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Blog
              </Link>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-[11px] leading-relaxed text-gray-500">
                  Build automations now. Pro & Elite are temporarily free.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
