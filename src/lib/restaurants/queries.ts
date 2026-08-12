import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { PriceRange } from "@/lib/supabase/types";
import { cantonSlugToCode } from "@/lib/city-slug";
import { fetchAllRows } from "@/lib/supabase/paginate";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Lightweight projection for restaurant list cards. */
export interface RestaurantListItem {
  id: string;
  slug: string;
  name_fr: string;
  name_de: string;
  name_en: string;
  description_fr: string | null;
  description_de: string | null;
  description_en: string | null;
  cuisine_type: string | null;
  canton: string;
  city: string;
  price_range: PriceRange;
  avg_rating: number;
  review_count: number;
  /** Note Google (source de vérité si présente — voir #34) */
  google_rating: number | null;
  google_review_count: number | null;
  cover_image: string | null;
  features: string[];
  is_featured: boolean;
  latitude: number | null;
  longitude: number | null;
  opening_hours: Record<string, { open: string; close: string } | null> | null;
}

/** Minimal projection for map markers. */
export interface RestaurantMapItem {
  id: string;
  slug: string;
  name_fr: string;
  latitude: number;
  longitude: number;
  avg_rating: number;
  review_count: number;
  cuisine_type: string | null;
  city: string;
  canton: string;
}

/** Filters accepted by `fetchFilteredRestaurants`. */
/** Cuisine types that are NOT restaurants (bars, cafés) */
const BAR_TYPES = ["bar"];
const CAFE_TYPES = ["cafe", "tea-room"];
const NON_RESTAURANT_TYPES = [...BAR_TYPES, ...CAFE_TYPES];

export type RestaurantFilters = {
  /** "restaurant" | "bar" | "cafe" | "cave-a-vin" — filters by establishment type */
  establishmentType?: string;
  canton?: string;
  cuisine?: string;
  /**
   * Filtre ville. Une chaîne fait une correspondance EXACTE (insensible à la
   * casse) sur `city`. Un tableau fait un `.in("city", [...])` : utilisé pour
   * matcher toutes les variantes brutes d'une même commune canonicalisée
   * (ex. ["Bern", "Berne"]) — voir lib/restaurants/city-canton.ts.
   */
  city?: string | string[];
  /** 1..4 — filters price_range <= priceMax (string enum comparison) */
  priceMax?: number;
  /** filters avg_rating >= ratingMin */
  ratingMin?: number;
  /** contains (all requested features must be present) */
  features?: string[];
  /** full-text search via tsvector */
  query?: string;
  sort?: "rating" | "price" | "priceDesc" | "name" | "newest";
};

// ---------------------------------------------------------------------------
// Select projection — only the columns needed for a card
// ---------------------------------------------------------------------------

const LIST_SELECT = [
  "id",
  "slug",
  "name_fr",
  "name_de",
  "name_en",
  "description_fr",
  "description_de",
  "description_en",
  "cuisine_type",
  "canton",
  "city",
  "price_range",
  "avg_rating",
  "review_count",
  "google_rating",
  "google_review_count",
  "cover_image",
  "features",
  "is_featured",
  "latitude",
  "longitude",
  "opening_hours",
].join(",");

const MAP_SELECT = [
  "id",
  "slug",
  "name_fr",
  "latitude",
  "longitude",
  "avg_rating",
  "review_count",
  "cuisine_type",
  "city",
  "canton",
].join(",");

// ---------------------------------------------------------------------------
// LIKE/ILIKE helpers — les jokers SQL % et _ doivent être échappés quand ils
// proviennent d'une saisie utilisateur, sinon "%" renvoie tout le catalogue
// et "_" matche n'importe quel caractère.
// ---------------------------------------------------------------------------

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// ---------------------------------------------------------------------------
// Shared filter helper (DRY)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: RestaurantFilters) {
  let q = query;

  // Establishment type filter (restaurant vs bar vs café vs cave)
  if (filters.establishmentType === "restaurant") {
    // Exclude bars, cafés, caves — show only food places
    for (const t of NON_RESTAURANT_TYPES) {
      q = q.neq("cuisine_type", t);
    }
  } else if (filters.establishmentType === "bar") {
    q = q.in("cuisine_type", BAR_TYPES);
  } else if (filters.establishmentType === "cafe") {
    q = q.in("cuisine_type", CAFE_TYPES);
  }

  if (filters.canton) {
    // La colonne `canton` en base stocke des codes à 2 lettres ("VD", "GE"...),
    // pas les slugs utilisés dans les URLs/filtres ("vaud", "geneve"...).
    q = q.eq("canton", cantonSlugToCode(filters.canton) ?? filters.canton);
  }
  if (filters.cuisine) {
    q = q.eq("cuisine_type", filters.cuisine);
  }
  if (filters.city) {
    if (Array.isArray(filters.city)) {
      // Plusieurs variantes brutes d'une même commune canonicalisée
      // (ex. ["Bern", "Berne"]) — un simple ilike sur le nom fusionné ne
      // matcherait aucune ligne dont `city` est une variante différente,
      // vidant la grille malgré un compteur non nul (#34, bloquant sécurité).
      if (filters.city.length > 0) {
        q = q.in("city", filters.city);
      }
    } else {
      // Correspondance EXACTE (insensible à la casse) — un ilike avec jokers
      // ("%Berne%") capturait aussi "Bernex" ou "Route de Berne 285", mélangeant
      // des établissements d'autres communes dans la page /restaurants/ville/berne (#34).
      q = q.ilike("city", escapeLikePattern(filters.city));
    }
  }
  if (filters.priceMax != null && filters.priceMax >= 1 && filters.priceMax <= 4) {
    q = q.lte("price_range", String(filters.priceMax));
  }
  if (filters.ratingMin != null) {
    q = q.gte("avg_rating", filters.ratingMin);
  }
  if (filters.features && filters.features.length > 0) {
    q = q.contains("features", filters.features);
  }
  if (filters.query && filters.query.trim().length > 0) {
    // name_search is a generated column: lower(unaccent(name_fr || name_de || name_en || city))
    // Normalize the search term the same way so accent-free input matches accented names
    const normalized = filters.query
      .trim()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    // Échappe les jokers LIKE (% et _) : une recherche littérale sur "%" ne
    // doit pas renvoyer tout le catalogue. On échappe aussi les guillemets
    // doubles pour pouvoir citer la valeur ci-dessous (syntaxe .or() de
    // PostgREST : toute valeur contenant une virgule ou une parenthèse doit
    // être entourée de guillemets doubles).
    const escaped = escapeLikePattern(normalized).replace(/"/g, '\\"');
    // Le placeholder du champ promet "Nom, ville, cuisine..." — on cherche
    // donc aussi dans cuisine_type (name_search ne couvre que nom + ville).
    q = q.or(`name_search.ilike."%${escaped}%",cuisine_type.ilike."%${escaped}%"`);
  }

  return q;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySorting(query: any, sort: RestaurantFilters["sort"]) {
  let q = query;
  switch (sort) {
    case "price":
      q = q.order("price_range", { ascending: true });
      break;
    case "priceDesc":
      q = q.order("price_range", { ascending: false });
      break;
    case "name":
      q = q.order("name_fr", { ascending: true });
      break;
    case "newest":
      q = q.order("created_at", { ascending: false });
      break;
    case "rating":
    default:
      q = q.order("avg_rating", { ascending: false });
      break;
  }
  // Secondary sort for deterministic pagination
  q = q.order("id", { ascending: true });
  return q;
}

// ---------------------------------------------------------------------------
// Main query function
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 24;

export async function fetchFilteredRestaurants(
  filters: RestaurantFilters,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<{
  data: RestaurantListItem[];
  totalCount: number;
}> {
  noStore();
  try {
    const supabase = createAdminClient();

    let query = supabase
      .from("restaurants")
      .select(LIST_SELECT, { count: "exact" })
      .eq("is_published", true);

    query = applyFilters(query, filters);
    query = applySorting(query, filters.sort);

    // ---- Pagination ----
    const from = (page - 1) * pageSize;
    const to = page * pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[fetchFilteredRestaurants] Supabase error:", error.message);
      return { data: [], totalCount: 0 };
    }

    return {
      data: (data ?? []) as RestaurantListItem[],
      totalCount: count ?? 0,
    };
  } catch (err) {
    console.error("[fetchFilteredRestaurants] Unexpected error:", err);
    return { data: [], totalCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// Lightweight count-only query — single source of truth for the number of
// published restaurants shown in <title>/meta description on /restaurants
// (#41 : le <title>, la meta description et le compteur affichaient trois
// volumes différents car chacun utilisait un chiffre codé en dur). On
// applique les mêmes filtres que la liste pour rester cohérent lorsqu'une
// vue filtrée est demandée (ex. ?canton=vaud).
// ---------------------------------------------------------------------------

export async function fetchPublishedRestaurantCount(
  filters: RestaurantFilters = {}
): Promise<number> {
  noStore();
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("restaurants")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);

    query = applyFilters(query, filters);

    const { count, error } = await query;
    if (error) {
      console.error("[fetchPublishedRestaurantCount] Supabase error:", error.message);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.error("[fetchPublishedRestaurantCount] Unexpected error:", err);
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Cuisine counts — for filtering out empty categories in dropdowns/grids
// ---------------------------------------------------------------------------

export async function fetchCuisineCounts(): Promise<Record<string, number>> {
  try {
    const supabase = createAdminClient();
    // PostgREST plafonne toute réponse à 1000 lignes (max_rows) — avec ~11k
    // restaurants publiés, un simple .select() sans pagination ne voit que
    // ~9% de la base, sur un sous-ensemble non déterministe (pas de .order()).
    // On pagine par lots de 1000 pour obtenir un comptage exhaustif.
    const rows = await fetchAllRows<{ cuisine_type: string }>(
      ({ from, to }) =>
        supabase
          .from("restaurants")
          .select("cuisine_type")
          .eq("is_published", true)
          .not("cuisine_type", "is", null)
          .neq("cuisine_type", "")
          .order("id", { ascending: true })
          .range(from, to),
      { onError: (msg) => console.error("[fetchCuisineCounts] Erreur:", msg) }
    );

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.cuisine_type] = (counts[row.cuisine_type] || 0) + 1;
    }
    return counts;
  } catch (err) {
    console.error("[fetchCuisineCounts] Erreur inattendue:", err);
    return {};
  }
}

// ---------------------------------------------------------------------------
// Map-specific query — all matching restaurants, minimal columns
// ---------------------------------------------------------------------------

// Garde-fou pour éviter de rapatrier un nombre déraisonnable de marqueurs
// côté client (rendu Leaflet) si un filtre très large est appliqué.
const MAP_MAX_MARKERS = 5000;

export async function fetchAllFilteredForMap(
  filters: RestaurantFilters
): Promise<RestaurantMapItem[]> {
  try {
    const supabase = createAdminClient();

    // PostgREST plafonne les réponses à 1000 lignes : un .limit(2000) est
    // silencieusement écrasé par ce plafond serveur. On pagine par lots de
    // 1000 pour renvoyer tous les établissements filtrés (jusqu'à
    // MAP_MAX_MARKERS, au-delà duquel la carte deviendrait de toute façon
    // illisible).
    const rows = await fetchAllRows<RestaurantMapItem>(
      ({ from, to }) => {
        let query = supabase
          .from("restaurants")
          .select(MAP_SELECT)
          .eq("is_published", true)
          .not("latitude", "is", null)
          .not("longitude", "is", null);

        query = applyFilters(query, filters);
        query = query
          .order("avg_rating", { ascending: false })
          .order("id", { ascending: true })
          .range(from, to);

        return query as unknown as PromiseLike<{
          data: RestaurantMapItem[] | null;
          error: { message: string } | null;
        }>;
      },
      {
        maxRows: MAP_MAX_MARKERS,
        onError: (msg) => console.error("[fetchAllFilteredForMap] Supabase error:", msg),
      }
    );

    return rows;
  } catch (err) {
    console.error("[fetchAllFilteredForMap] Unexpected error:", err);
    return [];
  }
}
