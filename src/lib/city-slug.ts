/**
 * Normalise un nom de ville en slug URL-safe.
 * "La Chaux-de-Fonds" → "la-chaux-de-fonds"
 * "Neuchâtel" → "neuchatel"
 * "Genève" → "geneve"
 */
export function slugifyCity(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Liste blanche des cantons valides (évite les données corrompues de la DB).
 */
export const VALID_CANTONS = [
  "geneve",
  "vaud",
  "fribourg",
  "neuchatel",
  "valais",
  "jura",
  "berne",
] as const;

/**
 * La colonne `canton` en base stocke des codes à 2 lettres ("GE", "VD"...),
 * pas les slugs utilisés dans les URLs/filtres ("geneve", "vaud"...).
 * Toute requête Supabase filtrant sur `canton` à partir d'un slug doit
 * passer par cette table de correspondance.
 */
const CANTON_SLUG_TO_CODE: Record<string, string> = {
  geneve: "GE",
  vaud: "VD",
  fribourg: "FR",
  neuchatel: "NE",
  valais: "VS",
  jura: "JU",
  berne: "BE",
};

export function cantonSlugToCode(slug: string): string | null {
  return CANTON_SLUG_TO_CODE[slug] ?? null;
}

const CANTON_CODE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CANTON_SLUG_TO_CODE).map(([slug, code]) => [code, slug])
);

export function cantonCodeToSlug(code: string): string | null {
  return CANTON_CODE_TO_SLUG[code] ?? null;
}

export const VALID_CANTON_CODES = Object.values(CANTON_SLUG_TO_CODE);
