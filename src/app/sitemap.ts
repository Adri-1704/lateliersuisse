import type { MetadataRoute } from "next";
import { mockRestaurants } from "@/data/mock-restaurants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch";
  const locales = ["fr", "de", "en"];
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}`])
        ),
      },
    });
  }

  // Restaurant listing page
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/restaurants`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}/restaurants`])
        ),
      },
    });
  }

  // Individual restaurant pages
  const publishedRestaurants = mockRestaurants.filter((r) => r.isPublished);
  for (const restaurant of publishedRestaurants) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/restaurants/${restaurant.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/restaurants/${restaurant.slug}`])
          ),
        },
      });
    }
  }

  // B2B landing page
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/pour-restaurateurs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}/pour-restaurateurs`])
        ),
      },
    });
  }

  // Static pages
  const staticPages = ["contact", "faq"];
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/${page}`])
          ),
        },
      });
    }
  }

  return entries;
}
