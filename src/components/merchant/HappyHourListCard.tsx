import Link from "next/link";
import { Eye, MousePointerClick, Sparkles } from "lucide-react";
import type { HappyHour } from "@/lib/supabase/types";

const PROMO_LABELS: Record<string, string> = {
  percentage: "Pourcentage",
  fixed_amount: "Montant fixe",
  free_item: "Article offert",
  special_menu: "Menu special",
};

function formatRange(starts: string, ends: string): string {
  const tz = "Europe/Zurich";
  const loc = "fr-CH";
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
  return `${dayFmt.format(new Date(starts))} — ${hourFmt.format(new Date(starts))} - ${hourFmt.format(new Date(ends))}`;
}

export function HappyHourListCard({
  hh,
  basePath,
  dimmed = false,
}: {
  hh: HappyHour;
  locale: string;
  basePath: string;
  dimmed?: boolean;
}) {
  return (
    <Link
      href={`${basePath}/${hh.id}`}
      className={`block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        dimmed ? "opacity-60" : ""
      } ${hh.is_active ? "" : "border-dashed"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900">{hh.title}</h3>
            {hh.promo_value && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                {hh.promo_value}
              </span>
            )}
            {!hh.is_active && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Desactivee
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{formatRange(hh.starts_at, hh.ends_at)}</p>
          <p className="mt-1 text-xs text-gray-400">
            {PROMO_LABELS[hh.promo_type] || hh.promo_type}
            {hh.places_total ? ` · ${hh.places_total} places max` : ""}
          </p>
        </div>
        <Sparkles className="h-5 w-5 shrink-0 text-rose-400" />
      </div>
      <div className="mt-3 flex items-center gap-4 border-t pt-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {hh.views_count} vues
        </span>
        <span className="inline-flex items-center gap-1">
          <MousePointerClick className="h-3.5 w-3.5" />
          {hh.clicks_count} clics
        </span>
      </div>
    </Link>
  );
}
