import type { MetadataRoute } from "next"

// export default function robots(): MetadataRoute.Robots {
//   return {
//     rules: [
//       // ✅ Special allowance for Meta crawlers (Instagram + Facebook bots)
//       {
//         userAgent: ["facebookexternalhit", "facebot", "Facebot", "FacebookExternalHit"],
//         allow: ["/", "/api/images/"],
//         disallow: [],
//       },
//       // ✅ Default rule for everyone else
//       {
//         userAgent: "*",
//         allow: ["/", "/api/images/"],
//         disallow: ["/dashboard/", "/api/auth/", "/api/webhooks/", "/api/workspaces/", "/api/automations/"],
//       },
//     ],
//     sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
//   }
// }
// import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/", // allow everything
        disallow: [], // disallow nothing
      },
    ],
  }
}
