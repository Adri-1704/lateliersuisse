import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cantons, type Canton } from "@/data/cantons";
import { fetchFilteredRestaurants, type RestaurantListItem } from "@/lib/restaurants/queries";
import { MapPin, Star } from "lucide-react";

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

function getLocalizedName(r: RestaurantListItem, locale: string): string {
  switch (locale) {
    case "de": return r.name_de || r.name_fr;
    case "en": return r.name_en || r.name_fr;
    default: return r.name_fr;
  }
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
    fr: `Trouvez les meilleurs restaurants du canton de ${cantonLabel} : bistrots, gastronomique, pizzerias, terrasses. Avis clients vérifiés, menus, horaires et photos.`,
    de: `Finden Sie die besten Restaurants im Kanton ${cantonLabel}: Bistros, Gourmet, Pizzerien, Terrassen. Verifizierte Kundenbewertungen, Menüs, Öffnungszeiten und Fotos.`,
    en: `Find the best restaurants in the canton of ${cantonLabel}: bistros, fine dining, pizzerias, terraces. Verified customer reviews, menus, opening hours and photos.`,
    pt: `Encontre os melhores restaurantes no cantão de ${cantonLabel}: bistrôs, gastronómicos, pizarias, terraços. Avaliações de clientes verificadas, menus, horários e fotos.`,
    es: `Encuentre los mejores restaurantes en el cantón de ${cantonLabel}: bistrós, gastronómicos, pizzerías, terrazas. Reseñas de clientes verificadas, menús, horarios y fotos.`,
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
// Simple server-safe restaurant card (no client hooks)
// ---------------------------------------------------------------------------

function SimpleRestaurantCard({
  restaurant,
  locale,
}: {
  restaurant: RestaurantListItem;
  locale: string;
}) {
  const name = getLocalizedName(restaurant, locale);
  return (
    <Link
      href={`/${locale}/restaurants/${restaurant.slug}`}
      className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black px-4">
        <h3 className="z-10 line-clamp-3 text-center text-lg font-bold text-white">
          {name}
        </h3>
        {restaurant.cuisine_type && (
          <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {restaurant.cuisine_type}
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
          {restaurant.canton.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-1 text-base font-semibold text-gray-900 group-hover:text-[var(--color-just-tag)]">
            {name}
          </h4>
          {restaurant.avg_rating ? (
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-0.5">
              <Star className="h-3.5 w-3.5 fill-[var(--color-just-tag)] text-[var(--color-just-tag)]" />
              <span className="text-sm font-bold text-[var(--color-just-tag)]">
                {restaurant.avg_rating.toFixed(1)}
              </span>
            </div>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {restaurant.city}
          </span>
          {restaurant.review_count ? (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">
                {restaurant.review_count} avis
              </span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
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

  // Localized intro / labels
  const intros: Record<string, string> = {
    fr: `Découvrez ${total.toLocaleString("fr-CH")} restaurants dans le canton de ${cantonLabel} : menus, avis clients, horaires, photos et coordonnées. Trouvez votre prochaine adresse.`,
    de: `Entdecken Sie ${total.toLocaleString("de-CH")} Restaurants im Kanton ${cantonLabel}: Menüs, Kundenbewertungen, Öffnungszeiten, Fotos und Kontaktdaten. Finden Sie Ihre nächste Adresse.`,
    en: `Discover ${total.toLocaleString("en-CH")} restaurants in the canton of ${cantonLabel}: menus, customer reviews, opening hours, photos and contact details. Find your next spot.`,
    pt: `Descubra ${total.toLocaleString("pt-PT")} restaurantes no cantão de ${cantonLabel}: menus, avaliações de clientes, horários, fotos e contactos. Encontre o seu próximo endereço.`,
    es: `Descubra ${total.toLocaleString("es-ES")} restaurantes en el cantón de ${cantonLabel}: menús, reseñas de clientes, horarios, fotos y contactos. Encuentre su próximo sitio.`,
  };
  const intro = intros[locale] || intros.fr;

  const breadcrumbLabels: Record<string, string> = {
    fr: "Restaurants", de: "Restaurants", en: "Restaurants", pt: "Restaurantes", es: "Restaurantes",
  };
  const breadcrumbLabel = breadcrumbLabels[locale] || "Restaurants";

  const seeAllLabels: Record<string, string> = {
    fr: "Voir tous", de: "Alle anzeigen", en: "See all", pt: "Ver todos", es: "Ver todos",
  };
  const seeAllLabel = seeAllLabels[locale] || "Voir tous";

  const otherCantonsLabels: Record<string, string> = {
    fr: "Autres cantons :", de: "Andere Kantone:", en: "Other cantons:", pt: "Outros cantões:", es: "Otros cantones:",
  };
  const otherCantonsLabel = otherCantonsLabels[locale] || "Autres cantons :";

  // JSON-LD
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Restaurants in ${cantonLabel}`,
    description: intro,
    url: `${baseUrl}/${locale}/restaurants/canton/${canton}`,
    numberOfItems: total,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Just-Tag", item: `${baseUrl}/${locale}` },
      { "@type": "ListItem", position: 2, name: breadcrumbLabel, item: `${baseUrl}/${locale}/restaurants` },
      { "@type": "ListItem", position: 3, name: cantonLabel, item: `${baseUrl}/${locale}/restaurants/canton/${canton}` },
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
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/70">
            <Link href={`/${locale}`} className="hover:text-white">Just-Tag</Link>
            <span className="mx-2">›</span>
            <Link href={`/${locale}/restaurants`} className="hover:text-white">{breadcrumbLabel}</Link>
            <span className="mx-2">›</span>
            <span>{cantonLabel}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {locale === "de" ? `Restaurants im Kanton ${cantonLabel}`
                  : locale === "en" ? `Restaurants in the canton of ${cantonLabel}`
                  : locale === "pt" ? `Restaurantes no cantão de ${cantonLabel}`
                  : locale === "es" ? `Restaurantes en el cantón de ${cantonLabel}`
                  : `Restaurants dans le canton de ${cantonLabel}`}
              </h1>
              <p className="mt-2 text-sm text-white/80">
                {total.toLocaleString("fr-CH")} {locale === "de" || locale === "en" ? "restaurants" : locale === "pt" || locale === "es" ? "restaurantes" : "restaurants"}
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-lg text-white/90">{intro}</p>
        </div>
      </section>

      {/* Other cantons navigation */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-semibold text-gray-600">
              {otherCantonsLabel}
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
              {locale === "de" ? "Keine Restaurants gefunden."
                : locale === "en" ? "No restaurants found."
                : locale === "pt" ? "Nenhum restaurante encontrado."
                : locale === "es" ? "No se encontraron restaurantes."
                : "Aucun restaurant trouvé."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                  <SimpleRestaurantCard key={r.id} restaurant={r} locale={locale} />
                ))}
              </div>

              {total > items.length && (
                <div className="mt-10 text-center">
                  <Link
                    href={`/${locale}/restaurants?canton=${canton}`}
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
