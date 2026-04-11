"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cantons } from "@/data/cantons";
import { MapPin } from "lucide-react";

// SVG paths for each canton — generated from swisstopo geodata (swissBOUNDARIES3D)
// ViewBox: -10 -10 820 500 representing Switzerland's shape
const cantonPaths: Record<string, string> = {
  "appenzell-re": "M626,111L627,98L631,96L629,93L632,91L638,95L632,97L635,99L640,95L636,89L648,88L631,82L630,86L614,90L612,97L578,99L574,107L571,108L578,115L574,118L576,124L573,128L594,135L597,135L591,117L601,109L599,103L626,111Z",
  "appenzell-ri": "M626,111L599,103L601,109L592,117L592,124L597,135L608,138L622,127L626,111Z M627,100L634,100L632,97L638,95L632,91L627,100Z M646,89L635,91L640,96L646,89Z",
  argovie: "M332,138L349,138L354,134L352,129L360,127L363,136L376,132L382,137L391,134L388,138L393,141L406,126L413,130L424,160L433,161L430,141L433,135L429,125L436,122L441,114L433,116L430,100L424,98L430,93L427,91L429,87L424,74L436,58L419,57L412,48L400,49L397,45L380,54L376,60L353,60L351,64L345,62L341,53L329,53L324,61L310,65L323,70L323,76L331,71L331,66L335,66L344,78L351,78L350,84L356,84L358,93L354,93L365,100L361,114L351,118L351,115L344,113L341,120L336,121L330,131L332,138Z",
  "bale-campagne": "M274,74L279,77L278,84L260,84L258,87L264,90L263,95L250,95L257,103L261,103L264,98L276,101L277,96L287,95L285,90L293,91L295,83L291,82L291,77L302,75L309,82L304,94L296,96L298,106L313,106L323,113L326,108L339,102L340,97L345,99L354,93L351,88L353,84L350,84L351,78L344,78L334,66L323,76L323,70L303,66L296,60L288,70L282,59L272,65L278,68L272,69L274,74Z M242,89L247,95L252,91L242,89Z",
  "bale-ville": "M282,59L282,64L288,64L289,70L294,65L293,60L305,59L303,53L307,50L293,56L288,53L282,59Z",
  berne: "M191,200L223,193L226,199L219,204L222,212L217,219L247,222L246,230L237,231L243,236L235,250L237,262L251,270L251,278L247,282L241,278L241,293L226,303L228,310L224,319L225,327L218,331L221,336L218,345L225,349L225,357L239,346L240,353L262,343L279,345L282,342L278,337L289,337L295,329L310,336L333,321L355,312L354,306L363,300L392,311L406,308L425,296L426,283L433,279L431,269L441,268L439,250L430,252L426,246L411,254L394,250L386,254L376,246L356,249L339,234L335,226L340,219L337,216L348,207L353,194L343,193L337,183L340,174L337,166L341,161L330,131L313,132L305,124L286,128L289,136L303,148L303,154L298,159L277,156L274,165L266,169L268,174L264,177L261,171L252,172L250,165L262,165L259,162L272,154L264,149L252,156L244,142L278,124L283,117L272,122L251,119L233,126L213,124L214,129L209,132L212,135L195,136L181,153L176,150L164,159L160,154L165,163L161,174L190,164L189,170L200,174L200,181L190,188L191,200Z M283,117L285,116L282,112L277,117L283,117Z M205,218L208,214L204,215L205,218Z",
  fribourg: "M166,213L178,227L177,224L181,223L183,235L178,236L177,246L168,253L174,257L160,272L161,277L149,280L148,297L167,299L160,308L152,307L151,309L156,316L166,311L166,314L176,315L183,330L195,319L206,316L210,309L218,304L221,308L234,295L239,296L241,278L247,282L251,278L251,270L237,262L235,250L243,236L237,231L246,230L247,222L217,219L222,212L219,204L226,199L223,193L191,200L195,202L194,210L203,219L196,222L197,226L192,232L190,225L183,224L186,222L182,214L172,206L166,213Z M145,230L139,236L147,243L145,246L153,250L159,246L169,248L172,242L167,242L172,230L165,228L170,226L161,217L145,230Z M152,259L160,261L163,255L157,249L147,260L152,259Z M144,255L140,260L142,263L146,259L144,255Z",
  geneve: "M30,360L26,367L30,375L27,378L19,377L3,385L1,389L7,392L0,405L7,401L14,404L17,400L32,402L63,377L60,372L54,375L50,369L51,363L47,361L43,367L30,360Z M50,353L38,350L49,356L50,353Z",
  glaris: "M515,240L524,244L538,240L548,225L557,231L581,215L579,189L561,186L570,178L570,165L549,164L538,153L535,156L529,172L533,174L528,183L518,189L532,205L530,213L525,214L529,224L514,233L515,240Z",
  grisons: "M581,215L557,231L548,225L538,240L524,244L516,240L508,244L504,258L498,260L496,256L492,264L480,269L480,276L475,283L480,287L480,297L502,300L520,295L520,288L529,284L530,291L543,291L541,313L545,320L552,321L555,337L546,366L552,384L564,395L569,395L576,381L581,380L581,372L590,357L586,347L586,336L581,332L586,325L587,316L601,313L609,323L619,313L616,319L619,323L618,345L624,348L633,362L646,367L656,363L663,365L667,351L674,355L697,344L700,348L706,345L713,351L710,358L713,361L712,367L723,372L721,381L726,384L736,382L744,374L732,356L736,345L742,343L742,336L736,332L727,335L720,328L723,324L721,306L731,296L731,289L751,287L755,283L759,289L757,297L764,299L765,303L787,303L793,308L799,297L800,288L792,281L784,283L780,271L787,265L784,259L791,254L788,246L794,239L799,210L788,205L788,201L782,195L774,197L767,208L769,213L756,212L754,227L732,233L722,228L716,219L691,211L690,204L694,197L692,190L684,192L657,180L621,182L633,201L628,202L616,226L581,215Z",
  jura: "M160,155L162,153L164,159L176,150L181,153L195,136L212,135L209,132L214,129L213,124L233,126L251,119L272,122L283,117L277,117L282,112L277,105L257,103L257,100L242,89L228,94L225,89L214,88L220,76L207,73L197,77L187,74L181,76L185,85L174,90L173,97L169,97L163,110L187,105L195,112L186,117L186,122L174,126L176,136L156,154L160,155Z",
  lucerne: "M332,138L341,162L337,166L340,174L337,183L343,193L353,194L346,211L338,213L340,219L335,226L339,234L356,249L370,245L372,241L368,234L373,220L377,216L380,221L390,210L387,205L401,202L401,197L419,198L425,190L429,195L436,195L436,191L444,196L451,192L438,180L429,180L435,170L447,171L448,168L424,160L411,127L401,129L397,140L393,141L388,138L391,134L382,137L376,132L363,136L360,127L352,129L354,134L349,138L332,138Z",
  neuchatel: "M89,231L118,222L135,210L137,227L145,230L172,206L185,198L191,200L190,188L200,181L200,174L189,170L190,164L161,174L165,163L159,155L132,175L130,179L135,183L120,195L95,201L84,212L90,221L89,231Z",
  nidwald: "M444,230L445,223L441,219L456,212L461,197L448,201L443,199L443,193L436,191L436,195L429,195L425,190L419,198L407,195L399,200L415,201L415,206L411,211L421,215L417,238L430,250L436,249L426,239L425,227L428,226L427,232L433,226L435,231L444,230Z",
  obwald: "M401,201L388,205L390,210L380,221L377,216L373,220L368,234L372,241L369,246L376,246L386,254L394,250L411,254L426,246L417,238L421,215L411,211L415,206L415,201L401,201Z M440,252L447,250L442,243L450,232L435,231L433,226L427,232L426,225L426,239L436,249L430,252L440,252Z",
  "saint-gall": "M527,104L534,118L525,125L527,130L513,136L502,135L503,142L531,143L530,152L536,152L549,164L570,165L570,178L561,186L579,189L581,215L616,226L628,202L633,201L620,180L628,171L623,148L643,111L656,101L650,90L653,86L642,83L636,75L635,64L626,62L607,80L601,78L603,74L596,74L600,70L597,67L584,72L593,72L593,77L589,80L574,79L567,73L558,79L539,77L538,81L548,87L535,91L535,96L527,104Z",
  schaffhouse: "M489,28L490,22L486,19L491,15L489,11L482,12L476,2L472,12L470,2L461,0L462,6L446,9L440,16L441,21L432,27L435,30L433,34L443,36L444,41L454,39L453,36L458,34L467,34L471,28L477,30L480,27L478,23L484,23L489,28Z M515,37L510,31L514,25L505,23L503,17L496,22L503,28L501,32L515,37Z M460,50L455,55L459,62L466,49L460,50Z",
  schwyz: "M461,197L467,198L467,207L483,208L485,215L496,209L506,210L511,223L530,213L532,205L518,189L528,183L533,174L529,173L532,170L531,162L538,153L530,152L531,143L509,145L500,141L483,148L480,152L484,159L474,172L460,175L440,167L429,178L438,180L451,190L443,199L461,197Z",
  soleure: "M283,117L278,124L244,142L252,156L264,149L272,154L259,162L262,165L250,165L252,172L261,171L264,177L268,174L266,169L274,165L277,156L298,159L303,154L303,148L289,136L286,128L305,124L313,132L328,132L344,113L351,115L351,118L361,114L366,102L354,93L358,92L355,83L351,88L353,95L340,97L339,102L326,108L324,113L317,112L313,106L298,106L296,96L304,94L309,82L299,75L291,77L291,82L295,83L293,91L285,90L287,95L277,96L273,102L262,98L261,104L277,105L285,116L283,117Z M263,84L264,87L278,84L279,77L274,74L268,79L261,75L258,79L265,81L263,84Z M250,95L262,95L265,92L258,87L250,95Z",
  tessin: "M565,395L552,384L546,366L555,337L552,321L545,320L541,313L543,291L530,291L529,284L520,288L521,294L509,300L483,296L472,300L456,295L451,301L452,306L446,308L439,317L430,317L428,327L439,324L443,329L443,356L436,364L441,372L439,376L454,383L462,396L467,399L465,402L468,407L486,413L491,407L495,412L503,412L511,418L499,439L518,446L518,453L527,468L521,477L529,474L542,479L546,467L552,461L540,453L539,446L535,443L542,438L538,429L540,424L551,420L553,415L550,408L565,395Z",
  thurgovie: "M479,30L485,40L492,41L500,35L506,39L502,50L492,45L491,48L511,59L506,61L509,67L519,69L519,78L516,80L520,89L525,90L521,91L520,98L527,104L535,96L535,91L548,87L538,81L539,77L558,79L567,73L574,79L589,80L593,77L593,72L584,72L597,67L600,70L596,74L603,74L601,78L607,80L626,62L606,45L582,36L568,37L541,29L518,39L493,28L479,30Z",
  uri: "M444,230L450,232L442,243L447,250L438,255L440,270L431,271L435,280L433,297L436,305L445,309L452,306L451,301L456,295L472,300L480,296L480,288L475,283L480,276L479,269L492,264L495,257L498,260L504,258L508,251L506,245L515,240L514,233L529,224L525,214L511,223L510,216L503,209L485,215L483,208L467,207L467,198L463,197L456,212L441,219L445,223L444,230Z",
  valais: "M433,279L426,283L422,299L406,308L392,311L363,300L354,306L355,312L333,321L310,336L295,329L289,337L278,337L282,342L277,346L262,343L240,353L239,346L218,363L217,371L204,384L190,391L173,364L172,356L166,354L164,345L153,333L150,345L144,351L160,369L150,387L151,392L147,399L152,405L167,406L162,424L165,426L173,421L186,437L188,441L186,444L191,447L192,455L202,470L211,465L219,470L222,463L229,463L236,455L252,461L272,445L280,446L281,439L288,443L301,442L311,454L316,450L325,456L337,456L339,442L344,437L359,437L363,433L367,425L364,419L367,412L380,409L388,400L390,392L376,372L385,363L398,362L407,348L416,345L416,340L411,338L414,334L428,327L430,317L439,317L445,309L436,305L433,297L435,285L433,279Z",
  vaud: "M153,333L164,345L166,354L172,356L173,364L191,391L203,385L217,371L218,363L225,349L218,345L221,336L218,331L225,327L224,319L227,315L228,306L226,302L221,308L218,304L182,330L176,315L166,314L166,311L160,317L156,316L152,307L160,308L167,299L148,297L149,280L161,277L160,272L173,259L173,255L168,253L177,246L178,236L182,237L180,229L182,225L177,223L178,227L166,213L161,217L170,226L165,228L172,230L167,242L172,242L169,248L159,246L153,250L145,246L147,243L139,236L145,230L137,227L135,210L118,222L89,231L84,240L89,246L85,252L58,270L30,294L27,297L36,305L21,324L23,329L19,336L36,345L38,348L30,360L43,367L49,356L39,349L50,353L67,339L83,336L99,326L128,327L153,333Z M172,206L182,214L186,222L184,225L190,225L191,232L201,218L194,210L193,200L185,198L172,206Z",
  zoug: "M433,161L434,165L445,165L447,171L461,175L474,172L484,159L471,153L463,142L444,145L435,141L433,135L430,141L433,161Z",
  zurich: "M527,104L520,98L521,91L525,90L520,89L516,80L519,78L519,69L509,67L506,61L511,59L491,48L492,45L502,50L506,40L502,35L492,41L485,40L479,30L471,28L467,34L471,38L466,40L467,47L459,62L455,55L462,47L452,42L441,50L448,55L434,59L434,63L424,74L429,87L427,91L430,93L424,98L430,100L433,116L441,114L436,122L429,125L434,140L444,145L463,142L471,153L478,156L483,156L481,151L485,146L503,142L502,135L526,132L528,127L525,125L534,118L527,104Z",
};

// Canton abbreviation labels positioned at canton centers
const cantonCenters: Record<string, { x: number; y: number; abbr: string }> = {
  "appenzell-re": { x: 607, y: 103, abbr: "AR" },
  "appenzell-ri": { x: 610, y: 120, abbr: "AI" },
  argovie: { x: 390, y: 100, abbr: "AG" },
  "bale-campagne": { x: 300, y: 90, abbr: "BL" },
  "bale-ville": { x: 293, y: 57, abbr: "BS" },
  berne: { x: 280, y: 230, abbr: "BE" },
  fribourg: { x: 200, y: 265, abbr: "FR" },
  geneve: { x: 32, y: 383, abbr: "GE" },
  glaris: { x: 548, y: 200, abbr: "GL" },
  grisons: { x: 680, y: 280, abbr: "GR" },
  jura: { x: 210, y: 108, abbr: "JU" },
  lucerne: { x: 385, y: 185, abbr: "LU" },
  neuchatel: { x: 148, y: 192, abbr: "NE" },
  nidwald: { x: 430, y: 215, abbr: "NW" },
  obwald: { x: 395, y: 238, abbr: "OW" },
  "saint-gall": { x: 575, y: 130, abbr: "SG" },
  schaffhouse: { x: 470, y: 22, abbr: "SH" },
  schwyz: { x: 490, y: 178, abbr: "SZ" },
  soleure: { x: 305, y: 120, abbr: "SO" },
  tessin: { x: 495, y: 390, abbr: "TI" },
  thurgovie: { x: 548, y: 60, abbr: "TG" },
  uri: { x: 475, y: 248, abbr: "UR" },
  valais: { x: 300, y: 400, abbr: "VS" },
  vaud: { x: 120, y: 300, abbr: "VD" },
  zoug: { x: 455, y: 158, abbr: "ZG" },
  zurich: { x: 478, y: 90, abbr: "ZH" },
};

// Cantons romands (Suisse Romande)
const romandCantons = new Set(["geneve", "vaud", "fribourg", "neuchatel", "valais", "jura", "berne"]);

// Default empty counts (will be populated from DB via props)
const defaultCounts: Record<string, number> = {};

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

interface SwissCantonMapProps {
  restaurantCounts?: Record<string, number>;
}

export function SwissCantonMap({ restaurantCounts: propCounts }: SwissCantonMapProps = {}) {
  const t = useTranslations("cantonMap");
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const router = useRouter();

  const [hoveredCanton, setHoveredCanton] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const restaurantCounts = propCounts || defaultCounts;

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
    const container = (
      e.currentTarget.closest("svg") as SVGSVGElement
    )?.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 16,
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
            7 {locale === "de" ? "Kantone" : locale === "en" ? "cantons" : locale === "pt" ? "cantões" : locale === "es" ? "cantones" : "cantons"}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-gray-500 sm:text-lg">
            {t("subtitle")}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-alpine-green)]">
            {totalRestaurants}+ {locale === "de" ? "Restaurants in der Westschweiz" : locale === "en" ? "restaurants in Western Switzerland" : locale === "pt" ? "restaurantes na Suíça Romanda" : locale === "es" ? "restaurantes en la Suiza Romanda" : "restaurants en Suisse Romande"}
          </p>
        </div>

        {/* Map container - zoomed on Suisse Romande */}
        <div className="relative mx-auto w-full max-w-4xl">
          <svg
            viewBox="-30 50 500 440"
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
            <rect x="-10" y="-10" width="820" height="500" fill="transparent" />

            {/* Canton paths — rendered largest first so small cantons stay on top */}
            {renderOrder.map((slug) => {
              const pathData = cantonPaths[slug];
              if (!pathData) return null;
              const isRomand = romandCantons.has(slug);
              const count = restaurantCounts[slug] || 0;
              const isHovered = hoveredCanton === slug && isRomand;

              if (!isRomand) {
                return (
                  <path
                    key={slug}
                    d={pathData}
                    fill="#f3f4f6"
                    stroke="#e5e7eb"
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                    className="opacity-40"
                  />
                );
              }

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

            {/* Canton abbreviation labels — only Romand cantons */}
            {Object.entries(cantonCenters).map(([slug, center]) => {
              const isRomand = romandCantons.has(slug);
              if (!isRomand) return null;
              const count = restaurantCounts[slug] || 0;
              const isHovered = hoveredCanton === slug;
              return (
                <text
                  key={`label-${slug}`}
                  x={center.x}
                  y={center.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isHovered ? "13" : "11"}
                  fontWeight="700"
                  fill={getTextColor(count, isHovered)}
                  className="pointer-events-none select-none transition-all duration-200"
                  style={{ textShadow: count >= 20 || isHovered ? "0 1px 2px rgba(0,0,0,0.3)" : "none" }}
                >
                  {center.abbr}
                </text>
              );
            })}

          </svg>

          {/* Legend — below the map */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wide">Restaurants</span>
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
            ))}
          </div>

          {/* HTML Tooltip */}
          {hoveredCanton && (
            <div
              className="pointer-events-none absolute z-50"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="rounded-lg bg-gray-800/95 px-4 py-2 text-center shadow-lg">
                <p className="text-sm font-bold text-white">{getCantonLabel(hoveredCanton)}</p>
                <p className="text-xs font-medium text-red-300">
                  🍽 {restaurantCounts[hoveredCanton] || 0} {getRestaurantWord(restaurantCounts[hoveredCanton] || 0)}
                </p>
              </div>
              <div className="mx-auto h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-800/95" />
            </div>
          )}
        </div>

        {/* Canton grid — navigation rapide */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
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
