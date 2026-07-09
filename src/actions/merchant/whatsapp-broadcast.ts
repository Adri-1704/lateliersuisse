"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getMerchantSession } from "@/actions/merchant/auth";
import { sendWhatsAppBroadcast } from "@/lib/whatsapp/broadcast";

const MONTHLY_BROADCAST_QUOTA = 30;

export async function getMonthlyBroadcastUsage(restaurantId: string): Promise<number> {
  try {
    const admin = createAdminClient();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await (admin.from("whatsapp_broadcasts") as ReturnType<typeof admin.from>)
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startOfMonth.toISOString()) as { count: number | null };
    return count || 0;
  } catch {
    return 0;
  }
}

export async function broadcastWhatsApp(formData: FormData): Promise<{
  success: boolean;
  sent: number;
  error: string | null;
  quotaUsed?: number;
  quotaMax?: number;
}> {
  try {
    const session = await getMerchantSession();
    if (!session?.restaurant) return { success: false, sent: 0, error: "Non autorisé" };

    const message = (formData.get("message") as string)?.trim();
    if (!message) return { success: false, sent: 0, error: "Message vide" };
    if (message.length > 1024) return { success: false, sent: 0, error: "Message trop long (max 1024 caractères)" };

    const used = await getMonthlyBroadcastUsage(session.restaurant.id);
    if (used >= MONTHLY_BROADCAST_QUOTA) {
      return {
        success: false,
        sent: 0,
        error: `Quota mensuel atteint (${MONTHLY_BROADCAST_QUOTA} messages/mois). Renouvellement le 1er du mois prochain.`,
        quotaUsed: used,
        quotaMax: MONTHLY_BROADCAST_QUOTA,
      };
    }

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

    const { sent, wamids } = await sendWhatsAppBroadcast({
      restaurantId: session.restaurant.id,
      restaurantName: session.restaurant.name_fr,
      message,
      imageUrl,
    });

    // Save broadcast + wamid tracking (non-blocking)
    try {
      const adminForHistory = createAdminClient();
      const { data: inserted } = await (adminForHistory.from("whatsapp_broadcasts") as ReturnType<typeof adminForHistory.from>)
        .insert({
          restaurant_id: session.restaurant.id,
          message,
          image_url: imageUrl,
          sent_count: sent,
        })
        .select("id")
        .single() as { data: { id: string } | null };

      if (inserted?.id && wamids.length > 0) {
        await (adminForHistory.from("whatsapp_message_tracking") as ReturnType<typeof adminForHistory.from>)
          .insert(wamids.map((wamid) => ({ wamid, broadcast_id: inserted.id })));
      }
    } catch {
      // Tables not created yet — broadcast still succeeded
    }

    return { success: true, sent, error: null, quotaUsed: used + 1, quotaMax: MONTHLY_BROADCAST_QUOTA };
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
  delivered_count: number;
  read_count: number;
  created_at: string;
}[]> {
  try {
    const admin = createAdminClient();
    const { data } = await (admin.from("whatsapp_broadcasts") as ReturnType<typeof admin.from>)
      .select("id, message, image_url, sent_count, delivered_count, read_count, created_at")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(10) as {
        data: {
          id: string;
          message: string;
          image_url: string | null;
          sent_count: number;
          delivered_count: number;
          read_count: number;
          created_at: string;
        }[] | null
      };
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

export async function getSubscribers(restaurantId: string): Promise<{
  id: string;
  phone: string;
  first_name: string | null;
  subscribed_at: string;
  is_active: boolean;
  source: string | null;
}[]> {
  try {
    const admin = createAdminClient();
    const { data } = await (admin.from("whatsapp_subscribers") as ReturnType<typeof admin.from>)
      .select("id, phone, first_name, subscribed_at, is_active, source")
      .eq("restaurant_id", restaurantId)
      .order("subscribed_at", { ascending: false }) as {
        data: { id: string; phone: string; first_name: string | null; subscribed_at: string; is_active: boolean; source: string | null }[] | null
      };
    return data || [];
  } catch {
    return [];
  }
}

export async function deleteSubscriber(subscriberId: string): Promise<{ success: boolean }> {
  try {
    const session = await getMerchantSession();
    if (!session?.restaurant) return { success: false };

    const admin = createAdminClient();
    // Verify the subscriber belongs to this restaurant
    const { error } = await (admin.from("whatsapp_subscribers") as ReturnType<typeof admin.from>)
      .delete()
      .eq("id", subscriberId)
      .eq("restaurant_id", session.restaurant.id);

    return { success: !error };
  } catch {
    return { success: false };
  }
}

export async function getWhatsAppPlanTier(merchantId: string): Promise<50 | 100 | 200 | null> {
  try {
    const admin = createAdminClient();
    const { data } = await (admin.from("subscriptions") as ReturnType<typeof admin.from>)
      .select("whatsapp_tier")
      .eq("merchant_id", merchantId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as { data: { whatsapp_tier: number | null } | null };
    const tier = data?.whatsapp_tier;
    if (tier === 50 || tier === 100 || tier === 200) return tier;
    return 100; // default
  } catch {
    return null;
  }
}
