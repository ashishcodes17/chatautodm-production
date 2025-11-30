import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";
import { SWRProvider } from "@/lib/swr-provider"
import UmamiTracker from "@/components/umami-tracker" // ✅ client script
import './globals.css'

export const metadata: Metadata = {
  title: 'ChatAutoDM — Free Instagram DM Tool for Creators',
  description:
    'Automate Instagram DMs for creators and businesses — a free alternative to Manychat, Zorcha, LinkDM, Instant DM, and other expensive tools. Collect leads, reply instantly, and grow your audience effortlessly. Get started today with Comment-to-DM and Story Reply automation flows!',
  generator: 'Team ChatAutoDM',
  keywords: [
    'Free Instagram automation tool',
    'Free Instagram DM automation',
    'Best alternative to ManyChat',
    'Best Zorcha alternative',
    'Best LinkDM alternative',
    'Free Instagram DM tool',
    'Free Instagram chatbot',
    'Free auto DM tool',
    'ChatAutoDM'
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SWRProvider>
          {children}
        </SWRProvider>

        {/* ✅ Umami client tracker */}
        <script defer src="https://analytics.chatautodm.com/script.js" data-website-id="03e6b6cd-d5ed-4908-b410-ed68bf64bf62"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ChatAutoDM",
              "url": "https://www.chatautodm.com",
              "applicationCategory": "MarketingApplication",
              "operatingSystem": "Web",
              "description": "ChatAutoDM is a free Instagram automation tool that automates DMs, story replies, and comment-to-DM workflows. Free alternative to ManyChat, Zorcha, and LinkDM.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              }
            }),
          }}
        />


        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </body>
    </html>
  )
}
