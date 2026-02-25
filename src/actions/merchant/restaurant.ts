"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { DbRestaurant, CuisineType } from "@/lib/supabase/types";

export interface UpdateRestaurantData {
  name_fr: string;
  name_de: string;
  name_en: string;
  description_fr: string;
  description_de: string;
  description_en: string;
  cuisine_type: string;
  cuisine_type_id?: string;
  address: string;
  city: string;
  canton: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  price_range: string;
  opening_hours: Record<string, { open: string; close: string; closed?: boolean }>;
  features: string[];
}

/**
 * Find merchant by auth_user_id first, then fallback to email.
 * Uses admin client to bypass RLS when auth_user_id column doesn't exist.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findMerchantId(supabase: any, userId: string, email: string): Promise<string | null> {
  // Try auth_user_id first
  try {
    const { data } = await supabase
      .from("merchants")
      .select("id")
      .eq("auth_user_id", userId)
      .single();
    if (data) return data.id;
  } catch {
    // Column may not exist yet — fallback to email
  }

  // Fallback: match by email (use admin client to bypass RLS)
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin.from("merchants") as any)
      .select("id")
      .eq("email", email)
      .single();
    return data?.id || null;
  } catch {
    return null;
  }
}

export async function getMerchantRestaurant(): Promise<{
  success: boolean;
  error: string | null;
  data?: DbRestaurant;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    // Get merchant (with email fallback)
    const merchantId = await findMerchantId(supabase, user.id, user.email || "");
    if (!merchantId) return { success: false, error: "Marchand non trouvé" };

    // Get restaurant (use admin client to bypass RLS if auth_user_id not set)
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: restaurant, error } = await (admin.from("restaurants") as any)
      .select("*")
      .eq("merchant_id", merchantId)
      .limit(1)
      .single();

    if (error || !restaurant) return { success: false, error: "Restaurant non trouvé" };
    return { success: true, error: null, data: restaurant as DbRestaurant };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function updateMerchantRestaurant(data: UpdateRestaurantData): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    const merchantId = await findMerchantId(supabase, user.id, user.email || "");
    if (!merchantId) return { success: false, error: "Marchand non trouvé" };

    // Use admin client to bypass RLS when auth_user_id column doesn't exist
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurants") as any)
      .update({
        name_fr: data.name_fr,
        name_de: data.name_de,
        name_en: data.name_en,
        description_fr: data.description_fr,
        description_de: data.description_de,
        description_en: data.description_en,
        cuisine_type: data.cuisine_type,
        cuisine_type_id: data.cuisine_type_id || null,
        address: data.address,
        city: data.city,
        canton: data.canton,
        postal_code: data.postal_code,
        phone: data.phone,
        email: data.email,
        website: data.website,
        instagram: data.instagram || null,
        facebook: data.facebook || null,
        tiktok: data.tiktok || null,
        price_range: data.price_range,
        opening_hours: data.opening_hours,
        features: data.features,
      })
      .eq("merchant_id", merchantId);

    if (error) return { success: false, error: "Erreur lors de la mise à jour" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function getCuisineTypes(): Promise<CuisineType[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cuisine_types")
      .select("*")
      .order("name_fr", { ascending: true });
    return (data || []) as CuisineType[];
  } catch {
    return [];
  }
}
