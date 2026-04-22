"use client";

import { useEffect, useState } from "react";
import { Sparkles, Phone } from "lucide-react";
import { HappyHourShareButton } from "@/components/happy-hours/HappyHourShareButton";
import { trackHappyHourClick } from "@/actions/happy-hours";

interface Props {
  id: string;
  title: string;
  description: string | null;
  promoType: string;
  promoValue: string | null;
  startsAt: string;
  endsAt: string;
  restaurantSlug: string;
  restaurantName: string;
  restaurantPhone: string | null;
  locale: string;
}

function formatRange(starts: string, ends: string, locale: string): string {
  const tz = "Europe/Zurich";
  const loc = locale === "de" ? "de-CH" : locale === "en" ? "en-GB" : "fr-CH";
  try {
    const sameDay =
      new Date(starts).toLocaleDateString(loc, { timeZone: tz }) ===
      new Date(ends).toLocaleDateString(loc, { timeZone: tz });
    const hourFmt = new Intl.DateTimeFormat(loc, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
    });
    const dayFmt = new Intl.DateTimeFormat(loc, {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: tz,
    });
    if (sameDay) {
      return `${dayFmt.format(new Date(starts))} — ${hourFmt.format(new Date(starts))} - ${hourFmt.format(new Date(ends))}`;
    }
    return `${dayFmt.format(new Date(starts))} ${hourFmt.format(new Date(starts))} → ${dayFmt.format(new Date(ends))} ${hourFmt.format(new Date(ends))}`;
  } catch {
    return "";
  }
}

export function HappyHourBanner({
  id,
  title,
  description,
  promoValue,
  startsAt,
  endsAt,
  restaurantSlug,
  restaurantName,
  restaurantPhone,
  locale,
}: Props) {
  // Snapshot temporel initial calcule une seule fois cote client
  // (lazy init evite les warnings react-hooks/set-state-in-effect).
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(tick);
  }, []);
  const startTs = new Date(startsAt).getTime();
  const endTs = new Date(endsAt).getTime();
  const isNow = startTs <= now && endTs > now;

  const onGoingLabel =
    locale === "en" ? "Ongoing" : locale === "de" ? "Laufend" : "En cours";
  const upcomingLabel =
    locale === "en" ? "Coming up" : locale === "de" ? "Bald" : "Bientot";
  const bookLabel =
    locale === "en" ? "Book by phone" : locale === "de" ? "Telefonisch buchen" : "Reserver";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
      <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
                  isNow ? "bg-red-600" : "bg-gray-800"
                }`}
              >
                {isNow ? onGoingLabel : upcomingLabel}
              </span>
              {promoValue && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  {promoValue}
                </span>
              )}
              <span className="text-xs text-gray-600">{formatRange(startsAt, endsAt, locale)}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-700">{description}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {restaurantPhone && (
                <a
                  href={`tel:${restaurantPhone}`}
                  onClick={() => {
                    trackHappyHourClick(id).catch(() => {});
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  <Phone className="h-4 w-4" />
                  {bookLabel}
                </a>
              )}
              <HappyHourShareButton
                happyHourId={id}
                restaurantName={restaurantName}
                restaurantSlug={restaurantSlug}
                title={title}
                startsAt={startsAt}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
