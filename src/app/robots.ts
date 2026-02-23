import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/partenaire-inscription",
          "/*/partenaire-inscription/succes",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
