"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getMerchantSession } from "@/actions/merchant/auth";
import { sendWhatsAppBroadcast } from "@/lib/whatsapp/broadcast";

function monthlyQuotaForTier(tier: number | null): number {
  return (tier ?? 50) * 4; // 50→200, 100→400, 200→800 individual messages/month
}

export async function getMonthlyBroadcastUsage(restaurantId: string): Promise<number> {
  try {
    const admin = createAdminClient();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { data } = await (admin.from("whatsapp_broadcasts") as ReturnType<typeof admin.from>)
      .select("sent_count")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startOfMonth.toISOString()) as { data: { sent_count: number }[] | null };
    return data?.reduce((sum, row) => sum + (row.sent_count || 0), 0) ?? 0;
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

    // Fetch subscription tier for quota and subscriber limit
    const tier = session.merchant?.id ? await getWhatsAppPlanTier(session.merchant.id) : null;
    const quota = monthlyQuotaForTier(tier);

    const used = await getMonthlyBroadcastUsage(session.restaurant.id);
    if (used >= quota) {
      return {
        success: false,
        sent: 0,
        error: `Quota mensuel atteint (${quota} messages/mois). Renouvellement le 1er du mois prochain.`,
        quotaUsed: used,
        quotaMax: quota,
      };
    }

    const remaining = quota - used;

    // Optional recipient filter — array of subscriber IDs
    const selectedIdsRaw = formData.get("selectedIds") as string | null;
    let selectedPhones: string[] | undefined;
    if (selectedIdsRaw) {
      const selectedIds: string[] = JSON.parse(selectedIdsRaw);
      if (selectedIds.length > 0) {
        const admin = createAdminClient();
        const { data: rows } = await (admin.from("whatsapp_subscribers") as ReturnType<typeof admin.from>)
          .select("phone")
          .eq("restaurant_id", session.restaurant.id)
          .eq("is_active", true)
          .in("id", selectedIds) as { data: { phone: string }[] | null };
        selectedPhones = rows?.map((r) => r.phone) ?? [];
      }
    }

    // Block if the planned send would exceed the remaining quota
    const plannedCount = selectedPhones ? selectedPhones.length : (tier ?? 50);
    if (plannedCount > remaining) {
      return {
        success: false,
        sent: 0,
        error: `Quota insuffisant : il vous reste ${remaining} message${remaining > 1 ? "s" : ""} ce mois (vous tentez d'en envoyer ${plannedCount}).`,
        quotaUsed: used,
        quotaMax: quota,
      };
    }

    const { sent, wamids } = await sendWhatsAppBroadcast({
      restaurantId: session.restaurant.id,
      restaurantName: session.restaurant.name_fr,
      message,
      selectedPhones,
      tierLimit: tier ?? 50,
    });

    // Save broadcast + wamid tracking (non-blocking)
    try {
      const adminForHistory = createAdminClient();
      const { data: inserted } = await (adminForHistory.from("whatsapp_broadcasts") as ReturnType<typeof adminForHistory.from>)
        .insert({
          restaurant_id: session.restaurant.id,
          message,
          image_url: null,
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

    return { success: true, sent, error: null, quotaUsed: used + 1, quotaMax: quota };
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
