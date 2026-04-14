"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FeaturedRestaurantRow {
  id: string;
  name_fr: string;
  city: string | null;
  canton: string | null;
  avg_rating: number | null;
  review_count: number | null;
  is_featured: boolean;
}

export async function listFeaturedRestaurants(): Promise<{
  success: boolean;
  error: string | null;
  data?: { restaurants: FeaturedRestaurantRow[]; total: number };
}> {
  try {
    const supabase = createAdminClient();
    const { data, error, count } = await supabase
      .from("restaurants")
      .select("id, name_fr, city, canton, avg_rating, review_count, is_featured", { count: "exact" })
      .eq("is_featured", true)
      .order("avg_rating", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      error: null,
      data: {
        restaurants: (data || []) as FeaturedRestaurantRow[],
        total: count || 0,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur lors du chargement des restaurants";
    return { success: false, error: msg };
  }
}

const MAX_FEATURED = 12;

export async function toggleFeatured(
  restaurantId: string,
  isFeatured: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();

    // Si on ajoute, vérifier la limite de 12
    if (isFeatured) {
      const { count } = await supabase
        .from("restaurants")
        .select("id", { count: "exact", head: true })
        .eq("is_featured", true);
      if ((count || 0) >= MAX_FEATURED) {
        return { success: false, error: "Limite atteinte : maximum " + MAX_FEATURED + " restaurants du mois. Retirez-en un avant d'en ajouter." };
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("restaurants").update({ is_featured: isFeatured }).eq("id", restaurantId);

    if (error) throw error;

    revalidatePath("/admin/featured");
    revalidatePath("/");
    return { success: true, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur lors de la mise à jour";
    return { success: false, error: msg };
  }
}

export async function searchRestaurants(query: string): Promise<{
  success: boolean;
  error: string | null;
  data?: { id: string; name: string; city: string | null; canton: string | null; is_featured: boolean }[];
}> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("restaurants")
      .select("id, name_fr, city, canton, is_featured")
      .ilike("name_fr", `%${query}%`)
      .order("name_fr")
      .limit(10);

    if (error) throw error;

    return {
      success: true,
      error: null,
      data: (data || []).map((r: { id: string; name_fr: string; city: string | null; canton: string | null; is_featured: boolean }) => ({
        id: r.id,
        name: r.name_fr,
        city: r.city,
        canton: r.canton,
        is_featured: r.is_featured,
      })),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur lors de la recherche";
    return { success: false, error: msg };
  }
}
