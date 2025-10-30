import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Pricing Plans - Free Forever Instagram DM Automation | ChatAutoDM",
  description: "ChatAutoDM offers unbeatable Instagram automation pricing. Free Forever plan with unlimited automations, 1000 contacts & DMs. Pro & Elite plans currently free during founder launch. No credit card required. 70% cheaper than ManyChat.",
  keywords: [
    "Instagram automation pricing",
    "free Instagram DM automation",
    "affordable Instagram bot",
    "ChatAutoDM pricing plans",
    "Instagram automation cost",
    "free forever Instagram tool",
    "Instagram DM pricing",
    "Instagram automation free trial",
    "ManyChat alternative pricing",
    "cheaper than ManyChat",
    "Instagram automation comparison",
    "unlimited Instagram automations",
    "free Instagram marketing tool",
    "Instagram DM bot pricing",
    "Instagram automation plans"
  ],
  authors: [{ name: 'ChatAutoDM Team' }],
  creator: 'ChatAutoDM',
  publisher: 'ChatAutoDM',
  
  // Open Graph for social sharing
  openGraph: {
    title: "Free Forever Instagram DM Automation Pricing | ChatAutoDM",
    description: "Start free with unlimited automations, 1000 contacts, and all premium flows. Pro & Elite plans currently free. No credit card needed. 70% cheaper than competitors.",
    url: 'https://chatautodm.com/pricing',
    siteName: 'ChatAutoDM',
    images: [
      {
        url: 'https://chatautodm.com/og-pricing.png',
        width: 1200,
        height: 630,
        alt: 'ChatAutoDM Pricing - Free Forever Instagram Automation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: "Free Instagram Automation Pricing | ChatAutoDM",
    description: "Free Forever plan: Unlimited automations, 1000 contacts & DMs. Pro & Elite free during launch. No credit card required.",
    images: ['https://chatautodm.com/twitter-pricing.png'],
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
    canonical: 'https://chatautodm.com/pricing',
  },
  
  // Additional tags
  other: {
    'price:currency': 'INR',
    'price:amount': '0',
    'product:price:amount': '0',
    'product:price:currency': 'INR',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Structured Data for Pricing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'ChatAutoDM Instagram Automation',
            description: 'Instagram DM automation platform with free forever plan and premium features',
            brand: {
              '@type': 'Brand',
              name: 'ChatAutoDM',
            },
            offers: [
              {
                '@type': 'Offer',
                name: 'Free Plan',
                price: '0',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2025-12-31',
                description: 'Unlimited automations, 1000 contacts, 1000 DMs, all flows included',
                seller: {
                  '@type': 'Organization',
                  name: 'ChatAutoDM',
                },
              },
              {
                '@type': 'Offer',
                name: 'Pro Plan',
                price: '0',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2025-06-30',
                description: 'Unlimited automations, unlimited contacts & DMs, Ask to Follow feature - Currently free during founder launch',
                regularPrice: '499',
                seller: {
                  '@type': 'Organization',
                  name: 'ChatAutoDM',
                },
              },
              {
                '@type': 'Offer',
                name: 'Elite Plan',
                price: '0',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2025-06-30',
                description: 'Everything in Pro plus data collection, priority support - Currently free during founder launch',
                regularPrice: '999',
                seller: {
                  '@type': 'Organization',
                  name: 'ChatAutoDM',
                },
              },
            ],
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '3847',
              bestRating: '5',
              worstRating: '1',
            },
          }),
        }}
      />
      
      {/* JSON-LD for FAQ Section */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Why are Pro & Elite free right now?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "We're in a founder launch period. Let people build without friction, gather feedback, then enable normal pricing with plenty of notice and a legacy discount option.",
                },
              },
              {
                '@type': 'Question',
                name: 'Will I need a credit card to start?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No. You can explore, build flows, and invite teammates on the Free plan and the temporary free upgrades without entering payment details.',
                },
              },
              {
                '@type': 'Question',
                name: 'What happens after the first month?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "You'll get an email + in‑app notice well before billing would begin. You can downgrade, continue on Free, or stay upgraded at regular (or legacy discounted) pricing.",
                },
              },
              {
                '@type': 'Question',
                name: 'Can I switch plans anytime?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Plan changes (up or down) take effect immediately; any future billing will pro‑rate fairly once pricing activates.',
                },
              },
              {
                '@type': 'Question',
                name: 'Are there usage limits?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Free has basic volume & execution caps. Pro increases throughput & advanced targeting. Elite adds higher concurrency, priority processing and premium support. Exact limits will be published before billing starts.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I get support?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'In‑app chat (coming soon), email support at info@chatautodm.xyz or text us @chatautodm, and community access. Elite adds priority & roadmap input calls.',
                },
              },
            ],
          }),
        }}
      />
      
      {/* JSON-LD for WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'ChatAutoDM Pricing Plans',
            description: 'Transparent Instagram automation pricing with a free forever plan and premium options',
            url: 'https://chatautodm.com/pricing',
            mainEntity: {
              '@type': 'PriceSpecification',
              price: '0',
              priceCurrency: 'INR',
              valueAddedTaxIncluded: true,
            },
          }),
        }}
      />
      {children}
    </>
  );
}
