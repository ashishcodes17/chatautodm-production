"use client"

import type React from "react"
import { useState } from "react"
import { LegalSidebar } from "./legal-sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu } from "lucide-react"
import Link from "next/link"

interface LegalLayoutProps {
  title: string
  children: React.ReactNode
}

export function LegalLayout({ title, children }: LegalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <LegalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-accent rounded-md">
                  <Menu className="w-5 h-5" />
                </button>
                <Link href="/">
                  <Button variant="ghost" className="-ml-2 lg:-ml-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
              <h1 className="font-montserrat font-black text-2xl sm:text-3xl lg:text-4xl text-foreground mb-2">
                {title}
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:font-montserrat">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
