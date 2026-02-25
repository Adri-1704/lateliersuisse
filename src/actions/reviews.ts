"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { DbReview } from "@/lib/supabase/types";

export interface SubmitReviewData {
  restaurant_id: string;
  author_name: string;
  rating: number;
  comment?: string;
}

export interface SubmitReviewResult {
  success: boolean;
  error: string | null;
  review?: {
    id: string;
    restaurantId: string;
    authorName: string;
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export async function submitReview(data: SubmitReviewData): Promise<SubmitReviewResult> {
  try {
    // Validation
    const authorName = data.author_name?.trim();
    if (!authorName || authorName.length < 2 || authorName.length > 50) {
      return { success: false, error: "Le nom doit contenir entre 2 et 50 caractères" };
    }

    if (!data.rating || data.rating < 1 || data.rating > 5 || !Number.isInteger(data.rating)) {
      return { success: false, error: "La note doit être entre 1 et 5" };
    }

    const comment = data.comment?.trim() || "";
    if (comment.length > 1000) {
      return { success: false, error: "Le commentaire ne peut pas dépasser 1000 caractères" };
    }

    if (!data.restaurant_id) {
      return { success: false, error: "Restaurant non spécifié" };
    }

    const admin = createAdminClient();

    // Verify restaurant exists and is published
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: restaurant } = await (admin.from("restaurants") as any)
      .select("id")
      .eq("id", data.restaurant_id)
      .eq("is_published", true)
      .single();

    if (!restaurant) {
      return { success: false, error: "Restaurant introuvable" };
    }

    // Insert review
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: review, error: insertError } = await (admin.from("reviews") as any)
      .insert({
        restaurant_id: data.restaurant_id,
        author_name: authorName,
        rating: data.rating,
        comment: comment || null,
      })
      .select()
      .single();

    if (insertError || !review) {
      console.error("Review insert error:", insertError);
      return { success: false, error: "Erreur lors de l'enregistrement de l'avis" };
    }

    const dbReview = review as DbReview;

    return {
      success: true,
      error: null,
      review: {
        id: dbReview.id,
        restaurantId: dbReview.restaurant_id,
        authorName: dbReview.author_name,
        rating: dbReview.rating,
        comment: dbReview.comment || "",
        createdAt: dbReview.created_at,
      },
    };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}
