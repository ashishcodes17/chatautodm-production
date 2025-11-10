import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ✅ Special allowance for Meta crawlers (Instagram + Facebook bots)
      {
        userAgent: ["facebookexternalhit", "facebot"],
        allow: ["/", "/api/images/"],
      },
      // ✅ Default rule for everyone else
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  }
}
