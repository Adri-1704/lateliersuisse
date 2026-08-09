import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { collections, type Collection } from "@/data/collections";
import { createAdminClient } from "@/lib/supabase/server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

// Sous-titre SEO ajouté après le mot "Ambiances"/"Vibes"/"Ambiente" (issu de
// nav.ambiances, seule source de vérité — #41 : le <title> disait "Collections
// thématiques" alors que le h1 et le menu disaient "Ambiances", et le h1
// lui-même restait câblé en dur en français pour /en ("Ambiances" au lieu de
// "Vibes") malgré une traduction correcte déjà disponible dans nav.ambiances).
const SEO_SUBTITLES: Record<string, string> = {
  fr: "Terrasses, vue sur le lac, végétarien…",
  de: "Terrassen, Seeblick, vegetarisch…",
  en: "Terraces, lake view, vegetarian…",
  pt: "Terraços, vista lago, vegetariano…",
  es: "Terrazas, vista al lago, vegetariano…",
};

const SUBHEADINGS: Record<string, string> = {
  fr: "Découvrez nos sélections thématiques de restaurants",
  de: "Entdecken Sie unsere kuratierten Restaurantauswahlen",
  en: "Discover our curated restaurant selections",
  pt: "Descubra as nossas seleções de restaurantes",
  es: "Descubra nuestras selecciones de restaurantes",
};

const DESCRIPTIONS: Record<string, string> = {
  fr: "Nos sélections curées de restaurants romands : terrasses d'été, vue sur le lac, accès PMR, en famille, wifi gratuit, végétarien, gastronomique et plus.",
  de: "Unsere kuratierten Auswahlen westschweizer Restaurants: Sommerterrassen, Seeblick, barrierefrei, familienfreundlich, Gratis-WLAN, vegetarisch und mehr.",
  en: "Curated selections of Western Swiss restaurants: summer terraces, lake views, wheelchair accessible, family-friendly, free wifi, vegetarian and more.",
  pt: "Seleções curadas de restaurantes da Suíça Romanda: terraços de verão, vista lago, acessíveis, para famílias, wifi grátis, vegetariano e mais.",
  es: "Selecciones curadas de restaurantes de la Suiza Romanda: terrazas de verano, vistas al lago, accesibles, para familias, wifi gratis, vegetariano y más.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const ambiances = t("ambiances");

  const title = `${ambiances} — ${SEO_SUBTITLES[locale] || SEO_SUBTITLES.fr}`;
  const description = DESCRIPTIONS[locale] || DESCRIPTIONS.fr;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/collections`,
      languages: {
        fr: "/fr/collections",
        de: "/de/collections",
        en: "/en/collections",
        pt: "/pt/collections",
        es: "/es/collections",
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/collections`,
      type: "website",
    },
  };
}

async function getCollectionCount(collection: Collection): Promise<number> {
  const supabase = createAdminClient();
  let query = supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);
  if (collection.filterFeature) {
    query = query.contains("features", [collection.filterFeature]);
  }
  if (collection.filterCuisine) {
    query = query.eq("cuisine_type", collection.filterCuisine);
  }
  const { count } = await query;
  return count ?? 0;
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  // Même mot que le menu (nav.ambiances) — évite l'incohérence "Ambiances"
  // (menu/h1) vs "Vibes"/"Ambiente" ailleurs, et le h1 câblé en dur.
  const ambiances = t("ambiances");

  // Compte le nombre de restaurants par collection, filtre les vides
  const counts = await Promise.all(collections.map(getCollectionCount));
  const visible = collections
    .map((c, i) => ({ collection: c, count: counts[i] }))
    .filter(({ count }) => count > 0);

  const restaurantsLabel = (n: number) => {
    if (locale === "de") return n === 1 ? "1 Restaurant" : `${n} Restaurants`;
    if (locale === "en") return n === 1 ? "1 restaurant" : `${n} restaurants`;
    if (locale === "pt") return n === 1 ? "1 restaurante" : `${n} restaurantes`;
    if (locale === "es") return n === 1 ? "1 restaurante" : `${n} restaurantes`;
    return n === 1 ? "1 restaurant" : `${n} restaurants`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">{ambiances}</h1>
      <p className="mt-2 text-gray-600">
        {SUBHEADINGS[locale] || SUBHEADINGS.fr}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ collection, count }) => {
          const title = locale === "de" ? collection.titleDe : locale === "en" ? collection.titleEn : locale === "pt" ? collection.titlePt : locale === "es" ? collection.titleEs : collection.titleFr;
          const desc = locale === "de" ? collection.descriptionDe : locale === "en" ? collection.descriptionEn : locale === "pt" ? collection.descriptionPt : locale === "es" ? collection.descriptionEs : collection.descriptionFr;
          return (
            <Link
              key={collection.slug}
              href={`/${locale}/collections/${collection.slug}`}
              className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <span className="text-5xl leading-none" aria-hidden="true">{collection.icon}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  {restaurantsLabel(count)}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-600">{desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
