import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://just-tag.ch";
  const locales = ["fr", "de", "en", "pt", "es"];
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Helper to generate alternates for a given path
  const alternates = (path: string) => ({
    languages: Object.fromEntries(
      locales.map((l) => [l, `${baseUrl}/${l}${path}`])
    ),
  });

  // Homepage
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: alternates(""),
    });
  }

  // Restaurant listing page
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/restaurants`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: alternates("/restaurants"),
    });
  }

  // Collections page
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/collections`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: alternates("/collections"),
    });
  }

  // B2B and info pages
  const weeklyPages = ["pour-restaurateurs"];
  for (const page of weeklyPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternates(`/${page}`),
      });
    }
  }

  // Static pages
  const staticPages = [
    "contact",
    "faq",
    "politique-de-confidentialite",
    "conditions-generales",
    "mentions-legales",
  ];
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: alternates(`/${page}`),
      });
    }
  }

  // Individual restaurant pages from Supabase
  try {
    const supabase = createAdminClient();
    const { data: restaurants } = await supabase
      .from("restaurants")
      .select("slug, updated_at")
      .eq("is_published", true);

    if (restaurants) {
      for (const restaurant of restaurants) {
        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/restaurants/${restaurant.slug}`,
            lastModified: restaurant.updated_at
              ? new Date(restaurant.updated_at)
              : now,
            changeFrequency: "weekly",
            priority: 0.8,
            alternates: alternates(`/restaurants/${restaurant.slug}`),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching restaurants for sitemap:", error);
  }

  return entries;
}
