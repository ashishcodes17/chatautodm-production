import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meta Verified Partner | Official Instagram API | ChatAutoDM',
  description: 'ChatAutoDM is an official Meta Verified Technology Provider using authentic Instagram Graph API. Secure, compliant, and trusted by 50,000+ businesses. Learn about our Meta certification.',
  keywords: [
    'Meta verified partner',
    'Meta technology provider',
    'Official Instagram API',
    'Instagram Graph API',
    'Meta certified app',
    'Facebook Business Partner',
    'Instagram automation security',
    'Meta verified badge',
    'Instagram API compliance',
    'Secure Instagram automation',
    'Meta Business Partner',
    'Instagram API verification'
  ],
  authors: [{ name: 'ChatAutoDM Team' }],
  creator: 'ChatAutoDM',
  publisher: 'ChatAutoDM',
  openGraph: {
    title: 'Meta Verified Technology Provider - ChatAutoDM',
    description: 'Official Meta Verified Partner for Instagram automation. Trusted, secure, and compliant with Meta policies. 50,000+ businesses trust ChatAutoDM.',
    url: 'https://chatautodm.com/meta-verified',
    siteName: 'ChatAutoDM',
    images: [
      {
        url: 'https://chatautodm.com/og-meta-verified.png',
        width: 1200,
        height: 630,
        alt: 'ChatAutoDM - Meta Verified Technology Provider',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meta Verified Partner | ChatAutoDM',
    description: 'Official Meta Verified Technology Provider for Instagram automation. Secure, compliant, and trusted.',
    images: ['https://chatautodm.com/og-meta-verified.png'],
    creator: '@chatautodm',
  },
  alternates: {
    canonical: 'https://chatautodm.com/meta-verified',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function MetaVerifiedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
