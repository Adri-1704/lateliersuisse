"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { DbMenuItem } from "@/lib/supabase/types";

export interface MenuItemData {
  restaurant_id: string;
  name_fr: string;
  name_de?: string;
  name_en?: string;
  description_fr?: string;
  description_de?: string;
  description_en?: string;
  price: number;
  category: string;
  position?: number;
  is_available?: boolean;
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

export async function getMenuItems(restaurantId: string): Promise<{
  success: boolean;
  error: string | null;
  data?: DbMenuItem[];
}> {
  try {
    // Verify ownership
    const isOwner = await verifyRestaurantOwnership(restaurantId);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin.from("menu_items") as any)
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("category", { ascending: true })
      .order("position", { ascending: true });

    if (error) return { success: false, error: "Erreur de chargement" };
    return { success: true, error: null, data: (data || []) as DbMenuItem[] };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function createMenuItem(item: MenuItemData): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const isOwner = await verifyRestaurantOwnership(item.restaurant_id);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("menu_items") as any).insert({
      restaurant_id: item.restaurant_id,
      name_fr: item.name_fr,
      name_de: item.name_de || "",
      name_en: item.name_en || "",
      description_fr: item.description_fr || "",
      description_de: item.description_de || "",
      description_en: item.description_en || "",
      price: item.price,
      category: item.category,
      position: item.position || 0,
      is_available: item.is_available !== false,
    });

    if (error) return { success: false, error: "Erreur lors de l'ajout" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function updateMenuItem(
  id: string,
  item: Partial<MenuItemData>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const admin = createAdminClient();

    // Always verify ownership by looking up the menu item's restaurant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: menuItem } = await (admin.from("menu_items") as any)
      .select("restaurant_id")
      .eq("id", id)
      .single();

    if (!menuItem) return { success: false, error: "Élément introuvable" };

    const isOwner = await verifyRestaurantOwnership(menuItem.restaurant_id);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("menu_items") as any)
      .update(item)
      .eq("id", id);

    if (error) return { success: false, error: "Erreur lors de la mise à jour" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function deleteMenuItem(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const admin = createAdminClient();

    // Get the menu item to verify restaurant ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: menuItem } = await (admin.from("menu_items") as any)
      .select("restaurant_id")
      .eq("id", id)
      .single();

    if (!menuItem) return { success: false, error: "Élément introuvable" };

    const isOwner = await verifyRestaurantOwnership(menuItem.restaurant_id);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("menu_items") as any)
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: "Erreur lors de la suppression" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}
