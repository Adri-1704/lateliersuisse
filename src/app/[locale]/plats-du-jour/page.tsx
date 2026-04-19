import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed, MapPin, Clock } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Tagesmenüs — Just-Tag" : locale === "en" ? "Daily specials — Just-Tag" : "Plats du jour — Just-Tag",
    description: locale === "de"
      ? "Entdecken Sie die Tagesmenüs der Restaurants in der Westschweiz"
      : locale === "en"
      ? "Discover today's daily specials from restaurants in Western Switzerland"
      : "Découvrez les plats du jour des restaurants de Suisse Romande. Mis à jour en temps réel.",
    alternates: {
      canonical: `/${locale}/plats-du-jour`,
      languages: { fr: "/fr/plats-du-jour", de: "/de/plats-du-jour", en: "/en/plats-du-jour", pt: "/pt/plats-du-jour", es: "/es/plats-du-jour" },
    },
    openGraph: {
      title: "Plats du jour — Just-Tag",
      description: "Les plats du jour des restaurants de Suisse Romande, mis à jour en temps réel.",
      url: `${baseUrl}/${locale}/plats-du-jour`,
    },
  };
}

interface PlatRow {
  id: string;
  text: string;
  image_url: string | null;
  price: string | null;
  posted_at: string;
  restaurants: {
    name_fr: string;
    slug: string;
    city: string;
    canton: string;
    cuisine_type: string | null;
  };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

export default async function PlatsDuJourPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: plats } = await supabase
    .from("plat_du_jour")
    .select("id, text, image_url, price, posted_at, restaurants(name_fr, slug, city, canton, cuisine_type)")
    .eq("is_active", true)
    .gte("posted_at", today.toISOString())
    .order("posted_at", { ascending: false })
    .limit(50) as { data: PlatRow[] | null };

  const h1 = locale === "de" ? "Tagesmenüs" : locale === "en" ? "Today's specials" : "Plats du jour";
  const subtitle = locale === "de"
    ? "Die Tagesmenüs der Westschweizer Restaurants, live aktualisiert"
    : locale === "en"
    ? "Today's daily specials from Western Swiss restaurants, updated live"
    : "Les plats du jour des restaurants romands, mis à jour en temps réel";

  return (
    <>
      <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm mb-6">
            <UtensilsCrossed className="h-4 w-4" />
            {new Date().toLocaleDateString(locale === "de" ? "de-CH" : locale === "en" ? "en-GB" : "fr-CH", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{h1}</h1>
          <p className="mt-4 text-lg text-white/80">{subtitle}</p>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!plats || plats.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === "en" ? "No daily specials yet today" : "Pas encore de plat du jour aujourd'hui"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {locale === "en"
                  ? "Restaurants publish their daily specials throughout the morning."
                  : "Les restaurants publient leurs plats du jour au fil de la matinée."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plats.map((plat) => (
                <Link
                  key={plat.id}
                  href={`/${locale}/restaurants/${plat.restaurants.slug}`}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1"
                >
                  {plat.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={plat.image_url}
                        alt={plat.text}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {plat.price && (
                        <span className="absolute top-3 right-3 rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-white shadow-md">
                          {plat.price}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                        {plat.restaurants.name_fr}
                      </h3>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {timeAgo(plat.posted_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{plat.text}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{plat.restaurants.city}</span>
                      {plat.restaurants.cuisine_type && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span>{plat.restaurants.cuisine_type}</span>
                        </>
                      )}
                    </div>
                    {!plat.image_url && plat.price && (
                      <span className="mt-3 inline-block rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-white">
                        {plat.price}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
