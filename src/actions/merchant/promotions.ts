"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { assertMerchantOwnsPromotion } from "@/lib/merchant-auth";
import type { DbPromotion } from "@/lib/supabase/types";

export interface PromotionData {
  restaurant_id: string;
  title: string;
  description?: string;
  promotion_type: string;
  value?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

/**
 * Find merchant by auth_user_id first, then fallback to email.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findMerchantId(supabase: any, userId: string, email: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("merchants")
      .select("id")
      .eq("auth_user_id", userId)
      .single();
    if (data) return data.id;
  } catch {
    // fallback
  }
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

/**
 * Verify that a restaurant belongs to the current merchant.
 */
async function verifyRestaurantOwnership(restaurantId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const merchantId = await findMerchantId(supabase, user.id, user.email || "");
    if (!merchantId) return false;

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin.from("restaurants") as any)
      .select("id")
      .eq("id", restaurantId)
      .eq("merchant_id", merchantId)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

export async function getPromotions(restaurantId: string): Promise<{
  success: boolean;
  error: string | null;
  data?: DbPromotion[];
}> {
  try {
    const isOwner = await verifyRestaurantOwnership(restaurantId);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin.from("restaurant_promotions") as any)
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: "Erreur de chargement" };
    return { success: true, error: null, data: (data || []) as DbPromotion[] };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function createPromotion(item: PromotionData): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const isOwner = await verifyRestaurantOwnership(item.restaurant_id);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurant_promotions") as any).insert({
      restaurant_id: item.restaurant_id,
      title: item.title,
      description: item.description || null,
      promotion_type: item.promotion_type,
      value: item.value || null,
      is_active: item.is_active !== false,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
    });

    if (error) return { success: false, error: "Erreur lors de l'ajout" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function updatePromotion(
  id: string,
  item: Partial<PromotionData>
): Promise<{ success: boolean; error: string | null }> {
  try {
    // ── Ownership check — always verify via promotion ID (C2 fix) ──
    const authCheck = await assertMerchantOwnsPromotion(id);
    if (!authCheck.authorized) return { success: false, error: authCheck.error };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurant_promotions") as any)
      .update(item)
      .eq("id", id);

    if (error) return { success: false, error: "Erreur lors de la mise à jour" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function deletePromotion(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // ── Ownership check (C2 fix) ──
    const authCheck = await assertMerchantOwnsPromotion(id);
    if (!authCheck.authorized) return { success: false, error: authCheck.error };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurant_promotions") as any)
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: "Erreur lors de la suppression" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function togglePromotion(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    // ── Ownership check (C2 fix) ──
    const authCheck = await assertMerchantOwnsPromotion(id);
    if (!authCheck.authorized) return { success: false, error: authCheck.error };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurant_promotions") as any)
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) return { success: false, error: "Erreur lors de la mise à jour" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}
