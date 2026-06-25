"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getMerchantSession } from "@/actions/merchant/auth";
import { sendWhatsAppBroadcast } from "@/lib/whatsapp/broadcast";

export async function broadcastWhatsApp(formData: FormData): Promise<{
  success: boolean;
  sent: number;
  error: string | null;
}> {
  try {
    const session = await getMerchantSession();
    if (!session?.restaurant) return { success: false, sent: 0, error: "Non autorisé" };

    const message = (formData.get("message") as string)?.trim();
    if (!message) return { success: false, sent: 0, error: "Message vide" };
    if (message.length > 1024) return { success: false, sent: 0, error: "Message trop long (max 1024 caractères)" };

    const imageFile = formData.get("image") as File | null;
    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const admin = createAdminClient();
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `whatsapp/${session.restaurant.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await admin.storage
        .from("restaurant-images")
        .upload(path, imageFile, { cacheControl: "86400", upsert: false });

      if (uploadError) return { success: false, sent: 0, error: `Upload échoué: ${uploadError.message}` };

      const { data: urlData } = admin.storage.from("restaurant-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const sent = await sendWhatsAppBroadcast({
      restaurantId: session.restaurant.id,
      restaurantName: session.restaurant.name_fr,
      message,
      imageUrl,
    });

    // Save to broadcast history (non-blocking — table may not exist yet)
    try {
      const adminForHistory = createAdminClient();
      await (adminForHistory.from("whatsapp_broadcasts") as ReturnType<typeof adminForHistory.from>).insert({
        restaurant_id: session.restaurant.id,
        message,
        image_url: imageUrl,
        sent_count: sent,
      });
    } catch {
      // Table not created yet — broadcast still succeeded
    }

    return { success: true, sent, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inattendue";
    return { success: false, sent: 0, error: msg };
  }
}

export async function getBroadcastHistory(restaurantId: string): Promise<{
  id: string;
  message: string;
  image_url: string | null;
  sent_count: number;
  created_at: string;
}[]> {
  try {
    const admin = createAdminClient();
    const { data } = await (admin.from("whatsapp_broadcasts") as ReturnType<typeof admin.from>)
      .select("id, message, image_url, sent_count, created_at")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(10) as { data: { id: string; message: string; image_url: string | null; sent_count: number; created_at: string }[] | null };
    return data || [];
  } catch {
    return [];
  }
}

export async function getWhatsAppSubscriberCount(restaurantId: string): Promise<number> {
  try {
    const admin = createAdminClient();
    const { count } = await (admin.from("whatsapp_subscribers") as ReturnType<typeof admin.from>)
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true) as { count: number | null };
    return count || 0;
  } catch {
    return 0;
  }
}
