import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { cantons } from "@/data/cantons";
import { collections } from "@/data/collections";
import { slugifyCity, VALID_CANTONS } from "@/lib/city-slug";

const MIN_RESTAURANTS_FOR_CITY_PAGE = 5;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://just-tag.app";
  // SEO Quick Win: seules les URLs FR sont soumises dans le sitemap pour éviter
  // le signal "trop d'URLs similaires" envoyé à Google sur un site jeune. Les pages
  // DE/EN/PT/ES restent accessibles et référencées via hreflang (voir `alternates`).
  const locales = ["fr"];
  const alternateLocales = ["fr", "de", "en", "pt", "es"];
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Helper to generate alternates for a given path (hreflang : 5 locales)
  const alternates = (path: string) => ({
    languages: Object.fromEntries(
      alternateLocales.map((l) => [l, `${baseUrl}/${l}${path}`])
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

  // Blog index
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: alternates("/blog"),
    });
  }

  // Blog articles (from DB)
  try {
    const supabase = createAdminClient();
    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("site", "just-tag")
      .eq("is_published", true)
      .not("published_at", "is", null);

    if (blogPosts) {
      for (const post of blogPosts as { slug: string; updated_at: string | null; published_at: string | null }[]) {
        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/blog/${post.slug}`,
            lastModified: post.updated_at ? new Date(post.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.7,
            alternates: alternates(`/blog/${post.slug}`),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  // Happy Hours listing page
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/happy-hours`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: alternates("/happy-hours"),
    });
  }

  // B2B and info pages
  const weeklyPages = ["pour-restaurateurs", "parrainage", "a-propos"];
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

  // Canton landing pages (SEO long-tail : "restaurants Genève", etc.)
  for (const canton of cantons) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/restaurants/canton/${canton.value}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.85,
        alternates: alternates(`/restaurants/canton/${canton.value}`),
      });
    }
  }

  // City landing pages (SEO long-tail : "restaurants Lausanne", "restaurants Sion", etc.)
  try {
    const supabase = createAdminClient();
    const { data: cityData } = await supabase
      .from("restaurants")
      .select("city, canton")
      .eq("is_published", true)
      .not("city", "is", null)
      .neq("city", "")
      .in("canton", VALID_CANTONS as unknown as string[])
      .limit(15000);

    if (cityData) {
      // Group and count cities
      const cityCounts = new Map<string, number>();
      for (const row of cityData as { city: string; canton: string }[]) {
        const slug = slugifyCity(row.city);
        if (!slug) continue;
        cityCounts.set(slug, (cityCounts.get(slug) || 0) + 1);
      }

      for (const [slug, count] of cityCounts.entries()) {
        if (count < MIN_RESTAURANTS_FOR_CITY_PAGE) continue;
        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/restaurants/ville/${slug}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
            alternates: alternates(`/restaurants/ville/${slug}`),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching cities for sitemap:", error);
  }

  // Individual collection landing pages (terrasse, vue-sur-le-lac, etc.)
  for (const collection of collections) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/collections/${collection.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
        alternates: alternates(`/collections/${collection.slug}`),
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
  // Supabase limite .select() à 1000 lignes par défaut, on pagine par batchs
  // pour récupérer tous les restaurants publiés (~11k et plus à terme).
  try {
    const supabase = createAdminClient();
    const allRestaurants: { slug: string; updated_at: string | null }[] = [];
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("restaurants")
        .select("slug, updated_at")
        .eq("is_published", true)
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Error fetching restaurants batch for sitemap:", error);
        break;
      }
      if (!data || data.length === 0) break;

      allRestaurants.push(...(data as { slug: string; updated_at: string | null }[]));

      if (data.length < pageSize) break;
      from += pageSize;
    }

    for (const r of allRestaurants) {
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/restaurants/${r.slug}`,
          lastModified: r.updated_at
            ? new Date(r.updated_at)
            : now,
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: alternates(`/restaurants/${r.slug}`),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching restaurants for sitemap:", error);
  }

  return entries;
}
