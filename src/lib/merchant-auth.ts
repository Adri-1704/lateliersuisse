/**
 * Merchant ownership verification helpers (C2 fix).
 *
 * These functions verify that an entity (image, menu item, promotion)
 * belongs to a restaurant owned by the currently authenticated merchant.
 * Used to prevent IDOR attacks where merchant A tries to modify merchant B's data.
 */

import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Get the current authenticated merchant's ID.
 * Returns null if the user is not authenticated or not a merchant.
 */
export async function getCurrentMerchantId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Try auth_user_id first (use admin client since merchants table has restrictive RLS)
    const adminForLookup = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (adminForLookup.from("merchants") as any)
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    if (data) return data.id;

    // Fallback to email match
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: byEmail } = await (admin.from("merchants") as any)
      .select("id")
      .eq("email", user.email || "")
      .single();
    return byEmail?.id || null;
  } catch {
    return null;
  }
}

/**
 * Assert that a restaurant_image belongs to the current merchant.
 * Returns { authorized: true, merchantId } or { authorized: false, error }.
 */
export async function assertMerchantOwnsImage(
  imageId: string
): Promise<{ authorized: true; merchantId: string } | { authorized: false; error: string }> {
  const merchantId = await getCurrentMerchantId();
  if (!merchantId) return { authorized: false, error: "Non authentifié" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: image } = await (admin.from("restaurant_images") as any)
    .select("restaurant_id")
    .eq("id", imageId)
    .single();

  if (!image) return { authorized: false, error: "Image introuvable" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: restaurant } = await (admin.from("restaurants") as any)
    .select("merchant_id")
    .eq("id", image.restaurant_id)
    .single();

  if (!restaurant || restaurant.merchant_id !== merchantId) {
    return { authorized: false, error: "Accès refusé" };
  }

  return { authorized: true, merchantId };
}

/**
 * Assert that a menu_item belongs to the current merchant.
 */
export async function assertMerchantOwnsMenuItem(
  menuItemId: string
): Promise<{ authorized: true; merchantId: string } | { authorized: false; error: string }> {
  const merchantId = await getCurrentMerchantId();
  if (!merchantId) return { authorized: false, error: "Non authentifié" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (admin.from("menu_items") as any)
    .select("restaurant_id")
    .eq("id", menuItemId)
    .single();

  if (!item) return { authorized: false, error: "Plat introuvable" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: restaurant } = await (admin.from("restaurants") as any)
    .select("merchant_id")
    .eq("id", item.restaurant_id)
    .single();

  if (!restaurant || restaurant.merchant_id !== merchantId) {
    return { authorized: false, error: "Accès refusé" };
  }

  return { authorized: true, merchantId };
}

/**
 * Assert that a restaurant_promotion belongs to the current merchant.
 */
export async function assertMerchantOwnsPromotion(
  promotionId: string
): Promise<{ authorized: true; merchantId: string } | { authorized: false; error: string }> {
  const merchantId = await getCurrentMerchantId();
  if (!merchantId) return { authorized: false, error: "Non authentifié" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: promo } = await (admin.from("restaurant_promotions") as any)
    .select("restaurant_id")
    .eq("id", promotionId)
    .single();

  if (!promo) return { authorized: false, error: "Promotion introuvable" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: restaurant } = await (admin.from("restaurants") as any)
    .select("merchant_id")
    .eq("id", promo.restaurant_id)
    .single();

  if (!restaurant || restaurant.merchant_id !== merchantId) {
    return { authorized: false, error: "Accès refusé" };
  }

  return { authorized: true, merchantId };
}

/**
 * Assert that ALL images in a list belong to the current merchant.
 * Used for reorderImages which takes an array of IDs.
 */
export async function assertMerchantOwnsAllImages(
  imageIds: string[]
): Promise<{ authorized: true; merchantId: string } | { authorized: false; error: string }> {
  const merchantId = await getCurrentMerchantId();
  if (!merchantId) return { authorized: false, error: "Non authentifié" };

  if (imageIds.length === 0) return { authorized: true, merchantId };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: images } = await (admin.from("restaurant_images") as any)
    .select("id, restaurant_id")
    .in("id", imageIds);

  if (!images || images.length !== imageIds.length) {
    return { authorized: false, error: "Une ou plusieurs images introuvables" };
  }

  // Get unique restaurant_ids
  const restaurantIds = [...new Set(images.map((img: { restaurant_id: string }) => img.restaurant_id))];

  // Verify all restaurants belong to this merchant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: restaurants } = await (admin.from("restaurants") as any)
    .select("id, merchant_id")
    .in("id", restaurantIds);

  if (!restaurants) return { authorized: false, error: "Restaurants introuvables" };

  const allOwned = restaurants.every(
    (r: { merchant_id: string }) => r.merchant_id === merchantId
  );
  if (!allOwned) return { authorized: false, error: "Accès refusé" };

  return { authorized: true, merchantId };
}
