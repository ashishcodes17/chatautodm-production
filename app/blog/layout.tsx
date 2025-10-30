import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Instagram Automation Blog - Tips, Strategies & Growth Hacks | ChatAutoDM",
  description: "Master Instagram automation with expert guides on DM automation, story reply strategies, comment-to-DM tactics, and business growth. Free resources from ChatAutoDM's Meta Verified platform.",
  keywords: [
    "Instagram automation blog",
    "Instagram DM marketing tips",
    "social media growth strategies",
    "Instagram business growth",
    "DM automation guide",
    "Instagram automation strategies",
    "story reply conversion",
    "comment to DM best practices",
    "Instagram engagement tips",
    "Instagram automation tutorial",
    "Instagram marketing blog",
    "social media automation guide",
    "Instagram business tips",
    "automated Instagram marketing",
    "Instagram growth hacks"
  ],
  authors: [{ name: 'ChatAutoDM Team' }],
  creator: 'ChatAutoDM',
  publisher: 'ChatAutoDM',
  
  // Open Graph for social sharing
  openGraph: {
    title: "Instagram Automation Blog - Expert Tips & Strategies | ChatAutoDM",
    description: "Learn Instagram automation, DM marketing, and growth strategies from industry experts. Free guides, tutorials, and case studies.",
    url: 'https://chatautodm.com/blog',
    siteName: 'ChatAutoDM Blog',
    images: [
      {
        url: 'https://chatautodm.com/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'ChatAutoDM Blog - Instagram Automation Tips',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: "Instagram Automation Blog | ChatAutoDM",
    description: "Expert tips on Instagram DM automation, story replies, comment strategies, and business growth. Learn from the Meta Verified platform.",
    images: ['https://chatautodm.com/twitter-blog.png'],
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
    canonical: 'https://chatautodm.com/blog',
    types: {
      'application/rss+xml': 'https://chatautodm.com/blog/rss.xml',
    },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Structured Data for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'ChatAutoDM Blog',
            description: 'Expert insights on Instagram automation, DM marketing, and social media growth strategies',
            url: 'https://chatautodm.com/blog',
            publisher: {
              '@type': 'Organization',
              name: 'ChatAutoDM',
              logo: {
                '@type': 'ImageObject',
                url: 'https://chatautodm.com/logo-branding2.png',
              },
            },
            inLanguage: 'en-US',
            blogPost: [
              {
                '@type': 'BlogPosting',
                headline: 'The Complete Guide to Instagram DM Automation in 2025',
                url: 'https://chatautodm.com/blog/instagram-dm-automation-guide',
                datePublished: '2025-03-15',
                author: {
                  '@type': 'Organization',
                  name: 'ChatAutoDM Team',
                },
                image: 'https://chatautodm.com/BLOG-1.png',
              },
              {
                '@type': 'BlogPosting',
                headline: 'How to Convert Instagram Story Replies into Sales',
                url: 'https://chatautodm.com/blog/story-reply-strategies',
                datePublished: '2025-03-12',
                author: {
                  '@type': 'Person',
                  name: 'Sarah Johnson',
                },
                image: 'https://chatautodm.com/blog3.png',
              },
              {
                '@type': 'BlogPosting',
                headline: 'Comment to DM: Best Practices for Higher Conversion',
                url: 'https://chatautodm.com/blog/comment-to-dm-best-practices',
                datePublished: '2025-03-10',
                author: {
                  '@type': 'Person',
                  name: 'Mike Chen',
                },
                image: 'https://chatautodm.com/blog4.png',
              },
              {
                '@type': 'BlogPosting',
                headline: 'Scale Your Instagram Business with Smart Automation',
                url: 'https://chatautodm.com/blog/instagram-business-growth',
                datePublished: '2025-03-08',
                author: {
                  '@type': 'Person',
                  name: 'Emma Davis',
                },
                image: 'https://chatautodm.com/blog-2.png',
              },
              {
                '@type': 'BlogPosting',
                headline: 'Building ChatAutoDM: A Founder\'s Story',
                url: 'https://chatautodm.com/blog/founder-story',
                datePublished: '2025-03-05',
                author: {
                  '@type': 'Person',
                  name: 'Ashish Gampala',
                },
                image: 'https://chatautodm.com/student-founder.png',
              },
              {
                '@type': 'BlogPosting',
                headline: 'The Best Instagram Automation Tool in 2025: A Smarter Alternative to ManyChat, Zorcha, Chatfuel, and More',
                url: 'https://chatautodm.com/blog/best-instagram-automation-tool-2025',
                datePublished: '2025-04-05',
                author: {
                  '@type': 'Organization',
                  name: 'ChatAutoDM Team',
                },
                image: 'https://chatautodm.com/logolongbw.png',
              },
            ],
          }),
        }}
      />
      
      {/* JSON-LD for WebSite with SearchAction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'ChatAutoDM Blog',
            url: 'https://chatautodm.com/blog',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://chatautodm.com/blog?search={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      
      {/* JSON-LD for BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://chatautodm.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://chatautodm.com/blog',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
