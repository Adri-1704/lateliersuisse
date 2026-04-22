"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cantons } from "@/data/cantons";

interface Props {
  locale: string;
  currentTiming: "now" | "today" | "week";
  currentCanton?: string;
}

export function HappyHoursFilters({ locale, currentTiming, currentCanton }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const timingLabels = {
    now: locale === "en" ? "Now" : locale === "de" ? "Jetzt" : "Maintenant",
    today: locale === "en" ? "Tonight" : locale === "de" ? "Heute" : "Ce soir",
    week: locale === "en" ? "This week" : locale === "de" ? "Diese Woche" : "Cette semaine",
  } as const;

  const cantonLabel =
    locale === "en" ? "Canton" : locale === "de" ? "Kanton" : "Canton";
  const allCantonsLabel =
    locale === "en" ? "All cantons" : locale === "de" ? "Alle Kantone" : "Tous les cantons";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 overflow-x-auto">
        {(["now", "today", "week"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setParam("timing", k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              currentTiming === k
                ? "bg-rose-500 text-white shadow"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {timingLabels[k]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">{cantonLabel}:</label>
        <select
          value={currentCanton || ""}
          onChange={(e) => setParam("canton", e.target.value || null)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="">{allCantonsLabel}</option>
          {cantons.map((c) => (
            <option key={c.value} value={c.value}>
              {locale === "de"
                ? c.labelDe
                : locale === "en"
                  ? c.labelEn
                  : locale === "pt"
                    ? c.labelPt
                    : locale === "es"
                      ? c.labelEs
                      : c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
