"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface LegalSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function LegalSidebar({ isOpen = true, onClose }: LegalSidebarProps) {
  const pathname = usePathname()

  const pages = [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/meta-verified", label: "Meta Verified" },
  ]

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <div
        className={cn(
          // Fixed sidebar that does not scroll with content
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border",
          // Slide-in behavior on small screens; always visible on lg+
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-montserrat font-bold text-lg text-sidebar-foreground">Legal Pages</h3>
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-sidebar-accent rounded-md">
              <X className="w-5 h-5 text-sidebar-foreground" />
            </button>
          </div>
          <nav className="space-y-2">
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                onClick={onClose}
                className={cn(
                  "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === page.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground",
                )}
              >
                {page.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
