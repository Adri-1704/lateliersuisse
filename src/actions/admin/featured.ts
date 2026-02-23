"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { FeaturedRestaurant } from "@/lib/supabase/types";

interface FeaturedWithRestaurant extends FeaturedRestaurant {
  restaurant_name?: string;
}

const mockFeatured: FeaturedWithRestaurant[] = [
  { id: "f1", restaurant_id: "1", month: 2, year: 2026, position: 1, created_at: "2026-02-01T00:00:00Z", restaurant_name: "Le Petit Prince" },
  { id: "f2", restaurant_id: "3", month: 2, year: 2026, position: 2, created_at: "2026-02-01T00:00:00Z", restaurant_name: "Alpenstube" },
  { id: "f3", restaurant_id: "5", month: 2, year: 2026, position: 3, created_at: "2026-02-01T00:00:00Z", restaurant_name: "Sakura" },
];

export async function listFeatured(params: {
  month?: number;
  year?: number;
}): Promise<{ success: boolean; error: string | null; data?: { featured: FeaturedWithRestaurant[]; total: number } }> {
  const now = new Date();
  const { month = now.getMonth() + 1, year = now.getFullYear() } = params;

  try {
    const supabase = createAdminClient();
    const { data, error, count } = await supabase
      .from("featured_restaurants")
      .select("*, restaurants(name_fr)", { count: "exact" })
      .eq("month", month)
      .eq("year", year)
      .order("position", { ascending: true });

    if (error) throw error;

    const mapped = (data || []).map((f: Record<string, unknown>) => ({
      ...f,
      restaurant_name: (f.restaurants as Record<string, string>)?.name_fr || "Inconnu",
    })) as FeaturedWithRestaurant[];

    return { success: true, error: null, data: { featured: mapped, total: count || 0 } };
  } catch {
    const filtered = mockFeatured.filter((f) => f.month === month && f.year === year);
    return { success: true, error: null, data: { featured: filtered, total: filtered.length } };
  }
}

export async function removeFeatured(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("featured_restaurants").delete().eq("id", id);
    if (error) throw error;
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Impossible de retirer le restaurant (mode demo)" };
  }
}
