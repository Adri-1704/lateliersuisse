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
