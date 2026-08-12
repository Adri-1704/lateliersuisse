import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collections } from "@/data/collections";
import {
  fetchFilteredRestaurants,
  fetchAllFilteredForMap,
  fetchCuisineCounts,
  type RestaurantFilters,
} from "@/lib/restaurants/queries";
import { parseRestaurantFilters } from "@/lib/restaurants/filters";
import { RestaurantCardSkeletonGrid } from "@/components/restaurants/RestaurantCardSkeleton";
import RestaurantsView from "../../restaurants/RestaurantsView";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

function getCollectionTitle(
  collection: (typeof collections)[number],
  locale: string
): string {
  switch (locale) {
    case "de": return collection.titleDe;
    case "en": return collection.titleEn;
    case "pt": return collection.titlePt;
    case "es": return collection.titleEs;
    default: return collection.titleFr;
  }
}

function getCollectionDescription(
  collection: (typeof collections)[number],
  locale: string
): string {
  switch (locale) {
    case "de": return collection.descriptionDe;
    case "en": return collection.descriptionEn;
    case "pt": return collection.descriptionPt;
    case "es": return collection.descriptionEs;
    default: return collection.descriptionFr;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) return {};

  const title = getCollectionTitle(collection, locale);
  const description = getCollectionDescription(collection, locale);

  return {
    title: `${title} — Just-Tag`,
    description,
    alternates: {
      canonical: `/${locale}/collections/${slug}`,
      languages: {
        fr: `/fr/collections/${slug}`,
        de: `/de/collections/${slug}`,
        en: `/en/collections/${slug}`,
        pt: `/pt/collections/${slug}`,
        es: `/es/collections/${slug}`,
      },
    },
    openGraph: {
      title: `${title} — Just-Tag`,
      description,
      url: `${baseUrl}/${locale}/collections/${slug}`,
      type: "website",
      images: collection.coverImage ? [{ url: collection.coverImage }] : undefined,
    },
  };
}

const BACK_TO_COLLECTIONS: Record<string, string> = {
  fr: "← Toutes les ambiances",
  de: "← Alle Ambianzen",
  en: "← All ambiances",
  pt: "← Todos os ambientes",
  es: "← Todos los ambientes",
};

// ---------------------------------------------------------------------------
// #41 : cette page redirigeait (307) vers /restaurants?features=... alors que
// generateMetadata() ci-dessus produit un title/description/canonical propres
// à la collection et que le sitemap déclare ces 12 URL comme indexables — la
// page servie ne correspondait donc jamais aux métadonnées annoncées. On sert
// désormais ici le vrai contenu filtré (mêmes requêtes que /restaurants),
// avec un h1 et un canonical qui reflètent la collection choisie.
// ---------------------------------------------------------------------------

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    notFound();
  }

  const sp = await searchParams;
  const userFilters = parseRestaurantFilters(sp);

  // Le filtre de la collection définit la page ; il prévaut sur un éventuel
  // paramètre contradictoire déjà présent dans l'URL.
  const filters: RestaurantFilters = {
    ...userFilters,
    features: collection.filterFeature
      ? [collection.filterFeature, ...(userFilters.features || []).filter((f) => f !== collection.filterFeature)]
      : userFilters.features,
    cuisine: collection.filterCuisine || userFilters.cuisine,
  };

  const page =
    typeof sp.page === "string" && sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  const viewIsMap = sp.view === "map";

  const [listResult, mapData, cuisineCounts] = await Promise.all([
    fetchFilteredRestaurants(filters, page, 24),
    viewIsMap ? fetchAllFilteredForMap(filters) : Promise.resolve(null),
    fetchCuisineCounts(),
  ]);

  const title = getCollectionTitle(collection, locale);
  const description = getCollectionDescription(collection, locale);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/collections`}
          className="text-sm font-medium text-[var(--color-just-tag)] hover:underline"
        >
          {BACK_TO_COLLECTIONS[locale] || BACK_TO_COLLECTIONS.fr}
        </Link>
      </div>
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
          basePath={`collections/${slug}`}
          heading={`${collection.icon} ${title}`}
          subheading={description}
        />
      </Suspense>
    </div>
  );
}
