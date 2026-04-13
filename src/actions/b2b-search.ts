"use server";

import { createAdminClient } from "@/lib/supabase/server";

/**
 * Search all published restaurants (for B2B "find your restaurant" module).
 * Unlike searchAvailableRestaurants, this includes already-claimed restaurants
 * so the prospect can see their restaurant is on the platform.
 */
export async function searchAllRestaurants(
  query: string
): Promise<{ slug: string; name: string; city: string }[]> {
  if (!query || query.length < 2) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("slug, name_fr, city")
    .eq("is_published", true)
    .ilike("name_fr", `%${query}%`)
    .limit(10) as {
    data: { slug: string; name_fr: string; city: string }[] | null;
    error: unknown;
  };

  if (error || !data) return [];
  return data.map((r) => ({ slug: r.slug, name: r.name_fr, city: r.city }));
}
