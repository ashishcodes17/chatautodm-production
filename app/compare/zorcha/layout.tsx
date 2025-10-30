// Server component (metadata here)
import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChatAutoDM vs Zorcha - Best Zorcha Alternative 2025 | Instagram Automation',
  description: 'Looking for a better Zorcha alternative? ChatAutoDM offers unlimited contacts, 80% lower pricing, and powerful Instagram DM automation. Compare features, pricing & start free today!',
  keywords: ['Zorcha alternative', 'ChatAutoDM vs Zorcha', 'Instagram automation', 'Instagram DM automation', 'best Instagram bot'],
  openGraph: {
    title: 'ChatAutoDM vs Zorcha - The Superior Instagram Automation Platform',
    description: 'Discover why 10,000+ businesses switched from Zorcha to ChatAutoDM. Get unlimited contacts, lower pricing, and better features. Try free now!',
    url: 'https://chatautodm.com/compare/zorcha',
    siteName: 'ChatAutoDM',
    images: [
      {
        url: 'https://chatautodm.com/og-zorcha-comparison.png',
        width: 1200,
        height: 630,
        alt: 'ChatAutoDM vs Zorcha Feature Comparison',
      }
    ],
  },
};

export default function ZorchaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
