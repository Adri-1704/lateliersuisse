import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { cantons } from "@/data/cantons";
import { collections } from "@/data/collections";
import { VALID_CANTON_CODES } from "@/lib/city-slug";
import { fetchAllRows } from "@/lib/supabase/paginate";
import { buildCityAggregate } from "@/lib/restaurants/city-canton";

// SEO long-tail : abaissé de 5 à 1 pour rendre indexables toutes les villes
// avec au moins 1 resto. Évite les 404 quand Google découvre une ville via
// un lien interne (canton page → liste villes) qui était sous le seuil.
const MIN_RESTAURANTS_FOR_CITY_PAGE = 3;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://just-tag.app";
    // SEO : seules les URLs FR sont dans le sitemap et indexées.
  // Les hreflang vers DE/EN/PT/ES ont été retirés du sitemap car ces pages
  // sont en noindex — Google les découvrait via hreflang, ne pouvait pas
  // les indexer, et choisissait un canonical différent (9 969 erreurs Search Console).
  const locales = ["fr"];
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    });
  }

  // Restaurant listing page
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/restaurants`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  // Collections page
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/collections`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,

    });
  }

  // Blog index
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,

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

      });
    }
  }

  // City landing pages (SEO long-tail : "restaurants Lausanne", "restaurants Sion", etc.)
  try {
    const supabase = createAdminClient();
    // PostgREST plafonne toute réponse à 1000 lignes : le .limit(15000)
    // ci-dessous était silencieusement écrasé par ce plafond serveur, ne
    // couvrant qu'un échantillon non déterministe (~9% de la base). On
    // pagine par lots de 1000, comme pour les fiches restaurant plus bas.
    const cityData = await fetchAllRows<{ city: string; canton: string }>(
      ({ from, to }) =>
        supabase
          .from("restaurants")
          .select("city, canton")
          .eq("is_published", true)
          .not("city", "is", null)
          .neq("city", "")
          .in("canton", VALID_CANTON_CODES)
          .order("id", { ascending: true })
          .range(from, to),
      { onError: (msg) => console.error("Error fetching cities batch for sitemap:", msg) }
    );

    if (cityData) {
      // Regroupement normalisé ville/canton (voir lib/restaurants/city-canton) :
      // exclut les codes postaux et les communes étrangères/hors périmètre,
      // fusionne les doublons (Bern/Berne, Bienne/Biel-Bienne...). Le slug
      // généré ici est EXACTEMENT celui que résoudra la page ville
      // (resolveCitySlug), garantissant l'absence de lien mort dans le
      // sitemap (#40 — 23 liens canton→ville en 404, notamment pour
      // Neuchâtel où des codes postaux étaient traités comme des villes).
      const cityAggregate = buildCityAggregate(cityData);

      for (const entry of cityAggregate.values()) {
        if (entry.count < MIN_RESTAURANTS_FOR_CITY_PAGE) continue;
        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/restaurants/ville/${entry.slug}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,

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
  
        });
      }
    }
  } catch (error) {
    console.error("Error fetching restaurants for sitemap:", error);
  }

  return entries;
}
