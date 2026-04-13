import { createClient } from "@/lib/supabase/server";
import type { PriceRange } from "@/lib/supabase/types";

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
export type RestaurantFilters = {
  canton?: string;
  cuisine?: string;
  city?: string;
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
// Shared filter helper (DRY)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: RestaurantFilters) {
  let q = query;

  if (filters.canton) {
    q = q.eq("canton", filters.canton);
  }
  if (filters.cuisine) {
    q = q.eq("cuisine_type", filters.cuisine);
  }
  if (filters.city) {
    q = q.ilike("city", `%${filters.city}%`);
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
    const term = filters.query.trim();
    q = q.textSearch("search_vector", term, {
      type: "websearch",
      config: "french",
    });
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
  try {
    const supabase = await createClient();

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
// Map-specific query — all matching restaurants, minimal columns
// ---------------------------------------------------------------------------

export async function fetchAllFilteredForMap(
  filters: RestaurantFilters
): Promise<RestaurantMapItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("restaurants")
      .select(MAP_SELECT)
      .eq("is_published", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    query = applyFilters(query, filters);
    query = query.order("avg_rating", { ascending: false });
    query = query.limit(2000);

    const { data, error } = await query;

    if (error) {
      console.error("[fetchAllFilteredForMap] Supabase error:", error.message);
      return [];
    }

    return (data ?? []) as RestaurantMapItem[];
  } catch (err) {
    console.error("[fetchAllFilteredForMap] Unexpected error:", err);
    return [];
  }
}
