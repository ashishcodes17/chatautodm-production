import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/landing/footer"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const blogPosts = [
  {
    id: "instagram-dm-automation-guide",
    title: "The Complete Guide to Instagram DM Automation in 2025",
    excerpt:
      "Learn how to automate your Instagram direct messages effectively while maintaining authentic engagement with your audience.",
    author: "ChatAutoDM Team",
    date: "March 15, 2025",
    readTime: "8 min read",
    image: "/BLOG-1.png",
    category: "Automation",
  },
  {
    id: "story-reply-strategies",
    title: "How to Convert Instagram Story Replies into Sales",
    excerpt:
      "Discover proven strategies to turn Instagram story interactions into meaningful conversations and sales opportunities.",
    author: "Sarah Johnson",
    date: "March 12, 2025",
    readTime: "6 min read",
    image: "/blog3.png",
    category: "Strategy",
  },
  {
    id: "comment-to-dm-best-practices",
    title: "Comment to DM: Best Practices for Higher Conversion",
    excerpt:
      "Master the art of converting Instagram comments into direct message conversations that drive real business results.",
    author: "Mike Chen",
    date: "March 10, 2025",
    readTime: "7 min read",
    image: "/blog4.png",
    category: "Best Practices",
  },
  {
    id: "instagram-business-growth",
    title: "Scale Your Instagram Business with Smart Automation",
    excerpt:
      "Learn how successful businesses use Instagram automation to scale their operations without losing the personal touch.",
    author: "Emma Davis",
    date: "March 8, 2025",
    readTime: "9 min read",
    image: "/blog-2.png",
    category: "Growth",
  },
   {
    id: "founder-story",
    title: "Building ChatAutoDM: A Founder’s Story",
    excerpt:
      "Meet Ashish Gampala, the student founder behind ChatAutoDM, and discover the vision of integrating AI and multi-platform automation for the future of social engagement.",
    author: "Ashish Gampala",
    date: "March 5, 2025",
    readTime: "5 min read",
    image: "/student-founder.png",
    category: "Founder’s Note",
  },
  {
    id: "best-instagram-automation-tool-2025",
    title: "The Best Instagram Automation Tool in 2025: A Smarter Alternative to ManyChat, Zorcha, Chatfuel, and More",
  excerpt:
    "Discover why ChatAutoDM is redefining Instagram automation in 2025 — a next-gen alternative to tools like ManyChat, Zorcha, Chatfuel, and LinkDM that puts speed, personalization, and growth on autopilot.",
  author: "ChatAutoDM Team",
  date: "April 5, 2025",
  readTime: "7 min read",
  image: "/logolongbw.png",
  category: "Automation",
  },
]

export default function BlogPage() {
  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Image src="/favicon.png" alt="ChatAutoDM" width={32} height={32} className="object-contain" />
                </div>
                <span className="text-xl font-semibold text-black tracking-tight">ChatAutoDM</span>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                  Home
                </Link>
                <Link href="/blog" className="text-black font-medium">
                  Blog
                </Link>
                <Link
                  href="/api/auth/google"
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full transition-colors"
                >
                  Get Started
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">Blog.</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover Instagram automation strategies
              and growth tactics.
            </p>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-4">
                  <span className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                    {blogPosts[0].category}
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-black mb-4 leading-tight">{blogPosts[0].title}</h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">CT</span>
                  </div>
                  <div>
                    <p className="font-medium text-black">{blogPosts[0].author}</p>
                    <p className="text-sm text-gray-500">
                      {blogPosts[0].date} • {blogPosts[0].readTime}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/blog/${blogPosts[0].id}`}
                  className="inline-flex items-center text-black font-medium hover:text-purple-600 transition-colors"
                >
                  Read Article →
                </Link>
              </div>
              <div className="relative">
                <Image
                  src={blogPosts[0].image || "/placeholder.svg"}
                  alt={blogPosts[0].title}
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* More Stories */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-black mb-12">More Stories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-block bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3 leading-tight">{post.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {post.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">{post.author}</p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-black font-medium hover:text-purple-600 transition-colors text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

       
      </div>

      <Footer />
    </>
  )

}
