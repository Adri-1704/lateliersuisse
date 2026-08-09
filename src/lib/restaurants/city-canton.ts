import { cache } from "react";
import { slugifyCity, cantonCodeToSlug, VALID_CANTON_CODES } from "@/lib/city-slug";
import { createAdminClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/paginate";

/**
 * Normalisation ville/canton — source unique de vérité.
 *
 * La colonne `restaurants.city` contient parfois des valeurs invalides
 * (codes postaux non nettoyés) ou des variantes orthographiques d'une même
 * commune ("Bern" / "Berne", "Bienne" / "Biel/Bienne"). La colonne
 * `restaurants.canton` est elle-même parfois incohérente avec la commune
 * réelle (ex. "Nyon" étiqueté GE au lieu de VD, ou des communes étrangères
 * comme "Chamonix-Mont-Blanc" injectées avec un canton suisse valide).
 *
 * Ce module centralise les règles de correction connues (issues #34 / #40)
 * afin que TOUTE page qui regroupe des restaurants par ville ou par canton
 * (pages canton, pages ville, sitemap, compteurs d'accueil) applique
 * exactement la même logique — garantissant que les liens générés pointent
 * bien vers des pages qui existent, et que les compteurs affichés soient
 * cohérents d'une page à l'autre.
 */

/** true si la chaîne ressemble à un code postal suisse (4 chiffres) plutôt qu'à un nom de ville. */
export function isPostalCodeLike(value: string): boolean {
  return /^\d{4,5}$/.test(value.trim());
}

/**
 * Villes non-suisses ou hors périmètre à exclure de tout regroupement
 * ville/canton : communes étrangères injectées par erreur dans le jeu de
 * données, ou communes suisses appartenant à un canton non couvert par le
 * site (seuls GE, VD, FR, NE, VS, JU, BE sont couverts — voir data/cantons.ts).
 */
export const EXCLUDED_CITY_SLUGS = new Set<string>([
  "chamonix-mont-blanc", // Haute-Savoie, France
  "premosello-chiovenda", // Piémont, Italie
  "luzern", // canton de Lucerne (LU), non couvert
  "solothurn", // canton de Soleure (SO), non couvert
]);

/**
 * Alias de villes désignant la même commune, fusionnés sous un nom/slug
 * canonique unique pour éviter le contenu dupliqué (pages concurrentes
 * /ville/bern et /ville/berne pour la même commune, par exemple).
 */
const CITY_NAME_CANONICAL: Record<string, { name: string; slug: string }> = {
  bern: { name: "Berne", slug: "berne" },
  bienne: { name: "Biel/Bienne", slug: "biel-bienne" },
  biel: { name: "Biel/Bienne", slug: "biel-bienne" },
  "carouge-ge": { name: "Carouge", slug: "carouge" },
};

/**
 * Correction ville → canton pour les communes identifiées en recette comme
 * mal rattachées dans la colonne `canton` de la base. Clé = slug de ville
 * (après canonicalisation), valeur = code canton correct à 2 lettres.
 */
const CITY_CANTON_OVERRIDES: Record<string, string> = {
  nyon: "VD",
  monthey: "VS",
  "biel-bienne": "BE",
};

export interface ResolvedCityCanton {
  /** Nom d'affichage canonique (dédupliqué), ex. "Biel/Bienne". */
  name: string;
  /** Slug canonique unique pour cette commune, ex. "biel-bienne". */
  slug: string;
  /** Code canton correct à 2 lettres (après correction éventuelle). */
  cantonCode: string;
}

/**
 * Résout un couple (ville brute, canton brut) tel que stocké en base vers
 * une entrée ville/canton normalisée, ou `null` si la ligne doit être
 * ignorée (code postal, ville étrangère, canton hors périmètre).
 */
export function resolveCityCanton(
  cityRaw: string | null | undefined,
  cantonRaw: string | null | undefined
): ResolvedCityCanton | null {
  if (!cityRaw) return null;
  const trimmed = cityRaw.trim();
  if (!trimmed || isPostalCodeLike(trimmed)) return null;

  let slug = slugifyCity(trimmed);
  if (!slug) return null;
  if (EXCLUDED_CITY_SLUGS.has(slug)) return null;

  let name = trimmed;
  const canonical = CITY_NAME_CANONICAL[slug];
  if (canonical) {
    slug = canonical.slug;
    name = canonical.name;
  }
  if (EXCLUDED_CITY_SLUGS.has(slug)) return null;

  const cantonCode = CITY_CANTON_OVERRIDES[slug] ?? cantonRaw ?? "";
  if (!cantonCode || !VALID_CANTON_CODES.includes(cantonCode)) return null;

  return { name, slug, cantonCode };
}

export interface CityAggregateEntry {
  name: string;
  slug: string;
  cantonCode: string;
  cantonSlug: string;
  count: number;
}

/**
 * Construit un regroupement ville/canton normalisé et dédupliqué à partir
 * d'une liste de lignes { city, canton } (déjà récupérées exhaustivement —
 * voir fetchAllRows). Renvoie une Map indexée par slug de ville canonique.
 */
export function buildCityAggregate(
  rows: { city: string | null; canton: string | null }[]
): Map<string, CityAggregateEntry> {
  const aggregate = new Map<string, CityAggregateEntry>();

  for (const row of rows) {
    const resolved = resolveCityCanton(row.city, row.canton);
    if (!resolved) continue;

    const existing = aggregate.get(resolved.slug);
    if (existing) {
      existing.count += 1;
    } else {
      aggregate.set(resolved.slug, {
        name: resolved.name,
        slug: resolved.slug,
        cantonCode: resolved.cantonCode,
        cantonSlug: cantonCodeToSlug(resolved.cantonCode) ?? resolved.cantonCode,
        count: 1,
      });
    }
  }

  return aggregate;
}

/**
 * Récupère et regroupe TOUS les restaurants publiés des 7 cantons couverts
 * par le site, normalisés ville/canton (voir `resolveCityCanton`).
 *
 * - Pagine par lots de 1000 pour contourner le plafond PostgREST (#33) : un
 *   simple .select() ne verrait qu'un échantillon non déterministe.
 * - Mémoïsé par requête (React `cache`) : les pages canton et ville peuvent
 *   appeler cette fonction plusieurs fois sans multiplier les allers-retours
 *   à la base.
 */
export const fetchCityCantonAggregate = cache(
  async (): Promise<Map<string, CityAggregateEntry>> => {
    const supabase = createAdminClient();
    const rows = await fetchAllRows<{ city: string | null; canton: string | null }>(
      ({ from, to }) =>
        supabase
          .from("restaurants")
          .select("city, canton")
          .eq("is_published", true)
          .not("city", "is", null)
          .neq("city", "")
          .in("canton", VALID_CANTON_CODES)
          .order("id", { ascending: true })
          .range(from, to),
      { onError: (msg) => console.error("[fetchCityCantonAggregate] Erreur:", msg) }
    );

    return buildCityAggregate(rows);
  }
);

/** Villes d'un canton donné (slug), triées par nombre d'établissements décroissant. */
export async function getCitiesForCanton(cantonSlug: string): Promise<CityAggregateEntry[]> {
  const aggregate = await fetchCityCantonAggregate();
  return Array.from(aggregate.values())
    .filter((entry) => entry.cantonSlug === cantonSlug)
    .sort((a, b) => b.count - a.count);
}

/** Résout un slug de ville vers son entrée agrégée normalisée (ou `null`). */
export async function resolveCitySlug(citySlug: string): Promise<CityAggregateEntry | null> {
  const aggregate = await fetchCityCantonAggregate();
  return aggregate.get(citySlug) ?? null;
}
