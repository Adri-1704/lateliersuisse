import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cantons } from "@/data/cantons";
import { fetchFilteredRestaurants, type RestaurantListItem } from "@/lib/restaurants/queries";
import { getCitiesForCanton, resolveCitySlug } from "@/lib/restaurants/city-canton";
import { safeJsonLd } from "@/lib/json-ld";
import { MapPin, Star } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";
// Aligné avec sitemap.ts : seuil à 1 pour rendre indexables toutes les villes
// avec au moins 1 resto (évite les 404 sur les liens internes canton → ville).
const MIN_RESTAURANTS_FOR_CITY_PAGE = 1;

// SEO Quick Win: ISR (30 min) sur les pages villes — pages SEO critiques.
export const dynamic = "force-static";
export const revalidate = 1800;
export const dynamicParams = true;

// ---------------------------------------------------------------------------
// Resolve city slug → actual city name from DB
// ---------------------------------------------------------------------------

interface ResolvedCity {
  name: string;           // original case: "Genève", "La Chaux-de-Fonds"
  slug: string;           // "geneve", "la-chaux-de-fonds"
  canton: string;         // canton value from cantons.ts
  count: number;
}

// La résolution passe par `resolveCitySlug`, qui pagine sur l'intégralité
// des restaurants publiés (pas de plafond PostgREST — #33) et normalise
// ville/canton (dédoublonnage, exclusion des codes postaux et des communes
// étrangères, correction des rattachements erronés — #34). Le compteur
// renvoyé (`count`) est LA source de vérité unique utilisée pour le <title>,
// le sous-titre et le fil d'Ariane de cette page (#34 — compteurs
// contradictoires).
async function resolveCity(slug: string): Promise<ResolvedCity | null> {
  const entry = await resolveCitySlug(slug);
  if (!entry || entry.count < MIN_RESTAURANTS_FOR_CITY_PAGE) return null;
  return { name: entry.name, slug: entry.slug, canton: entry.cantonSlug, count: entry.count };
}

// ---------------------------------------------------------------------------
// Fetch other cities in same canton (for internal linking)
// ---------------------------------------------------------------------------

async function getOtherCitiesInCanton(canton: string, currentCitySlug: string, limit = 8): Promise<{ slug: string; name: string; count: number }[]> {
  const cities = await getCitiesForCanton(canton);
  return cities
    .filter((c) => c.slug !== currentCitySlug && c.count >= MIN_RESTAURANTS_FOR_CITY_PAGE)
    .slice(0, limit)
    .map((c) => ({ slug: c.slug, name: c.name, count: c.count }));
}

// ---------------------------------------------------------------------------
// SEO metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const { locale, city } = await params;
  const resolved = await resolveCity(city);
  if (!resolved) return {};

  // Accord singulier/pluriel (évite "1 adresses")
  const fr_adresse = resolved.count === 1 ? "adresse" : "adresses";
  const de_adresse = resolved.count === 1 ? "Adresse" : "Adressen";
  const en_place = resolved.count === 1 ? "place" : "places";
  const pt_endereco = resolved.count === 1 ? "endereço" : "endereços";
  const es_direccion = resolved.count === 1 ? "dirección" : "direcciones";

  const titles: Record<string, string> = {
    fr: `Restaurants à ${resolved.name} — ${resolved.count} ${fr_adresse} | Just-Tag`,
    de: `Restaurants in ${resolved.name} — ${resolved.count} ${de_adresse} | Just-Tag`,
    en: `Restaurants in ${resolved.name} — ${resolved.count} ${en_place} | Just-Tag`,
    pt: `Restaurantes em ${resolved.name} — ${resolved.count} ${pt_endereco} | Just-Tag`,
    es: `Restaurantes en ${resolved.name} — ${resolved.count} ${es_direccion} | Just-Tag`,
  };

  const descriptions: Record<string, string> = {
    fr: `Trouvez les meilleurs restaurants à ${resolved.name} : bistrots, gastronomique, pizzerias, terrasses. Avis clients vérifiés, menus, horaires et photos.`,
    de: `Finden Sie die besten Restaurants in ${resolved.name}: Bistros, Gourmet, Pizzerien, Terrassen. Verifizierte Kundenbewertungen, Menüs, Öffnungszeiten und Fotos.`,
    en: `Find the best restaurants in ${resolved.name}: bistros, fine dining, pizzerias, terraces. Verified customer reviews, menus, opening hours and photos.`,
    pt: `Encontre os melhores restaurantes em ${resolved.name}: bistrôs, gastronómicos, pizarias, terraços. Avaliações de clientes verificadas, menus, horários e fotos.`,
    es: `Encuentre los mejores restaurantes en ${resolved.name}: bistrós, gastronómicos, pizzerías, terrazas. Reseñas de clientes verificadas, menús, horarios y fotos.`,
  };

  return {
    title: titles[locale] || titles.fr,
    description: descriptions[locale] || descriptions.fr,
    alternates: {
      canonical: `/${locale}/restaurants/ville/${city}`,
      languages: {
        fr: `/fr/restaurants/ville/${city}`,
        de: `/de/restaurants/ville/${city}`,
        en: `/en/restaurants/ville/${city}`,
        pt: `/pt/restaurants/ville/${city}`,
        es: `/es/restaurants/ville/${city}`,
      },
    },
    openGraph: {
      title: titles[locale] || titles.fr,
      description: descriptions[locale] || descriptions.fr,
      url: `${baseUrl}/${locale}/restaurants/ville/${city}`,
      type: "website",
    },
  };
}

// ---------------------------------------------------------------------------
// Simple server-safe restaurant card
// ---------------------------------------------------------------------------

function getLocalizedName(r: RestaurantListItem, locale: string): string {
  switch (locale) {
    case "de": return r.name_de || r.name_fr;
    case "en": return r.name_en || r.name_fr;
    default: return r.name_fr;
  }
}

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
          <span className="line-clamp-1">{restaurant.city}</span>
          {restaurant.review_count ? (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">{restaurant.review_count} avis</span>
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

export default async function CityRestaurantsPage({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const { locale, city } = await params;
  const resolved = await resolveCity(city);

  if (!resolved) {
    notFound();
  }

  // Fetch the 24 top-rated restaurants in this city.
  // Le compteur affiché (titre, sous-titre, JSON-LD) provient exclusivement
  // de `resolved.count` (agrégat normalisé ville/canton) — pas du total
  // renvoyé par cette requête — pour éviter les 3 compteurs contradictoires
  // relevés en recette (#34). `total` ne sert ici qu'à savoir si un lien
  // "voir tous" doit être affiché.
  const { data: items } = await fetchFilteredRestaurants(
    {
      city: resolved.name,
      sort: "rating",
    },
    1,
    24
  );
  const total = resolved.count;

  const otherCities = await getOtherCitiesInCanton(resolved.canton, resolved.slug, 8);

  const cantonData = cantons.find((c) => c.value === resolved.canton);
  const cantonLabel = cantonData
    ? (locale === "de" ? cantonData.labelDe
      : locale === "en" ? cantonData.labelEn
      : locale === "pt" ? cantonData.labelPt
      : locale === "es" ? cantonData.labelEs
      : cantonData.label)
    : resolved.canton;

  // Localized strings
  const intros: Record<string, string> = {
    fr: `Découvrez ${total.toLocaleString("fr-CH")} restaurants à ${resolved.name} : menus, avis clients, horaires, photos et coordonnées. Trouvez votre prochaine adresse.`,
    de: `Entdecken Sie ${total.toLocaleString("de-CH")} Restaurants in ${resolved.name}: Menüs, Kundenbewertungen, Öffnungszeiten, Fotos und Kontaktdaten.`,
    en: `Discover ${total.toLocaleString("en-CH")} restaurants in ${resolved.name}: menus, customer reviews, opening hours, photos and contact details.`,
    pt: `Descubra ${total.toLocaleString("pt-PT")} restaurantes em ${resolved.name}: menus, avaliações de clientes, horários, fotos e contactos.`,
    es: `Descubra ${total.toLocaleString("es-ES")} restaurantes en ${resolved.name}: menús, reseñas de clientes, horarios, fotos y contactos.`,
  };
  const intro = intros[locale] || intros.fr;

  const h1: Record<string, string> = {
    fr: `Restaurants à ${resolved.name}`,
    de: `Restaurants in ${resolved.name}`,
    en: `Restaurants in ${resolved.name}`,
    pt: `Restaurantes em ${resolved.name}`,
    es: `Restaurantes en ${resolved.name}`,
  };

  const breadcrumbLabels: Record<string, string> = {
    fr: "Restaurants", de: "Restaurants", en: "Restaurants", pt: "Restaurantes", es: "Restaurantes",
  };
  const breadcrumbLabel = breadcrumbLabels[locale] || "Restaurants";

  const otherCitiesLabel: Record<string, string> = {
    fr: `Autres villes du canton ${cantonData?.prepositionFr === "du" ? "du" : "de"} ${cantonLabel} :`,
    de: `Andere Städte im Kanton ${cantonLabel}:`,
    en: `Other cities in the canton of ${cantonLabel}:`,
    pt: `Outras cidades no cantão de ${cantonLabel}:`,
    es: `Otras ciudades en el cantón ${cantonData?.prepositionEs === "del" ? "del" : "de"} ${cantonLabel}:`,
  };

  const seeAllLabels: Record<string, string> = {
    fr: "Voir tous", de: "Alle anzeigen", en: "See all", pt: "Ver todos", es: "Ver todos",
  };

  // JSON-LD structured data
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Restaurants in ${resolved.name}`,
    description: intro,
    url: `${baseUrl}/${locale}/restaurants/ville/${city}`,
    numberOfItems: total,
  };

  // Évite le doublon "Genève › Genève" quand la ville porte le nom du canton.
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Just-Tag", item: `${baseUrl}/${locale}` },
    { "@type": "ListItem", position: 2, name: breadcrumbLabel, item: `${baseUrl}/${locale}/restaurants` },
    ...(cantonLabel !== resolved.name
      ? [{ "@type": "ListItem", position: 3, name: cantonLabel, item: `${baseUrl}/${locale}/restaurants/canton/${resolved.canton}` }]
      : []),
    { "@type": "ListItem", position: cantonLabel !== resolved.name ? 4 : 3, name: resolved.name, item: `${baseUrl}/${locale}/restaurants/ville/${city}` },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-[var(--color-just-tag)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/70">
            <Link href={`/${locale}`} className="hover:text-white">Just-Tag</Link>
            <span className="mx-2">›</span>
            <Link href={`/${locale}/restaurants`} className="hover:text-white">{breadcrumbLabel}</Link>
            {/* Ville portant le même nom que son canton (Genève, Berne, Fribourg) :
                on évite le doublon "Genève › Genève" dans le fil d'Ariane. */}
            {cantonLabel !== resolved.name && (
              <>
                <span className="mx-2">›</span>
                <Link href={`/${locale}/restaurants/canton/${resolved.canton}`} className="hover:text-white">
                  {cantonLabel}
                </Link>
              </>
            )}
            <span className="mx-2">›</span>
            <span>{resolved.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {h1[locale] || h1.fr}
              </h1>
              <p className="mt-2 text-sm text-white/80">
                {total.toLocaleString("fr-CH")} {locale === "de" || locale === "en" ? "restaurants" : locale === "pt" || locale === "es" ? "restaurantes" : "restaurants"} · {cantonLabel}
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-lg text-white/90">{intro}</p>
        </div>
      </section>

      {/* Other cities in canton */}
      {otherCities.length > 0 && (
        <section className="border-b bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm font-semibold text-gray-600">
                {otherCitiesLabel[locale] || otherCitiesLabel.fr}
              </span>
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${locale}/restaurants/ville/${c.slug}`}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-[var(--color-just-tag)] hover:text-white"
                >
                  {c.name}
                  <span className="text-xs opacity-70">({c.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
                    href={`/${locale}/restaurants?city=${encodeURIComponent(resolved.name)}`}
                    className="inline-block rounded-xl bg-[var(--color-just-tag)] px-8 py-3 font-semibold text-white shadow-md transition hover:scale-105"
                  >
                    {seeAllLabels[locale] || seeAllLabels.fr} ({total.toLocaleString("fr-CH")})
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
