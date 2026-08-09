import { Suspense } from "react";
import type { Metadata } from "next";
import { RestaurantCardSkeletonGrid } from "@/components/restaurants/RestaurantCardSkeleton";
import {
  fetchFilteredRestaurants,
  fetchAllFilteredForMap,
  fetchCuisineCounts,
  fetchPublishedRestaurantCount,
  type RestaurantFilters,
} from "@/lib/restaurants/queries";
import RestaurantsView from "./RestaurantsView";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

const NUMBER_LOCALES: Record<string, string> = {
  fr: "fr-CH",
  de: "de-CH",
  en: "en-US",
  pt: "pt-PT",
  es: "es-ES",
};

// ---------------------------------------------------------------------------
// Filtres partagés — parsés une seule fois à partir des searchParams et
// réutilisés par generateMetadata() ET par la page, pour que le chiffre
// annoncé dans <title>/meta description soit toujours celui réellement
// affiché sous le h1 (#41 : trois volumes différents entre title, meta
// description et compteur).
// ---------------------------------------------------------------------------

function parseRestaurantFilters(
  sp: Record<string, string | string[] | undefined>
): RestaurantFilters {
  const establishmentType = typeof sp.type === "string" ? sp.type : undefined;
  const canton = typeof sp.canton === "string" ? sp.canton : undefined;
  const cuisine = typeof sp.cuisine === "string" ? sp.cuisine : undefined;
  // ?city= peut contenir plusieurs variantes brutes d'une même commune
  // canonicalisée séparées par une virgule (ex. "Bern,Berne"), générées par
  // le lien "Voir tous" de la page ville (voir lib/restaurants/city-canton.ts) —
  // sinon un simple filtre sur le nom fusionné ne matcherait aucune ligne
  // dont `city` est une variante brute différente (#34, bloquant sécurité).
  const city =
    typeof sp.city === "string" && sp.city
      ? sp.city.includes(",")
        ? sp.city.split(",").filter(Boolean)
        : sp.city
      : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const priceMax =
    typeof sp.price === "string" && sp.price ? parseInt(sp.price, 10) : undefined;
  const ratingMin =
    typeof sp.rating === "string" && sp.rating ? parseFloat(sp.rating) : undefined;

  const features =
    typeof sp.features === "string"
      ? sp.features.split(",").filter(Boolean)
      : undefined;

  const sortRaw = typeof sp.sort === "string" ? sp.sort : "rating";
  const sort = (["rating", "price", "priceDesc", "name", "newest"].includes(sortRaw)
    ? sortRaw
    : "rating") as RestaurantFilters["sort"];

  return {
    establishmentType,
    canton,
    cuisine,
    city,
    priceMax: priceMax != null && !isNaN(priceMax) ? priceMax : undefined,
    ratingMin: ratingMin != null && !isNaN(ratingMin) ? ratingMin : undefined,
    features: features && features.length > 0 ? features : undefined,
    query: q,
    sort,
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const filters = parseRestaurantFilters(sp);

  // Source de vérité unique : le même compteur exact (DB, filtres identiques
  // à ceux appliqués par la page) alimente le <title>, la meta description
  // ET le compteur affiché sous le h1.
  const count = await fetchPublishedRestaurantCount(filters);
  const formattedCount = count.toLocaleString(NUMBER_LOCALES[locale] || NUMBER_LOCALES.fr);

  const titles: Record<string, string> = {
    fr: `Tous les restaurants de Suisse Romande — ${formattedCount} adresses`,
    de: `Alle Restaurants der Westschweiz — ${formattedCount} Adressen`,
    en: `All Swiss restaurants in Romandie — ${formattedCount} places`,
    pt: `Todos os restaurantes da Suíça Romanda — ${formattedCount} endereços`,
    es: `Todos los restaurantes de la Suiza Romanda — ${formattedCount} direcciones`,
  };

  const descriptions: Record<string, string> = {
    fr: `Découvrez ${formattedCount} restaurants en Suisse Romande : Genève, Vaud, Valais, Fribourg, Neuchâtel, Jura, Berne. Avis clients, menus, horaires, photos et coordonnées.`,
    de: `Entdecken Sie ${formattedCount} Restaurants in der Westschweiz: Genf, Waadt, Wallis, Freiburg, Neuenburg, Jura, Bern. Kundenbewertungen, Menüs, Öffnungszeiten, Fotos.`,
    en: `Discover ${formattedCount} restaurants in Western Switzerland: Geneva, Vaud, Valais, Fribourg, Neuchâtel, Jura, Bern. Customer reviews, menus, opening hours, photos.`,
    pt: `Descubra ${formattedCount} restaurantes na Suíça Romanda: Genebra, Vaud, Valais, Friburgo, Neuchâtel, Jura, Berna. Avaliações de clientes, menus, horários, fotos.`,
    es: `Descubra ${formattedCount} restaurantes en la Suiza Romanda: Ginebra, Vaud, Valais, Friburgo, Neuchâtel, Jura, Berna. Reseñas de clientes, menús, horarios, fotos.`,
  };

  return {
    title: titles[locale] || titles.fr,
    description: descriptions[locale] || descriptions.fr,
    alternates: {
      canonical: `/${locale}/restaurants`,
      languages: {
        fr: "/fr/restaurants",
        de: "/de/restaurants",
        en: "/en/restaurants",
        pt: "/pt/restaurants",
        es: "/es/restaurants",
      },
    },
    openGraph: {
      title: titles[locale] || titles.fr,
      description: descriptions[locale] || descriptions.fr,
      url: `${baseUrl}/${locale}/restaurants`,
      type: "website",
    },
  };
}

// ---------------------------------------------------------------------------
// Server Component — reads searchParams, fetches from Supabase, passes to view
// ---------------------------------------------------------------------------

export default async function RestaurantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const filters = parseRestaurantFilters(sp);

  const page =
    typeof sp.page === "string" && sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const viewIsMap = sp.view === "map";

  // ---- Fetch data ----

  const [listResult, mapData, cuisineCounts] = await Promise.all([
    fetchFilteredRestaurants(filters, page, 24),
    viewIsMap ? fetchAllFilteredForMap(filters) : Promise.resolve(null),
    fetchCuisineCounts(),
  ]);

  // ---- Render ----

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <RestaurantCardSkeletonGrid />
        </div>
      }
    >
      <RestaurantsView
        restaurants={listResult.data}
        totalCount={listResult.totalCount}
        currentPage={page}
        mapRestaurants={mapData}
        locale={locale}
        cuisineCounts={cuisineCounts}
      />
    </Suspense>
  );
}
