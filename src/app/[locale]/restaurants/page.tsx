import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RestaurantCardSkeletonGrid } from "@/components/restaurants/RestaurantCardSkeleton";
import {
  fetchFilteredRestaurants,
  fetchAllFilteredForMap,
  fetchCuisineCounts,
  fetchPublishedRestaurantCount,
} from "@/lib/restaurants/queries";
import { parseRestaurantFilters } from "@/lib/restaurants/filters";
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
// Filtres partagés (voir lib/restaurants/filters.ts) — parsés une seule fois
// à partir des searchParams et réutilisés par generateMetadata() ET par la
// page, pour que le chiffre annoncé dans <title>/meta description soit
// toujours celui réellement affiché sous le h1 (#41 : trois volumes
// différents entre title, meta description et compteur).
// ---------------------------------------------------------------------------

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

  const requestedPage =
    typeof sp.page === "string" && sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const viewIsMap = sp.view === "map";
  const PAGE_SIZE = 24;

  // ---- Fetch data ----

  const [firstAttempt, mapData, cuisineCounts] = await Promise.all([
    fetchFilteredRestaurants(filters, requestedPage, PAGE_SIZE),
    viewIsMap ? fetchAllFilteredForMap(filters) : Promise.resolve(null),
    fetchCuisineCounts(),
  ]);

  // Une page au-delà de la dernière (ex. ?page=520 pour 519 pages réelles)
  // renvoyait "0 restaurant trouvé" et un compteur à 0 au lieu du vrai total
  // (#40, cas 3) : un .range() qui démarre après la dernière ligne filtrée
  // fait échouer TOUTE la requête côté PostgREST (416 "Range Not
  // Satisfiable"), y compris le count. fetchFilteredRestaurants() se
  // rattrape en re-demandant le total via une requête count-only (jamais
  // hors bornes, voir src/lib/restaurants/queries.ts) quand ça arrive : le
  // totalCount reçu ici est donc fiable même quand `requestedPage` dépasse,
  // et on peut détecter le dépassement pour re-fetcher la dernière page valide.
  const totalPages = Math.max(1, Math.ceil(firstAttempt.totalCount / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  if (page !== requestedPage) {
    // Redirige vers la dernière page valide plutôt que d'afficher un
    // cul-de-sac "0 restaurant trouvé" — garde aussi l'URL affichée
    // cohérente avec le contenu réellement rendu.
    const clampedParams = new URLSearchParams(
      Object.entries(sp).flatMap(([key, value]) =>
        value == null ? [] : Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
      )
    );
    clampedParams.set("page", String(page));
    redirect(`/${locale}/restaurants?${clampedParams.toString()}`);
  }

  const listResult = firstAttempt;

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
