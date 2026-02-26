"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { FeaturedRestaurant } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

export interface FeaturedWithRestaurant extends FeaturedRestaurant {
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

export async function addFeatured(params: {
  restaurant_id: string;
  month: number;
  year: number;
  position: number;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("featured_restaurants") as any).insert({
      restaurant_id: params.restaurant_id,
      month: params.month,
      year: params.year,
      position: params.position,
    });
    if (error) throw error;
    revalidatePath("/admin/featured");
    return { success: true, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Impossible d'ajouter le restaurant";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { success: false, error: "Ce restaurant est deja selectionne pour ce mois" };
    }
    return { success: false, error: msg };
  }
}

export async function removeFeatured(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("featured_restaurants").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/featured");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Impossible de retirer le restaurant (mode demo)" };
  }
}

export async function searchRestaurants(query: string): Promise<{
  success: boolean;
  error: string | null;
  data?: { id: string; name: string }[];
}> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("restaurants")
      .select("id, name_fr")
      .ilike("name_fr", `%${query}%`)
      .order("name_fr")
      .limit(10);
    if (error) throw error;
    return {
      success: true,
      error: null,
      data: (data || []).map((r: { id: string; name_fr: string }) => ({ id: r.id, name: r.name_fr })),
    };
  } catch {
    // Mock data fallback for demo mode
    return {
      success: true,
      error: "Mode demo",
      data: [
        { id: "1", name: "Le Petit Prince" },
        { id: "2", name: "Chez Marcel" },
        { id: "3", name: "Alpenstube" },
        { id: "4", name: "La Brasserie" },
        { id: "5", name: "Sakura" },
      ].filter((r) => r.name.toLowerCase().includes(query.toLowerCase())),
    };
  }
}
