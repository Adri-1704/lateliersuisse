"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { RestaurantImage } from "@/lib/supabase/types";

const MAX_IMAGES = 10;

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

export async function getRestaurantImages(restaurantId: string): Promise<{
  success: boolean;
  error: string | null;
  data?: RestaurantImage[];
}> {
  try {
    const isOwner = await verifyRestaurantOwnership(restaurantId);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin.from("restaurant_images") as any)
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("position", { ascending: true });

    if (error) return { success: false, error: "Erreur de chargement" };
    return { success: true, error: null, data: (data || []) as RestaurantImage[] };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function uploadImage(
  restaurantId: string,
  formData: FormData
): Promise<{ success: boolean; error: string | null; url?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "Aucun fichier fourni" };

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Type de fichier non autorisé (JPG, PNG, WebP uniquement)" };
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Le fichier est trop volumineux (5 Mo max)" };
    }

    const isOwner = await verifyRestaurantOwnership(restaurantId);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();

    // Check max images limit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (admin.from("restaurant_images") as any)
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId);

    if (count !== null && count >= MAX_IMAGES) {
      return { success: false, error: `Vous avez atteint la limite de ${MAX_IMAGES} photos` };
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${restaurantId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Upload to Supabase Storage (use admin to bypass storage policies)
    const { error: uploadError } = await admin.storage
      .from("restaurant-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { success: false, error: "Erreur lors de l'upload" };
    }

    // Get public URL
    const { data: urlData } = admin.storage
      .from("restaurant-images")
      .getPublicUrl(fileName);

    const url = urlData.publicUrl;

    // Get current max position
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (admin.from("restaurant_images") as any)
      .select("position")
      .eq("restaurant_id", restaurantId)
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition = existing && existing.length > 0 ? (existing[0] as RestaurantImage).position + 1 : 0;

    // Insert image record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (admin.from("restaurant_images") as any).insert({
      restaurant_id: restaurantId,
      url,
      position: nextPosition,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return { success: false, error: "Erreur lors de l'enregistrement" };
    }

    return { success: true, error: null, url };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function deleteImage(imageId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const admin = createAdminClient();

    // Get image to verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: image } = await (admin.from("restaurant_images") as any)
      .select("url, restaurant_id")
      .eq("id", imageId)
      .single();

    if (!image) return { success: false, error: "Image introuvable" };

    const isOwner = await verifyRestaurantOwnership(image.restaurant_id);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    // Delete from DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurant_images") as any)
      .delete()
      .eq("id", imageId);

    if (error) return { success: false, error: "Erreur lors de la suppression" };

    // Try to delete from storage (extract path from URL)
    if (image?.url) {
      try {
        const urlParts = (image.url as string).split("/restaurant-images/");
        if (urlParts[1]) {
          await admin.storage.from("restaurant-images").remove([urlParts[1]]);
        }
      } catch {
        // Non-critical: storage cleanup failed
      }
    }

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function setCoverImage(
  restaurantId: string,
  imageUrl: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const isOwner = await verifyRestaurantOwnership(restaurantId);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurants") as any)
      .update({ cover_image: imageUrl })
      .eq("id", restaurantId);

    if (error) return { success: false, error: "Erreur lors de la mise à jour" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function reorderImages(
  imageIds: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (!imageIds.length) return { success: true, error: null };

    const admin = createAdminClient();

    // Verify ownership via the first image's restaurant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: firstImage } = await (admin.from("restaurant_images") as any)
      .select("restaurant_id")
      .eq("id", imageIds[0])
      .single();

    if (!firstImage) return { success: false, error: "Image introuvable" };

    const isOwner = await verifyRestaurantOwnership(firstImage.restaurant_id);
    if (!isOwner) return { success: false, error: "Accès non autorisé" };

    // Update each image position in parallel
    const updates = imageIds.map((id, index) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin.from("restaurant_images") as any)
        .update({ position: index })
        .eq("id", id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);
    if (hasError) return { success: false, error: "Erreur lors du réordonnancement" };

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}
