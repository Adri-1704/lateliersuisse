"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { DbReview } from "@/lib/supabase/types";

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
 * Get the restaurant ID for the current merchant.
 */
async function getMerchantRestaurantId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const merchantId = await findMerchantId(supabase, user.id, user.email || "");
    if (!merchantId) return null;

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin.from("restaurants") as any)
      .select("id")
      .eq("merchant_id", merchantId)
      .limit(1)
      .single();

    return data?.id || null;
  } catch {
    return null;
  }
}

/**
 * Get all reviews for the merchant's restaurant.
 */
export async function getMerchantReviews(): Promise<{
  success: boolean;
  error: string | null;
  data?: DbReview[];
}> {
  try {
    const restaurantId = await getMerchantRestaurantId();
    if (!restaurantId) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin.from("reviews") as any)
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: "Erreur de chargement" };
    return { success: true, error: null, data: (data || []) as DbReview[] };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

/**
 * Submit or update a reply to a review.
 */
export async function replyToReview(
  reviewId: string,
  replyComment: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const comment = replyComment.trim();
    if (!comment || comment.length < 2) {
      return { success: false, error: "La réponse doit contenir au moins 2 caractères" };
    }
    if (comment.length > 1000) {
      return { success: false, error: "La réponse ne peut pas dépasser 1000 caractères" };
    }

    const restaurantId = await getMerchantRestaurantId();
    if (!restaurantId) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();

    // Verify the review belongs to this restaurant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: review } = await (admin.from("reviews") as any)
      .select("id, restaurant_id")
      .eq("id", reviewId)
      .eq("restaurant_id", restaurantId)
      .single();

    if (!review) return { success: false, error: "Avis introuvable" };

    // Update the review with the reply
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("reviews") as any)
      .update({
        reply_comment: comment,
        reply_date: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) return { success: false, error: "Erreur lors de l'enregistrement" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

/**
 * Delete a reply from a review.
 */
export async function deleteReply(
  reviewId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const restaurantId = await getMerchantRestaurantId();
    if (!restaurantId) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();

    // Verify the review belongs to this restaurant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: review } = await (admin.from("reviews") as any)
      .select("id, restaurant_id")
      .eq("id", reviewId)
      .eq("restaurant_id", restaurantId)
      .single();

    if (!review) return { success: false, error: "Avis introuvable" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("reviews") as any)
      .update({ reply_comment: null, reply_date: null })
      .eq("id", reviewId);

    if (error) return { success: false, error: "Erreur lors de la suppression" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}
