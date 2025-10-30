// Server component (metadata here)
import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChatAutoDM vs Chatfuel - Best Chatfuel Alternative 2025 | Instagram Automation',
  description: 'Looking for a better Chatfuel alternative? ChatAutoDM offers unlimited contacts, more affordable pricing, and superior Instagram DM automation. Compare features & start free!',
  keywords: ['Chatfuel alternative', 'ChatAutoDM vs Chatfuel', 'Instagram automation', 'Instagram chatbot', 'better than Chatfuel'],
  openGraph: {
    title: 'ChatAutoDM vs Chatfuel - The Superior Instagram Automation Platform',
    description: 'Discover why businesses are switching from Chatfuel to ChatAutoDM. Get unlimited contacts, lower pricing, and better Instagram-native features. Try free now!',
    url: 'https://chatautodm.com/compare/chatfuel',
    siteName: 'ChatAutoDM',
    images: [
      {
        url: 'https://chatautodm.com/og-chatfuel-comparison.png',
        width: 1200,
        height: 630,
        alt: 'ChatAutoDM vs Chatfuel Feature Comparison',
      }
    ],
  },
};

export default function ChatfuelLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
