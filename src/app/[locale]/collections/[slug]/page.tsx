import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { collections } from "@/data/collections";
import { fetchFilteredRestaurants, type RestaurantListItem } from "@/lib/restaurants/queries";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import type { Restaurant } from "@/data/mock-restaurants";

// Map DB row (snake_case) to Restaurant shape used by card
function toRestaurant(item: RestaurantListItem): Restaurant {
  return {
    id: item.id,
    slug: item.slug,
    nameFr: item.name_fr,
    nameDe: item.name_de,
    nameEn: item.name_en,
    descriptionFr: item.description_fr || "",
    descriptionDe: item.description_de || "",
    descriptionEn: item.description_en || "",
    cuisineType: item.cuisine_type || "",
    canton: item.canton,
    city: item.city,
    address: "",
    postalCode: "",
    latitude: item.latitude || 0,
    longitude: item.longitude || 0,
    phone: "",
    email: "",
    website: "",
    priceRange: parseInt(item.price_range || "2") as 1 | 2 | 3 | 4,
    avgRating: item.avg_rating || 0,
    reviewCount: item.review_count || 0,
    openingHours: (item.opening_hours as Record<string, { open: string; close: string }>) || {},
    features: item.features || [],
    coverImage: item.cover_image || "",
    images: [],
    isFeatured: item.is_featured || false,
    isPublished: true,
    menuItems: [],
  };
}

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

export async function generateStaticParams() {
  // Pre-render all collection pages at build time
  return collections.map((c) => ({ slug: c.slug }));
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

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    notFound();
  }

  const title = getCollectionTitle(collection, locale);
  const description = getCollectionDescription(collection, locale);

  // Fetch restaurants matching this collection's filters
  const { data: items, totalCount: total } = await fetchFilteredRestaurants(
    {
      features: collection.filterFeature ? [collection.filterFeature] : undefined,
      cuisine: collection.filterCuisine,
      sort: "rating",
    },
    1,
    24
  );

  const labels: Record<string, { restaurants: string; seeAll: string; breadcrumb: string }> = {
    fr: { restaurants: total === 1 ? "restaurant" : "restaurants", seeAll: "Voir tous", breadcrumb: "Collections" },
    de: { restaurants: total === 1 ? "Restaurant" : "Restaurants", seeAll: "Alle anzeigen", breadcrumb: "Sammlungen" },
    en: { restaurants: total === 1 ? "restaurant" : "restaurants", seeAll: "See all", breadcrumb: "Collections" },
    pt: { restaurants: total === 1 ? "restaurante" : "restaurantes", seeAll: "Ver todos", breadcrumb: "Coleções" },
    es: { restaurants: total === 1 ? "restaurante" : "restaurantes", seeAll: "Ver todos", breadcrumb: "Colecciones" },
  };
  const l = labels[locale] || labels.fr;

  // Build CanonicalFilter query for "See all" link
  const qs = new URLSearchParams();
  if (collection.filterFeature) qs.set("features", collection.filterFeature);
  if (collection.filterCuisine) qs.set("cuisine", collection.filterCuisine);

  // Structured data (CollectionPage schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${baseUrl}/${locale}/collections/${slug}`,
    numberOfItems: total,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-[var(--color-just-tag)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/70">
            <Link href={`/${locale}`} className="hover:text-white">
              Just-Tag
            </Link>
            <span className="mx-2">›</span>
            <Link
              href={`/${locale}/collections`}
              className="hover:text-white"
            >
              {l.breadcrumb}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-5xl sm:text-6xl">{collection.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {total} {l.restaurants}
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-lg text-white/90">{description}</p>
        </div>
      </section>

      {/* Restaurants grid */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <p className="text-center text-gray-500">
              Aucun restaurant pour l&apos;instant.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                  <RestaurantCard key={r.id} restaurant={toRestaurant(r)} />
                ))}
              </div>

              {total > items.length && (
                <div className="mt-10 text-center">
                  <Link
                    href={`/${locale}/restaurants?${qs.toString()}`}
                    className="inline-block rounded-xl bg-[var(--color-just-tag)] px-8 py-3 font-semibold text-white shadow-md transition hover:scale-105"
                  >
                    {l.seeAll} ({total})
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
