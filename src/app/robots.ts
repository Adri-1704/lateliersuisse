import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/espace-client/"],
      },
    ],
    sitemap: "https://just-tag.ch/sitemap.xml",
  };
}
