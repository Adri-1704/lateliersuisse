import Link from "next/link";
import Image from "next/image";
import { Sparkles, MapPin, ArrowRight, Clock } from "lucide-react";
import { getActiveHappyHoursAllCantons } from "@/actions/happy-hours";

function formatHour(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(
      locale === "de" ? "de-CH" : locale === "en" ? "en-GB" : "fr-CH",
      { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" },
    ).format(new Date(iso));
  } catch {
    return "";
  }
}

function computeIsNow(starts_at: string, ends_at: string, nowMs: number): boolean {
  return new Date(starts_at).getTime() <= nowMs && new Date(ends_at).getTime() > nowMs;
}

export async function HappyHoursSection({ locale }: { locale: string }) {
  // Recupere HH actives en cours ou dans les 12 prochaines heures
  const happyHours = await getActiveHappyHoursAllCantons({ timing: "today", limit: 6 });

  // Si aucune HH active, on masque la section (evite l'effet "vide")
  if (!happyHours || happyHours.length === 0) return null;

  // Snapshot temporel pris une fois pour tout le rendu (Server Component)
  // eslint-disable-next-line react-hooks/purity
  const nowSnapshot = Date.now();

  const title =
    locale === "de"
      ? "Happy Hours"
      : locale === "en"
        ? "Happy Hours"
        : "Happy Hours en cours";
  const subtitle =
    locale === "de"
      ? "Blitzangebote jetzt in der Westschweiz"
      : locale === "en"
        ? "Flash deals right now across Western Switzerland"
        : "Les offres flash des restaurants romands, en direct";
  const cta =
    locale === "de"
      ? "Alle Happy Hours"
      : locale === "en"
        ? "All Happy Hours"
        : "Voir toutes les Happy Hours";

  return (
    <section className="bg-gradient-to-b from-rose-50 to-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700 mb-3">
              <Sparkles className="h-4 w-4" />
              {happyHours.length}{" "}
              {locale === "en" ? "active" : locale === "de" ? "aktiv" : "actives"}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
            <p className="mt-1 text-gray-500">{subtitle}</p>
          </div>
          <Link
            href={`/${locale}/happy-hours`}
            className="hidden sm:flex items-center gap-1 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {happyHours.slice(0, 6).map((hh) => {
            const isNow = computeIsNow(hh.starts_at, hh.ends_at, nowSnapshot);
            return (
              <Link
                key={hh.id}
                href={`/${locale}/restaurants/${hh.restaurant.slug}?utm_source=homepage&utm_medium=happy_hours_section`}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1"
              >
                {hh.restaurant.cover_image && (
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={hh.restaurant.cover_image}
                      alt={hh.restaurant.name_fr}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {hh.promo_value && (
                      <span className="absolute top-3 right-3 rounded-full bg-rose-500 px-3 py-1 text-sm font-bold text-white shadow-md">
                        {hh.promo_value}
                      </span>
                    )}
                    <span
                      className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md ${
                        isNow ? "bg-red-600" : "bg-gray-800/80"
                      }`}
                    >
                      {isNow
                        ? locale === "en"
                          ? "Ongoing"
                          : locale === "de"
                            ? "Laufend"
                            : "En cours"
                        : formatHour(hh.starts_at, locale)}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors text-sm">
                      {hh.title}
                    </h3>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatHour(hh.starts_at, locale)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{hh.restaurant.name_fr}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{hh.restaurant.city}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href={`/${locale}/happy-hours`}
            className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
