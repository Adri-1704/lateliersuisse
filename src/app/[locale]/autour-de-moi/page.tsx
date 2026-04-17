import type { Metadata } from "next";
import { NearbyRestaurants } from "./NearbyRestaurants";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Restaurants autour de moi — Just-Tag",
    de: "Restaurants in meiner Nähe — Just-Tag",
    en: "Restaurants near me — Just-Tag",
    pt: "Restaurantes perto de mim — Just-Tag",
    es: "Restaurantes cerca de mí — Just-Tag",
  };

  const descriptions: Record<string, string> = {
    fr: "Trouvez les restaurants, bars et cafés les plus proches de vous en Suisse Romande. Géolocalisation, avis clients, menus et horaires.",
    de: "Finden Sie die nächsten Restaurants, Bars und Cafés in der Westschweiz. Geolokalisierung, Kundenbewertungen, Menüs und Öffnungszeiten.",
    en: "Find the nearest restaurants, bars and cafés in Western Switzerland. Geolocation, customer reviews, menus and opening hours.",
    pt: "Encontre os restaurantes, bares e cafés mais próximos de si na Suíça Romanda. Geolocalização, avaliações, menus e horários.",
    es: "Encuentre los restaurantes, bares y cafés más cercanos en la Suiza Romanda. Geolocalización, reseñas, menús y horarios.",
  };

  return {
    title: titles[locale] || titles.fr,
    description: descriptions[locale] || descriptions.fr,
    alternates: {
      canonical: `/${locale}/autour-de-moi`,
      languages: {
        fr: "/fr/autour-de-moi",
        de: "/de/autour-de-moi",
        en: "/en/autour-de-moi",
        pt: "/pt/autour-de-moi",
        es: "/es/autour-de-moi",
      },
    },
    openGraph: {
      title: titles[locale] || titles.fr,
      description: descriptions[locale] || descriptions.fr,
      url: `${baseUrl}/${locale}/autour-de-moi`,
      type: "website",
    },
  };
}

export default async function NearbyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <NearbyRestaurants locale={locale} />;
}
