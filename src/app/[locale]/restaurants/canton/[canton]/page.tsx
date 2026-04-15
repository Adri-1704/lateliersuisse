import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cantons, type Canton } from "@/data/cantons";
import { fetchFilteredRestaurants, type RestaurantListItem } from "@/lib/restaurants/queries";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import type { Restaurant } from "@/data/mock-restaurants";
import { MapPin } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

// ---------------------------------------------------------------------------
// i18n helpers
// ---------------------------------------------------------------------------

function getCantonLabel(canton: (typeof cantons)[number], locale: string): string {
  switch (locale) {
    case "de": return canton.labelDe;
    case "en": return canton.labelEn;
    case "pt": return canton.labelPt;
    case "es": return canton.labelEs;
    default: return canton.label;
  }
}

function getIntroLabel(locale: string, cantonLabel: string, count: number): string {
  switch (locale) {
    case "de":
      return `Entdecken Sie ${count.toLocaleString("de-CH")} Restaurants im Kanton ${cantonLabel}: Menüs, Bewertungen, Öffnungszeiten, Fotos. Keine Provision, in der Schweiz gehostet.`;
    case "en":
      return `Discover ${count.toLocaleString("en-CH")} restaurants in the canton of ${cantonLabel}: menus, reviews, opening hours, photos. Zero commission, Swiss-hosted.`;
    case "pt":
      return `Descubra ${count.toLocaleString("pt-PT")} restaurantes no cantão de ${cantonLabel}: menus, avaliações, horários, fotos. Sem comissões, alojado na Suíça.`;
    case "es":
      return `Descubra ${count.toLocaleString("es-ES")} restaurantes en el cantón de ${cantonLabel}: menús, reseñas, horarios, fotos. Sin comisiones, alojado en Suiza.`;
    default:
      return `Découvrez ${count.toLocaleString("fr-CH")} restaurants dans le canton de ${cantonLabel} : menus, avis, horaires, photos. Zéro commission, hébergé en Suisse.`;
  }
}

function getSeeAllLabel(locale: string): string {
  switch (locale) {
    case "de": return "Alle anzeigen";
    case "en": return "See all";
    case "pt": return "Ver todos";
    case "es": return "Ver todos";
    default: return "Voir tous";
  }
}

function getBreadcrumbLabel(locale: string): string {
  switch (locale) {
    case "de": return "Restaurants";
    case "en": return "Restaurants";
    case "pt": return "Restaurantes";
    case "es": return "Restaurantes";
    default: return "Restaurants";
  }
}

function getRestaurantsLabel(locale: string, n: number): string {
  switch (locale) {
    case "de": return n === 1 ? "1 Restaurant" : `${n.toLocaleString("de-CH")} Restaurants`;
    case "en": return n === 1 ? "1 restaurant" : `${n.toLocaleString("en-CH")} restaurants`;
    case "pt": return n === 1 ? "1 restaurante" : `${n.toLocaleString("pt-PT")} restaurantes`;
    case "es": return n === 1 ? "1 restaurante" : `${n.toLocaleString("es-ES")} restaurantes`;
    default: return n === 1 ? "1 restaurant" : `${n.toLocaleString("fr-CH")} restaurants`;
  }
}

// ---------------------------------------------------------------------------
// Mapper: RestaurantListItem → Restaurant (for card rendering)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Pre-render all canton pages
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  return cantons.map((c) => ({ canton: c.value }));
}

// ---------------------------------------------------------------------------
// SEO metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; canton: string }>;
}): Promise<Metadata> {
  const { locale, canton } = await params;
  const cantonData = cantons.find((c) => c.value === canton);
  if (!cantonData) return {};

  const cantonLabel = getCantonLabel(cantonData, locale);

  const titles: Record<string, string> = {
    fr: `Restaurants dans le canton de ${cantonLabel} — Just-Tag`,
    de: `Restaurants im Kanton ${cantonLabel} — Just-Tag`,
    en: `Restaurants in the canton of ${cantonLabel} — Just-Tag`,
    pt: `Restaurantes no cantão de ${cantonLabel} — Just-Tag`,
    es: `Restaurantes en el cantón de ${cantonLabel} — Just-Tag`,
  };

  const descriptions: Record<string, string> = {
    fr: `Trouvez les meilleurs restaurants du canton de ${cantonLabel} : bistrots, gastronomique, pizzerias, terrasses. Avis vérifiés, menus, horaires. Plateforme suisse sans commission.`,
    de: `Finden Sie die besten Restaurants im Kanton ${cantonLabel}: Bistros, Gourmet, Pizzerien, Terrassen. Verifizierte Bewertungen, Menüs, Öffnungszeiten. Schweizer Plattform ohne Provision.`,
    en: `Find the best restaurants in the canton of ${cantonLabel}: bistros, fine dining, pizzerias, terraces. Verified reviews, menus, opening hours. Swiss platform with zero commission.`,
    pt: `Encontre os melhores restaurantes no cantão de ${cantonLabel}: bistrôs, gastronómicos, pizarias, terraços. Avaliações verificadas, menus, horários. Plataforma suíça sem comissão.`,
    es: `Encuentre los mejores restaurantes en el cantón de ${cantonLabel}: bistrós, gastronómicos, pizzerías, terrazas. Reseñas verificadas, menús, horarios. Plataforma suiza sin comisión.`,
  };

  return {
    title: titles[locale] || titles.fr,
    description: descriptions[locale] || descriptions.fr,
    alternates: {
      canonical: `/${locale}/restaurants/canton/${canton}`,
      languages: {
        fr: `/fr/restaurants/canton/${canton}`,
        de: `/de/restaurants/canton/${canton}`,
        en: `/en/restaurants/canton/${canton}`,
        pt: `/pt/restaurants/canton/${canton}`,
        es: `/es/restaurants/canton/${canton}`,
      },
    },
    openGraph: {
      title: titles[locale] || titles.fr,
      description: descriptions[locale] || descriptions.fr,
      url: `${baseUrl}/${locale}/restaurants/canton/${canton}`,
      type: "website",
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CantonRestaurantsPage({
  params,
}: {
  params: Promise<{ locale: string; canton: string }>;
}) {
  const { locale, canton } = await params;
  const cantonData = cantons.find((c) => c.value === canton);

  if (!cantonData) {
    notFound();
  }

  const cantonLabel = getCantonLabel(cantonData, locale);

  // Fetch 24 top-rated restaurants in the canton
  const { data: items, totalCount: total } = await fetchFilteredRestaurants(
    {
      canton: canton as Canton,
      sort: "rating",
    },
    1,
    24
  );

  const intro = getIntroLabel(locale, cantonLabel, total);
  const seeAllLabel = getSeeAllLabel(locale);
  const breadcrumbLabel = getBreadcrumbLabel(locale);

  // Build query string for "See all" link
  const qs = new URLSearchParams();
  qs.set("canton", canton);

  // Structured data (CollectionPage + BreadcrumbList)
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Restaurants in ${cantonLabel}`,
    description: intro,
    url: `${baseUrl}/${locale}/restaurants/canton/${canton}`,
    numberOfItems: total,
    isPartOf: {
      "@type": "WebSite",
      name: "Just-Tag",
      url: baseUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Just-Tag",
        item: `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: breadcrumbLabel,
        item: `${baseUrl}/${locale}/restaurants`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cantonLabel,
        item: `${baseUrl}/${locale}/restaurants/canton/${canton}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
            <Link href={`/${locale}/restaurants`} className="hover:text-white">
              {breadcrumbLabel}
            </Link>
            <span className="mx-2">›</span>
            <span>{cantonLabel}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {locale === "de"
                  ? `Restaurants im Kanton ${cantonLabel}`
                  : locale === "en"
                  ? `Restaurants in the canton of ${cantonLabel}`
                  : locale === "pt"
                  ? `Restaurantes no cantão de ${cantonLabel}`
                  : locale === "es"
                  ? `Restaurantes en el cantón de ${cantonLabel}`
                  : `Restaurants dans le canton de ${cantonLabel}`}
              </h1>
              <p className="mt-2 text-sm text-white/80">
                {getRestaurantsLabel(locale, total)}
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-lg text-white/90">{intro}</p>
        </div>
      </section>

      {/* Other cantons navigation */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <span className="mr-2 text-sm font-semibold text-gray-600">
              {locale === "de"
                ? "Andere Kantone:"
                : locale === "en"
                ? "Other cantons:"
                : locale === "pt"
                ? "Outros cantões:"
                : locale === "es"
                ? "Otros cantones:"
                : "Autres cantons :"}
            </span>
            {cantons
              .filter((c) => c.value !== canton)
              .map((c) => (
                <Link
                  key={c.value}
                  href={`/${locale}/restaurants/canton/${c.value}`}
                  className="rounded-full bg-white px-4 py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-[var(--color-just-tag)] hover:text-white"
                >
                  {getCantonLabel(c, locale)}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Restaurants grid */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <p className="text-center text-gray-500">
              {locale === "de"
                ? "Keine Restaurants gefunden."
                : locale === "en"
                ? "No restaurants found."
                : locale === "pt"
                ? "Nenhum restaurante encontrado."
                : locale === "es"
                ? "No se encontraron restaurantes."
                : "Aucun restaurant trouvé."}
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
                    {seeAllLabel} ({total.toLocaleString("fr-CH")})
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
