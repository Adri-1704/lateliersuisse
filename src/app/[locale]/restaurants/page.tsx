import { Suspense } from "react";
import type { Metadata } from "next";
import { RestaurantCardSkeletonGrid } from "@/components/restaurants/RestaurantCardSkeleton";
import {
  fetchFilteredRestaurants,
  fetchAllFilteredForMap,
  fetchCuisineCounts,
  type RestaurantFilters,
} from "@/lib/restaurants/queries";
import RestaurantsView from "./RestaurantsView";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Tous les restaurants de Suisse Romande — 11 000+ adresses",
    de: "Alle Restaurants der Westschweiz — über 11 000 Adressen",
    en: "All Swiss restaurants in Romandie — 11,000+ places",
    pt: "Todos os restaurantes da Suíça Romanda — 11 000+ endereços",
    es: "Todos los restaurantes de la Suiza Romanda — 11 000+ direcciones",
  };

  const descriptions: Record<string, string> = {
    fr: "Découvrez 11 265 restaurants en Suisse Romande : Genève, Vaud, Valais, Fribourg, Neuchâtel, Jura, Berne. Avis clients, menus, horaires, photos et coordonnées.",
    de: "Entdecken Sie 11 265 Restaurants in der Westschweiz: Genf, Waadt, Wallis, Freiburg, Neuenburg, Jura, Bern. Kundenbewertungen, Menüs, Öffnungszeiten, Fotos.",
    en: "Discover 11,265 restaurants in Western Switzerland: Geneva, Vaud, Valais, Fribourg, Neuchâtel, Jura, Bern. Customer reviews, menus, opening hours, photos.",
    pt: "Descubra 11 265 restaurantes na Suíça Romanda: Genebra, Vaud, Valais, Friburgo, Neuchâtel, Jura, Berna. Avaliações de clientes, menus, horários, fotos.",
    es: "Descubra 11 265 restaurantes en la Suiza Romanda: Ginebra, Vaud, Valais, Friburgo, Neuchâtel, Jura, Berna. Reseñas de clientes, menús, horarios, fotos.",
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

  // ---- Parse searchParams into RestaurantFilters ----

  const canton = typeof sp.canton === "string" ? sp.canton : undefined;
  const cuisine = typeof sp.cuisine === "string" ? sp.cuisine : undefined;
  const city = typeof sp.city === "string" ? sp.city : undefined;
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

  const page =
    typeof sp.page === "string" && sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const viewIsMap = sp.view === "map";

  const filters: RestaurantFilters = {
    canton,
    cuisine,
    city,
    priceMax: priceMax != null && !isNaN(priceMax) ? priceMax : undefined,
    ratingMin: ratingMin != null && !isNaN(ratingMin) ? ratingMin : undefined,
    features: features && features.length > 0 ? features : undefined,
    query: q,
    sort,
  };

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
