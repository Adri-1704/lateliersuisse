"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cantons } from "@/data/cantons";
import { MapPin } from "lucide-react";

// SVG paths for each canton (simplified geometric approximation)
// ViewBox: 0 0 800 500 representing Switzerland's shape
const cantonPaths: Record<string, string> = {
  // Northwestern cantons
  "bale-ville":
    "M 230,52 L 243,48 252,55 250,66 238,68 228,62 Z",
  "bale-campagne":
    "M 210,58 L 228,62 238,68 250,66 258,75 252,90 240,95 222,88 208,80 205,68 Z",
  schaffhouse:
    "M 410,18 L 430,12 448,16 455,28 450,40 438,46 420,42 408,34 406,24 Z",
  jura:
    "M 142,72 L 168,60 190,62 210,58 205,68 208,80 215,95 210,112 195,120 175,118 155,108 140,95 138,82 Z",
  // Northern cantons
  soleure:
    "M 222,88 L 240,95 260,92 278,88 290,96 286,112 272,120 250,118 232,112 215,95 210,112 215,105 Z",
  argovie:
    "M 278,88 L 298,80 318,75 338,78 355,85 360,100 352,115 338,122 318,125 298,120 286,112 290,96 Z",
  zurich:
    "M 355,85 L 375,72 395,65 415,68 430,78 435,95 428,112 415,122 395,125 375,120 360,112 352,115 360,100 Z",
  thurgovie:
    "M 430,42 L 450,40 468,45 488,50 505,58 508,72 498,82 480,85 460,80 435,78 430,78 428,65 Z",
  // Central-north cantons
  "appenzell-re":
    "M 498,82 L 508,72 525,75 535,85 530,96 518,100 505,96 498,88 Z",
  "appenzell-ri":
    "M 505,96 L 518,100 528,108 522,118 510,120 502,112 500,102 Z",
  "saint-gall":
    "M 460,80 L 480,85 498,82 498,88 505,96 500,102 502,112 510,120 522,118 528,108 540,115 555,125 558,142 545,155 528,158 510,152 490,145 472,138 458,128 448,115 445,100 450,90 Z",
  // Central cantons
  zoug:
    "M 360,112 L 375,120 385,130 380,142 368,148 355,142 348,130 350,118 Z",
  lucerne:
    "M 298,120 L 318,125 338,122 352,115 350,118 348,130 355,142 350,158 340,170 325,175 308,170 292,162 280,150 275,138 278,125 286,112 Z",
  schwyz:
    "M 385,130 L 395,125 415,122 428,128 435,142 430,158 418,168 400,170 385,165 375,155 370,142 368,148 380,142 Z",
  nidwald:
    "M 340,170 L 350,158 355,142 368,148 370,142 375,155 378,168 370,180 355,185 342,178 Z",
  obwald:
    "M 308,170 L 325,175 340,170 342,178 340,192 330,205 315,210 300,205 290,195 288,180 292,162 Z",
  uri:
    "M 378,168 L 385,165 400,170 418,168 425,180 428,198 420,218 410,235 395,245 380,248 368,240 360,225 355,208 355,192 358,182 370,180 Z",
  glaris:
    "M 430,158 L 445,155 458,158 472,165 478,180 472,195 460,205 445,208 432,200 425,188 425,180 428,168 Z",
  // Western cantons
  neuchatel:
    "M 160,118 L 175,118 195,120 210,125 218,140 212,158 198,168 180,172 162,165 148,152 142,138 148,125 Z",
  fribourg:
    "M 218,140 L 232,132 250,128 265,132 278,142 278,158 272,175 258,190 240,198 222,195 208,185 198,172 198,168 212,158 Z",
  berne:
    "M 210,112 L 215,105 232,112 250,118 265,120 278,125 275,138 280,150 292,162 288,180 290,195 300,205 305,220 298,238 285,252 268,260 250,258 235,248 222,235 215,218 212,200 208,185 222,195 240,198 258,190 272,175 278,158 278,142 265,132 250,128 232,132 218,140 212,158 198,168 198,172 180,172 175,180 168,175 162,165 170,148 178,135 185,125 195,120 Z",
  // Lake Geneva / Southwestern cantons
  vaud:
    "M 100,175 L 118,165 135,162 148,165 162,165 168,175 175,180 180,195 175,215 168,232 155,248 140,258 125,262 108,258 92,248 80,235 75,218 78,200 85,188 Z",
  geneve:
    "M 62,268 L 75,258 88,255 100,260 105,272 100,285 90,295 78,298 65,292 58,280 Z",
  valais:
    "M 155,248 L 168,232 175,215 180,195 192,200 212,200 215,218 222,235 235,248 248,260 260,272 272,280 280,290 275,305 262,318 245,328 225,332 205,330 185,322 168,310 155,295 148,278 145,262 Z",
  // Southern canton
  tessin:
    "M 355,245 L 368,240 380,248 395,255 405,268 410,285 408,305 400,322 388,335 372,345 355,348 338,342 325,330 318,315 315,298 318,280 325,265 338,252 Z",
  // Eastern canton
  grisons:
    "M 445,208 L 460,205 472,195 478,180 490,175 510,175 530,180 548,188 565,200 575,218 580,238 578,260 570,280 558,298 542,310 522,318 500,320 480,315 462,305 448,290 438,272 432,252 430,235 432,218 Z",
};

// Canton abbreviation labels positioned at canton centers
const cantonCenters: Record<string, { x: number; y: number; abbr: string }> = {
  "bale-ville": { x: 240, y: 58, abbr: "BS" },
  "bale-campagne": { x: 232, y: 76, abbr: "BL" },
  schaffhouse: { x: 432, y: 30, abbr: "SH" },
  jura: { x: 175, y: 92, abbr: "JU" },
  soleure: { x: 252, y: 104, abbr: "SO" },
  argovie: { x: 322, y: 100, abbr: "AG" },
  zurich: { x: 395, y: 98, abbr: "ZH" },
  thurgovie: { x: 468, y: 65, abbr: "TG" },
  "appenzell-re": { x: 515, y: 88, abbr: "AR" },
  "appenzell-ri": { x: 512, y: 110, abbr: "AI" },
  "saint-gall": { x: 498, y: 125, abbr: "SG" },
  zoug: { x: 365, y: 132, abbr: "ZG" },
  lucerne: { x: 318, y: 145, abbr: "LU" },
  schwyz: { x: 405, y: 148, abbr: "SZ" },
  nidwald: { x: 358, y: 172, abbr: "NW" },
  obwald: { x: 310, y: 190, abbr: "OW" },
  uri: { x: 392, y: 210, abbr: "UR" },
  glaris: { x: 452, y: 182, abbr: "GL" },
  neuchatel: { x: 182, y: 148, abbr: "NE" },
  fribourg: { x: 242, y: 165, abbr: "FR" },
  berne: { x: 242, y: 215, abbr: "BE" },
  vaud: { x: 125, y: 218, abbr: "VD" },
  geneve: { x: 82, y: 278, abbr: "GE" },
  valais: { x: 218, y: 280, abbr: "VS" },
  tessin: { x: 365, y: 295, abbr: "TI" },
  grisons: { x: 505, y: 250, abbr: "GR" },
};

// Simulated restaurant counts per canton (using mock data + realistic filler)
const cantonRestaurantCounts: Record<string, number> = {
  zurich: 68,
  berne: 52,
  vaud: 47,
  geneve: 43,
  lucerne: 35,
  "saint-gall": 28,
  argovie: 26,
  valais: 38,
  tessin: 32,
  fribourg: 22,
  "bale-ville": 24,
  "bale-campagne": 15,
  soleure: 12,
  grisons: 30,
  thurgovie: 14,
  neuchatel: 18,
  schwyz: 10,
  zoug: 16,
  schaffhouse: 8,
  jura: 6,
  glaris: 5,
  obwald: 4,
  nidwald: 5,
  uri: 3,
  "appenzell-re": 7,
  "appenzell-ri": 3,
};

// Color scale: alpine green gradient based on density
function getCantonColor(count: number): string {
  if (count >= 50) return "#1b5e3b"; // darkest green
  if (count >= 35) return "#2d6a4f"; // alpine green
  if (count >= 20) return "#40916c";
  if (count >= 10) return "#52b788";
  if (count >= 5) return "#74c69d";
  return "#b7e4c7"; // lightest green
}

function getCantonHoverColor(count: number): string {
  if (count >= 50) return "#ff3c48";
  if (count >= 35) return "#ff3c48";
  if (count >= 20) return "#ff4d57";
  if (count >= 10) return "#ff5e66";
  if (count >= 5) return "#ff6f75";
  return "#ff8084";
}

function getTextColor(count: number, isHovered: boolean): string {
  if (isHovered) return "#ffffff";
  if (count >= 20) return "#ffffff";
  if (count >= 10) return "#1a3a2a";
  return "#2d5a3f";
}

// Rendering order: large cantons first (background), small cantons last (foreground)
// This prevents large cantons from visually/click-overlapping smaller neighbors
const renderOrder: string[] = [
  // Largest cantons first (drawn in back)
  "grisons",
  "berne",
  "valais",
  "vaud",
  "tessin",
  "saint-gall",
  // Medium cantons
  "fribourg",
  "lucerne",
  "zurich",
  "argovie",
  "thurgovie",
  "schwyz",
  "uri",
  "glaris",
  "soleure",
  "neuchatel",
  "jura",
  // Smaller cantons (drawn on top)
  "bale-campagne",
  "zoug",
  "nidwald",
  "obwald",
  "schaffhouse",
  "geneve",
  "bale-ville",
  "appenzell-re",
  "appenzell-ri",
];

// Legend items
const legendItems = [
  { label: "50+", color: "#1b5e3b" },
  { label: "35-49", color: "#2d6a4f" },
  { label: "20-34", color: "#40916c" },
  { label: "10-19", color: "#52b788" },
  { label: "5-9", color: "#74c69d" },
  { label: "1-4", color: "#b7e4c7" },
];

export function SwissCantonMap() {
  const t = useTranslations("cantonMap");
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const router = useRouter();

  const [hoveredCanton, setHoveredCanton] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const restaurantCounts = cantonRestaurantCounts;

  const totalRestaurants = Object.values(restaurantCounts).reduce((sum, c) => sum + c, 0);

  const getCantonLabel = (slug: string): string => {
    const canton = (cantons as readonly { value: string; label: string; labelDe: string; labelEn: string; labelPt?: string; labelEs?: string }[]).find((c) => c.value === slug);
    if (!canton) return slug;
    switch (locale) {
      case "de": return canton.labelDe || canton.label;
      case "en": return canton.labelEn || canton.label;
      case "pt": return canton.labelPt || canton.labelEn || canton.label;
      case "es": return canton.labelEs || canton.labelEn || canton.label;
      default: return canton.label;
    }
  };

  const getRestaurantWord = (count: number) => {
    if (locale === "de") return count === 1 ? "Restaurant" : "Restaurants";
    if (locale === "en") return count === 1 ? "restaurant" : "restaurants";
    if (locale === "pt") return count === 1 ? "restaurante" : "restaurantes";
    if (locale === "es") return count === 1 ? "restaurante" : "restaurantes";
    return count === 1 ? "restaurant" : "restaurants";
  };

  const handleCantonClick = (slug: string) => {
    router.push(`/${locale}/restaurants?canton=${slug}`);
  };

  const handleMouseMove = (
    e: React.MouseEvent<SVGElement>,
    slug: string
  ) => {
    const svgRect = (
      e.currentTarget.closest("svg") as SVGSVGElement
    )?.getBoundingClientRect();
    if (svgRect) {
      setTooltipPos({
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top - 16,
      });
    }
    setHoveredCanton(slug);
  };

  return (
    <section className="bg-white py-10 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-alpine-green)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-alpine-green)]">
            <MapPin className="h-4 w-4" />
            26 {locale === "de" ? "Kantone" : locale === "en" ? "cantons" : locale === "pt" ? "cantões" : locale === "es" ? "cantones" : "cantons"}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-gray-500 sm:text-lg">
            {t("subtitle")}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-alpine-green)]">
            {totalRestaurants}+ {locale === "de" ? "Restaurants in der ganzen Schweiz" : locale === "en" ? "restaurants across Switzerland" : locale === "pt" ? "restaurantes em toda a Suíça" : locale === "es" ? "restaurantes en toda Suiza" : "restaurants dans toute la Suisse"}
          </p>
        </div>

        {/* Map container */}
        <div className="relative mx-auto w-full max-w-6xl">
          <svg
            viewBox="-10 -5 820 520"
            xmlns="http://www.w3.org/2000/svg"
            className="h-auto w-full"
            role="img"
            aria-label={t("title")}
          >
            {/* Defs for filters and gradients */}
            <defs>
              {/* Drop shadow for hovered canton */}
              <filter id="canton-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor="var(--color-just-tag)" floodOpacity="0.4" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Subtle drop shadow for all cantons */}
              <filter id="canton-shadow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* Background shape hint */}
            <rect x="-10" y="-5" width="820" height="520" fill="transparent" />

            {/* Canton paths — rendered largest first so small cantons stay on top */}
            {renderOrder.map((slug) => {
              const pathData = cantonPaths[slug];
              if (!pathData) return null;
              const count = restaurantCounts[slug] || 0;
              const isHovered = hoveredCanton === slug;
              return (
                <path
                  key={slug}
                  d={pathData}
                  fill={isHovered ? getCantonHoverColor(count) : getCantonColor(count)}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? "2.5" : "1.5"}
                  strokeLinejoin="round"
                  filter={isHovered ? "url(#canton-glow)" : "url(#canton-shadow)"}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    transform: isHovered ? "scale(1.02)" : "scale(1)",
                    transformOrigin: `${cantonCenters[slug]?.x ?? 400}px ${cantonCenters[slug]?.y ?? 250}px`,
                  }}
                  onClick={() => handleCantonClick(slug)}
                  onMouseEnter={(e) => handleMouseMove(e, slug)}
                  onMouseMove={(e) => handleMouseMove(e, slug)}
                  onMouseLeave={() => setHoveredCanton(null)}
                  role="link"
                  tabIndex={0}
                  aria-label={`${getCantonLabel(slug)} — ${count} ${getRestaurantWord(count)}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCantonClick(slug);
                    }
                  }}
                  onFocus={() => setHoveredCanton(slug)}
                  onBlur={() => setHoveredCanton(null)}
                />
              );
            })}

            {/* Canton abbreviation labels */}
            {Object.entries(cantonCenters).map(([slug, center]) => {
              const count = restaurantCounts[slug] || 0;
              const isHovered = hoveredCanton === slug;
              return (
                <text
                  key={`label-${slug}`}
                  x={center.x}
                  y={center.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isHovered ? "11.5" : "10"}
                  fontWeight="700"
                  fill={getTextColor(count, isHovered)}
                  className="pointer-events-none select-none transition-all duration-200"
                  style={{ textShadow: count >= 20 || isHovered ? "0 1px 2px rgba(0,0,0,0.3)" : "none" }}
                >
                  {center.abbr}
                </text>
              );
            })}

            {/* Enhanced Tooltip */}
            {hoveredCanton && (
              <g
                className="pointer-events-none"
                transform={`translate(${tooltipPos.x}, ${tooltipPos.y})`}
              >
                {/* Tooltip background */}
                <rect
                  x="-80"
                  y="-52"
                  width="160"
                  height="46"
                  rx="8"
                  fill="#1f2937"
                  opacity="0.96"
                />
                {/* Arrow */}
                <polygon
                  points="-6,-6 6,-6 0,2"
                  fill="#1f2937"
                  opacity="0.96"
                />
                {/* Canton name */}
                <text
                  x="0"
                  y="-36"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="700"
                  fill="#ffffff"
                >
                  {getCantonLabel(hoveredCanton)}
                </text>
                {/* Restaurant count with icon */}
                <text
                  x="0"
                  y="-18"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10.5"
                  fontWeight="500"
                  fill="#ff8a90"
                >
                  🍽 {restaurantCounts[hoveredCanton] || 0} {getRestaurantWord(restaurantCounts[hoveredCanton] || 0)}
                </text>
              </g>
            )}

            {/* Legend */}
            <g transform="translate(640, 400)">
              <text x="0" y="-8" fontSize="9" fontWeight="700" fill="#6b7280" letterSpacing="0.5">
                {locale === "de" ? "RESTAURANTS" : locale === "en" ? "RESTAURANTS" : locale === "pt" ? "RESTAURANTES" : locale === "es" ? "RESTAURANTES" : "RESTAURANTS"}
              </text>
              {legendItems.map((item, i) => (
                <g key={item.label} transform={`translate(0, ${i * 16 + 6})`}>
                  <rect x="0" y="0" width="14" height="10" rx="2" fill={item.color} />
                  <text x="20" y="5" fontSize="9" fontWeight="500" fill="#6b7280" dominantBaseline="central">
                    {item.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Canton grid for mobile / supplementary navigation */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden">
          {cantons.map((canton) => {
            const count = restaurantCounts[canton.value] || 0;
            return (
              <button
                key={canton.value}
                onClick={() => handleCantonClick(canton.value)}
                className="group relative overflow-hidden rounded-lg border border-gray-200 px-2 py-2.5 text-center text-xs font-medium text-gray-700 transition-all hover:border-[var(--color-alpine-green)] hover:bg-[var(--color-alpine-green)]/5 hover:text-[var(--color-alpine-green)]"
              >
                <span className="relative z-10">{getCantonLabel(canton.value)}</span>
                <span className="mt-0.5 block text-[10px] font-normal text-gray-400 group-hover:text-[var(--color-alpine-green)]/70">
                  {count} {getRestaurantWord(count)}
                </span>
                {/* Density bar at bottom */}
                <span
                  className="absolute bottom-0 left-0 h-0.5 transition-all group-hover:h-1"
                  style={{
                    width: `${Math.min(100, (count / 68) * 100)}%`,
                    backgroundColor: getCantonColor(count),
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
