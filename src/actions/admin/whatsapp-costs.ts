"use server";

import { createAdminClient } from "@/lib/supabase/server";

// Meta Cloud API pricing — marketing messages, Switzerland ("Rest of Western Europe")
// Model: per-message (since July 1, 2025 — replaced per-conversation billing)
// Source: plivo.com/whatsapp-message/pricing/ch/ → $0.0651/message
// Verify in Meta Business Manager → Paramètres → Facturation → Détail des transactions
export const META_MARKETING_PRICE_USD = 0.0651;

export interface RestaurantCost {
  id: string;
  name: string;
  city: string | null;
  broadcastCount: number;
  totalMessages: number;
  costUsd: number;
  lastBroadcastAt: string | null;
}

export interface MonthlyStat {
  month: string; // "2026-06"
  broadcasts: number;
  messages: number;
  costUsd: number;
}

export interface WhatsAppCostsData {
  byRestaurant: RestaurantCost[];
  byMonth: MonthlyStat[];
  totalBroadcasts: number;
  allTimeMessages: number;
  allTimeCostUsd: number;
  thisMonthMessages: number;
  thisMonthCostUsd: number;
}

interface BroadcastRow {
  restaurant_id: string;
  sent_count: number;
  created_at: string;
}

interface RestaurantRow {
  id: string;
  name_fr: string | null;
  city: string | null;
}

export async function getWhatsAppCosts(): Promise<WhatsAppCostsData> {
  const supabase = createAdminClient();

  const empty: WhatsAppCostsData = {
    byRestaurant: [],
    byMonth: [],
    totalBroadcasts: 0,
    allTimeMessages: 0,
    allTimeCostUsd: 0,
    thisMonthMessages: 0,
    thisMonthCostUsd: 0,
  };

  // whatsapp_broadcasts is not in generated types — cast explicitly
  const broadcastsQuery = (supabase as ReturnType<typeof createAdminClient>)
    .from("whatsapp_broadcasts")
    .select("restaurant_id, sent_count, created_at")
    .order("created_at", { ascending: false });

  const { data: rawRows, error } = await broadcastsQuery as unknown as {
    data: BroadcastRow[] | null;
    error: unknown;
  };

  if (error || !rawRows || rawRows.length === 0) return empty;

  // Fetch restaurant names for restaurants that have broadcasts
  const restaurantIds = [...new Set(rawRows.map((r) => r.restaurant_id))];
  const { data: restaurantRows } = await supabase
    .from("restaurants")
    .select("id, name_fr, city")
    .in("id", restaurantIds) as { data: RestaurantRow[] | null; error: unknown };

  const restaurantIndex = new Map<string, RestaurantRow>(
    (restaurantRows ?? []).map((r) => [r.id, r])
  );

  const restaurantMap = new Map<string, RestaurantCost>();
  const monthMap = new Map<string, MonthlyStat>();

  const now = new Date();
  const thisMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  for (const row of rawRows) {
    const rid = row.restaurant_id;
    const messages = row.sent_count ?? 0;
    const date = new Date(row.created_at);
    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const restaurant = restaurantIndex.get(rid);

    if (!restaurantMap.has(rid)) {
      restaurantMap.set(rid, {
        id: rid,
        name: restaurant?.name_fr || "—",
        city: restaurant?.city ?? null,
        broadcastCount: 0,
        totalMessages: 0,
        costUsd: 0,
        lastBroadcastAt: null,
      });
    }
    const r = restaurantMap.get(rid)!;
    r.broadcastCount += 1;
    r.totalMessages += messages;
    r.costUsd = +(r.totalMessages * META_MARKETING_PRICE_USD).toFixed(4);
    if (!r.lastBroadcastAt || row.created_at > r.lastBroadcastAt) {
      r.lastBroadcastAt = row.created_at;
    }

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { month: monthKey, broadcasts: 0, messages: 0, costUsd: 0 });
    }
    const m = monthMap.get(monthKey)!;
    m.broadcasts += 1;
    m.messages += messages;
    m.costUsd = +(m.messages * META_MARKETING_PRICE_USD).toFixed(4);
  }

  const byRestaurant = Array.from(restaurantMap.values()).sort((a, b) => b.costUsd - a.costUsd);
  const byMonth = Array.from(monthMap.values()).sort((a, b) => b.month.localeCompare(a.month));

  const allTimeMessages = byRestaurant.reduce((s, r) => s + r.totalMessages, 0);
  const thisMonthMessages = monthMap.get(thisMonthKey)?.messages ?? 0;

  return {
    byRestaurant,
    byMonth,
    totalBroadcasts: rawRows.length,
    allTimeMessages,
    allTimeCostUsd: +(allTimeMessages * META_MARKETING_PRICE_USD).toFixed(4),
    thisMonthMessages,
    thisMonthCostUsd: +(thisMonthMessages * META_MARKETING_PRICE_USD).toFixed(4),
  };
}
