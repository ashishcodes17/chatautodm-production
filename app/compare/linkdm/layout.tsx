// Server component (metadata here)
import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChatAutoDM vs LinkDM - Best LinkDM Alternative 2025 | Instagram Automation',
  description: 'Looking for a better LinkDM alternative? ChatAutoDM offers unlimited contacts, more features, and affordable pricing for Instagram DM automation. Compare & start free!',
  keywords: ['LinkDM alternative', 'ChatAutoDM vs LinkDM', 'Instagram automation', 'Instagram DM automation', 'better than LinkDM'],
  openGraph: {
    title: 'ChatAutoDM vs LinkDM - The Superior Instagram Automation Platform',
    description: 'Discover why businesses choose ChatAutoDM over LinkDM. Get unlimited contacts, more features, and better pricing. Try free now!',
    url: 'https://chatautodm.com/compare/linkdm',
    siteName: 'ChatAutoDM',
    images: [
      {
        url: 'https://chatautodm.com/og-linkdm-comparison.png',
        width: 1200,
        height: 630,
        alt: 'ChatAutoDM vs LinkDM Feature Comparison',
      }
    ],
  },
};

export default function LinkdmLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
