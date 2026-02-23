"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { DbReview } from "@/lib/supabase/types";

interface ReviewWithRestaurant extends DbReview {
  restaurant_name?: string;
}

const mockReviews: ReviewWithRestaurant[] = [
  { id: "r1", restaurant_id: "1", author_name: "Jean Dupont", rating: 5, comment: "Excellent restaurant, service impeccable et cuisine raffinee.", is_verified: true, created_at: "2026-02-20T12:00:00Z", restaurant_name: "Le Petit Prince" },
  { id: "r2", restaurant_id: "2", author_name: "Marie Curie", rating: 4, comment: "Tres bonne experience, je recommande le menu du jour.", is_verified: true, created_at: "2026-02-19T18:30:00Z", restaurant_name: "Chez Marcel" },
  { id: "r3", restaurant_id: "1", author_name: "Pierre Martin", rating: 3, comment: "Correct mais un peu cher pour ce que c'est.", is_verified: false, created_at: "2026-02-18T20:15:00Z", restaurant_name: "Le Petit Prince" },
  { id: "r4", restaurant_id: "3", author_name: "Anna Schmidt", rating: 5, comment: "Das beste Schweizer Restaurant! Wunderbar.", is_verified: true, created_at: "2026-02-17T13:00:00Z", restaurant_name: "Alpenstube" },
  { id: "r5", restaurant_id: "2", author_name: "Luc Bernard", rating: 2, comment: "Decu par la qualite, pas a la hauteur des attentes.", is_verified: false, created_at: "2026-02-16T19:45:00Z", restaurant_name: "Chez Marcel" },
];

export async function listReviews(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ success: boolean; error: string | null; data?: { reviews: ReviewWithRestaurant[]; total: number } }> {
  const { page = 1, limit = 20, search } = params;

  try {
    const supabase = createAdminClient();
    let query = supabase.from("reviews").select("*, restaurants(name_fr)", { count: "exact" });

    if (search) {
      query = query.or(`author_name.ilike.%${search}%,comment.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    const mapped = (data || []).map((r: Record<string, unknown>) => ({
      ...r,
      restaurant_name: (r.restaurants as Record<string, string>)?.name_fr || "Inconnu",
    })) as ReviewWithRestaurant[];

    return { success: true, error: null, data: { reviews: mapped, total: count || 0 } };
  } catch {
    let filtered = [...mockReviews];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) => r.author_name.toLowerCase().includes(s) || (r.comment || "").toLowerCase().includes(s)
      );
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { success: true, error: null, data: { reviews: paged, total } };
  }
}

export async function deleteReview(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Impossible de supprimer l'avis (mode demo)" };
  }
}
