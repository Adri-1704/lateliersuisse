"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { mockRestaurants } from "@/data/mock-restaurants";
import type { DbRestaurant } from "@/lib/supabase/types";

interface ListResult {
  success: boolean;
  error: string | null;
  data?: { restaurants: DbRestaurant[]; total: number };
}

export async function listRestaurants(params: {
  page?: number;
  limit?: number;
  search?: string;
  published?: string;
}): Promise<ListResult> {
  const { page = 1, limit = 20, search, published } = params;

  try {
    const supabase = createAdminClient();
    let query = supabase.from("restaurants").select("*", { count: "exact" });

    if (search) {
      query = query.or(`name_fr.ilike.%${search}%,city.ilike.%${search}%,canton.ilike.%${search}%`);
    }
    if (published === "true") query = query.eq("is_published", true);
    if (published === "false") query = query.eq("is_published", false);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return { success: true, error: null, data: { restaurants: data || [], total: count || 0 } };
  } catch {
    // Mock fallback
    let filtered = [...mockRestaurants];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) => r.nameFr.toLowerCase().includes(s) || r.city.toLowerCase().includes(s)
      );
    }
    if (published === "true") filtered = filtered.filter((r) => r.isPublished);
    if (published === "false") filtered = filtered.filter((r) => !r.isPublished);

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    const mapped: DbRestaurant[] = paged.map((r) => ({
      id: r.id,
      merchant_id: null,
      slug: r.slug,
      name_fr: r.nameFr,
      name_de: r.nameDe,
      name_en: r.nameEn,
      description_fr: r.descriptionFr,
      description_de: r.descriptionDe,
      description_en: r.descriptionEn,
      cuisine_type_id: null,
      cuisine_type: r.cuisineType,
      canton: r.canton,
      city: r.city,
      address: r.address,
      postal_code: r.postalCode,
      latitude: r.latitude,
      longitude: r.longitude,
      phone: r.phone,
      email: r.email,
      website: r.website,
      price_range: String(r.priceRange) as DbRestaurant["price_range"],
      avg_rating: r.avgRating,
      review_count: r.reviewCount,
      opening_hours: r.openingHours as DbRestaurant["opening_hours"],
      features: r.features,
      cover_image: r.coverImage,
      is_featured: r.isFeatured,
      is_published: r.isPublished,
      search_vector: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    return { success: true, error: null, data: { restaurants: mapped, total } };
  }
}

export async function getRestaurant(id: string): Promise<{ success: boolean; error: string | null; data?: DbRestaurant }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("restaurants").select("*").eq("id", id).single();
    if (error) throw error;
    return { success: true, error: null, data };
  } catch {
    const mock = mockRestaurants.find((r) => r.id === id);
    if (!mock) return { success: false, error: "Restaurant non trouve" };
    return { success: true, error: null, data: {
      id: mock.id, merchant_id: null, slug: mock.slug,
      name_fr: mock.nameFr, name_de: mock.nameDe, name_en: mock.nameEn,
      description_fr: mock.descriptionFr, description_de: mock.descriptionDe, description_en: mock.descriptionEn,
      cuisine_type_id: null, cuisine_type: mock.cuisineType,
      canton: mock.canton, city: mock.city, address: mock.address, postal_code: mock.postalCode,
      latitude: mock.latitude, longitude: mock.longitude,
      phone: mock.phone, email: mock.email, website: mock.website,
      price_range: String(mock.priceRange) as DbRestaurant["price_range"],
      avg_rating: mock.avgRating, review_count: mock.reviewCount,
      opening_hours: mock.openingHours as DbRestaurant["opening_hours"],
      features: mock.features, cover_image: mock.coverImage,
      is_featured: mock.isFeatured, is_published: mock.isPublished,
      search_vector: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }};
  }
}

export async function deleteRestaurant(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("restaurants").delete().eq("id", id);
    if (error) throw error;
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Impossible de supprimer le restaurant (mode demo)" };
  }
}

export async function togglePublishRestaurant(id: string, isPublished: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("restaurants").update({ is_published: isPublished }).eq("id", id);
    if (error) throw error;
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Impossible de modifier la publication (mode demo)" };
  }
}
