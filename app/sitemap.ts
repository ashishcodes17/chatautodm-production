import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.chatautodm.com"

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/select-workspace`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
     url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]

}
