import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, MapPin, Clock } from "lucide-react";
import { getActiveHappyHoursAllCantons } from "@/actions/happy-hours";
import { HappyHoursFilters } from "@/components/happy-hours/HappyHoursFilters";
import { HappyHourShareButton } from "@/components/happy-hours/HappyHourShareButton";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

// Quick Wins SEO : ISR 5 min (pas de force-dynamic)
export const revalidate = 300;
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "de"
      ? "Happy Hours — Just-Tag"
      : locale === "en"
        ? "Happy Hours — Just-Tag"
        : locale === "pt"
          ? "Happy Hours — Just-Tag"
          : locale === "es"
            ? "Happy Hours — Just-Tag"
            : "Happy Hours — Just-Tag";
  const description =
    locale === "de"
      ? "Entdecken Sie die Happy Hours der Restaurants in der Westschweiz. Blitzangebote jetzt und heute Abend."
      : locale === "en"
        ? "Discover Happy Hours at Swiss restaurants. Flash deals now and tonight."
        : "Decouvrez les Happy Hours des restaurants de Suisse Romande. Offres flash maintenant et ce soir.";
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/happy-hours`,
      languages: {
        fr: "/fr/happy-hours",
        de: "/de/happy-hours",
        en: "/en/happy-hours",
        pt: "/pt/happy-hours",
        es: "/es/happy-hours",
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/happy-hours`,
    },
  };
}

const VALID_TIMINGS = new Set(["now", "today", "week"]);

function computeIsNow(starts_at: string, ends_at: string, nowMs: number): boolean {
  return new Date(starts_at).getTime() <= nowMs && new Date(ends_at).getTime() > nowMs;
}

function formatStartLabel(
  starts_at: string,
  ends_at: string,
  locale: string,
  now: number,
): string {
  const start = new Date(starts_at).getTime();
  const end = new Date(ends_at).getTime();
  const zurichFmt = new Intl.DateTimeFormat(
    locale === "de" ? "de-CH" : locale === "en" ? "en-GB" : "fr-CH",
    { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" },
  );
  if (start <= now && end > now) {
    return locale === "de"
      ? "Laufend"
      : locale === "en"
        ? "Ongoing"
        : "En cours";
  }
  const diffH = Math.round((start - now) / (1000 * 60 * 60));
  if (diffH < 6) {
    return locale === "en" ? `In ${diffH}h` : `Dans ${diffH}h`;
  }
  const day = new Date(starts_at).toLocaleDateString(
    locale === "de" ? "de-CH" : locale === "en" ? "en-GB" : "fr-CH",
    { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Zurich" },
  );
  return `${day} ${zurichFmt.format(start)}`;
}

function promoBadge(promo_type: string, promo_value: string | null, locale: string): string {
  if (!promo_value) {
    if (promo_type === "free_item") return locale === "en" ? "Free item" : "Offert";
    if (promo_type === "special_menu") return locale === "en" ? "Special menu" : "Menu special";
    return locale === "en" ? "Offer" : "Offre";
  }
  return promo_value;
}

export default async function HappyHoursPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const canton = typeof sp.canton === "string" ? sp.canton : undefined;
  const city = typeof sp.city === "string" ? sp.city : undefined;
  const cuisine = typeof sp.cuisine === "string" ? sp.cuisine : undefined;
  const timingRaw = typeof sp.timing === "string" ? sp.timing : "today";
  const timing = VALID_TIMINGS.has(timingRaw) ? (timingRaw as "now" | "today" | "week") : "today";

  const happyHours = await getActiveHappyHoursAllCantons({
    canton,
    city,
    cuisine,
    timing,
    limit: 60,
  });

  // Snapshot temporel pour tout le rendu (Server Component : nouveau render = nouveau now)
  // eslint-disable-next-line react-hooks/purity
  const nowSnapshot = Date.now();

  const h1 =
    locale === "de"
      ? "Happy Hours"
      : locale === "en"
        ? "Happy Hours"
        : "Happy Hours";
  const subtitle =
    locale === "de"
      ? "Blitzangebote in den Restaurants der Westschweiz"
      : locale === "en"
        ? "Flash deals at Western Swiss restaurants"
        : "Les offres flash des restaurants de Suisse Romande, en direct";

  const emptyTitle =
    locale === "en"
      ? "No Happy Hour for this selection"
      : "Aucune Happy Hour pour cette selection";
  const emptySubtitle =
    locale === "en"
      ? "Try another filter or come back later."
      : "Essayez un autre filtre ou revenez plus tard.";

  return (
    <>
      <section className="bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4" />
            {new Date().toLocaleDateString(
              locale === "de" ? "de-CH" : locale === "en" ? "en-GB" : "fr-CH",
              { weekday: "long", day: "numeric", month: "long" },
            )}
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{h1}</h1>
          <p className="mt-4 text-lg text-white/90">{subtitle}</p>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HappyHoursFilters locale={locale} currentTiming={timing} currentCanton={canton} />

          {!happyHours || happyHours.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center mt-6">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">{emptyTitle}</h3>
              <p className="mt-2 text-sm text-gray-500">{emptySubtitle}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              {happyHours.map((hh) => {
                const startLabel = formatStartLabel(
                  hh.starts_at,
                  hh.ends_at,
                  locale,
                  nowSnapshot,
                );
                const badge = promoBadge(hh.promo_type, hh.promo_value, locale);
                const isNow = computeIsNow(hh.starts_at, hh.ends_at, nowSnapshot);

                return (
                  <div
                    key={hh.id}
                    className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1 flex flex-col"
                  >
                    <Link
                      href={`/${locale}/restaurants/${hh.restaurant.slug}?utm_source=happy_hours&utm_medium=listing&utm_campaign=hh_${hh.id}`}
                      className="block"
                    >
                      {hh.restaurant.cover_image && (
                        <div className="relative h-44 overflow-hidden">
                          <Image
                            src={hh.restaurant.cover_image}
                            alt={hh.restaurant.name_fr}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <span className="absolute top-3 right-3 rounded-full bg-rose-500 px-3 py-1 text-sm font-bold text-white shadow-md">
                            {badge}
                          </span>
                          <span
                            className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md ${
                              isNow ? "bg-red-600" : "bg-gray-800/80"
                            }`}
                          >
                            {startLabel}
                          </span>
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                            {hh.title}
                          </h3>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {startLabel}
                          </span>
                        </div>
                        {hh.description && (
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                            {hh.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium text-gray-700">
                            {hh.restaurant.name_fr}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span>{hh.restaurant.city}</span>
                        </div>
                      </div>
                    </Link>
                    <div className="px-5 pb-4 flex gap-2">
                      <HappyHourShareButton
                        happyHourId={hh.id}
                        restaurantName={hh.restaurant.name_fr}
                        restaurantSlug={hh.restaurant.slug}
                        title={hh.title}
                        startsAt={hh.starts_at}
                        locale={locale}
                        compact
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
