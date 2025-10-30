import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About ChatAutoDM - Meta Verified Instagram Automation Platform | Teen-Founded Growth Tool",
  description: "ChatAutoDM is a Meta Verified Technology Provider building next-gen Instagram automation. Founded by teen entrepreneur Ashish Gampala, trusted by 50,000+ users across 22 countries. Speed, safety, and builder-centric innovation.",
  keywords: [
    "about ChatAutoDM",
    "Instagram automation company",
    "Meta verified provider",
    "Instagram growth platform",
    "ChatAutoDM founder",
    "Ashish Gampala",
    "teen entrepreneur Instagram",
    "Instagram automation mission",
    "Instagram DM automation company",
    "trusted Instagram automation",
    "Instagram automation builder",
    "safe Instagram automation",
    "Instagram automation architecture",
    "ChatAutoDM team",
    "Instagram automation journey"
  ],
  authors: [{ name: 'Ashish Gampala', url: 'https://chatautodm.com/about' }],
  creator: 'Ashish Gampala',
  publisher: 'ChatAutoDM',
  
  // Open Graph for social sharing
  openGraph: {
    title: "About ChatAutoDM - Building the Future of Instagram Automation",
    description: "Teen-founded, Meta Verified Instagram automation platform. Trusted by 50,000+ users. Speed, safety, and innovation at scale. Building the automation layer for lean growth teams.",
    url: 'https://chatautodm.com/about',
    siteName: 'ChatAutoDM',
    images: [
      {
        url: 'https://chatautodm.com/og-about.png',
        width: 1200,
        height: 630,
        alt: 'ChatAutoDM - About Our Mission and Team',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: "About ChatAutoDM - Meta Verified Instagram Automation",
    description: "Teen-founded platform revolutionizing Instagram automation. 50,000+ users, 22 countries, 99.3% success rate. Meta Verified & trusted.",
    images: ['https://chatautodm.com/twitter-about.png'],
    creator: '@chatautodm',
    site: '@chatautodm',
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Canonical URL
  alternates: {
    canonical: 'https://chatautodm.com/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Structured Data for Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'ChatAutoDM',
            alternateName: 'ChatAutoDM - Instagram Automation Platform',
            url: 'https://chatautodm.com',
            logo: 'https://chatautodm.com/logo-branding2.png',
            description: 'Meta Verified Instagram automation platform enabling creators and businesses to automate DMs, engagement workflows, and growth strategies.',
            foundingDate: '2025',
            founder: {
              '@type': 'Person',
              name: 'Ashish Gampala',
              jobTitle: 'Founder & CEO',
              description: 'Teen entrepreneur and founder of ChatAutoDM, building next-gen Instagram automation tools.',
            },
            numberOfEmployees: {
              '@type': 'QuantitativeValue',
              value: '1-10',
            },
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'IN',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'support@chatautodm.com',
              contactType: 'Customer Support',
              availableLanguage: ['en'],
            },
            sameAs: [
              'https://twitter.com/chatautodm',
              'https://instagram.com/chatautodm',
            ],
            slogan: 'Building the automation layer for lean growth teams',
            brand: {
              '@type': 'Brand',
              name: 'ChatAutoDM',
            },
            areaServed: {
              '@type': 'Place',
              name: 'Worldwide',
            },
            serviceArea: {
              '@type': 'GeoShape',
              name: 'Global',
            },
          }),
        }}
      />
      
      {/* JSON-LD for Person (Founder) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Ashish Gampala',
            jobTitle: 'Founder & CEO',
            worksFor: {
              '@type': 'Organization',
              name: 'ChatAutoDM',
            },
            description: 'Teen entrepreneur building ChatAutoDM, a Meta Verified Instagram automation platform trusted by 50,000+ users worldwide.',
            url: 'https://chatautodm.com/about',
            sameAs: [
              'https://twitter.com/chatautodm',
              'https://instagram.com/chatautodm',
            ],
          }),
        }}
      />
      
      {/* JSON-LD for AboutPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About ChatAutoDM',
            description: 'Learn about ChatAutoDM\'s mission to remove friction from building and iterating Instagram automation. Founded by teen entrepreneur Ashish Gampala.',
            url: 'https://chatautodm.com/about',
            mainEntity: {
              '@type': 'Organization',
              name: 'ChatAutoDM',
            },
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['h1', 'h2', '.mission-text'],
            },
          }),
        }}
      />
      
      {/* JSON-LD for SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'ChatAutoDM',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'INR',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '3847',
              bestRating: '5',
            },
            featureList: [
              'Instagram DM Automation',
              'Visual Flow Builder',
              'Multi-Account Management',
              'Adaptive Rate Control',
              'Smart Follow-Up Sequences',
              'Keyword Triggered Replies',
              'Real-Time Analytics',
            ],
          }),
        }}
      />
      
      {/* JSON-LD for Corporate Contact */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            url: 'https://chatautodm.com/about',
            mainEntity: {
              '@type': 'Organization',
              name: 'ChatAutoDM',
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  telephone: '',
                  contactType: 'Customer Service',
                  email: 'info@chatautodm.xyz',
                  availableLanguage: ['English'],
                },
                {
                  '@type': 'ContactPoint',
                  telephone: '',
                  contactType: 'Technical Support',
                  email: 'support@chatautodm.com',
                  availableLanguage: ['English'],
                },
              ],
            },
          }),
        }}
      />
      {children}
    </>
  );
}
