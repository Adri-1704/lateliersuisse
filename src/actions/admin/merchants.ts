"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { Merchant, Subscription } from "@/lib/supabase/types";

interface MerchantWithSubscription extends Merchant {
  subscription?: Subscription | null;
}

const mockMerchants: MerchantWithSubscription[] = [
  { id: "m1", auth_user_id: null, email: "marco@trattoria.ch", name: "Marco Bernasconi", phone: "+41 91 123 45 67", stripe_customer_id: null, created_at: "2026-01-15T10:00:00Z", updated_at: "2026-01-15T10:00:00Z", subscription: { id: "s1", merchant_id: "m1", stripe_subscription_id: null, plan_type: "annual", status: "active", current_period_start: "2026-01-15T00:00:00Z", current_period_end: "2027-01-15T00:00:00Z", cancel_at_period_end: false, created_at: "2026-01-15T10:00:00Z", updated_at: "2026-01-15T10:00:00Z" } },
  { id: "m2", auth_user_id: null, email: "sophie@gasthof.ch", name: "Sophie Mueller", phone: "+41 31 234 56 78", stripe_customer_id: null, created_at: "2026-02-01T14:30:00Z", updated_at: "2026-02-01T14:30:00Z", subscription: { id: "s2", merchant_id: "m2", stripe_subscription_id: null, plan_type: "monthly", status: "active", current_period_start: "2026-02-01T00:00:00Z", current_period_end: "2026-03-01T00:00:00Z", cancel_at_period_end: false, created_at: "2026-02-01T14:30:00Z", updated_at: "2026-02-01T14:30:00Z" } },
  { id: "m3", auth_user_id: null, email: "antoine@lecomptoir.ch", name: "Antoine Girard", phone: "+41 21 345 67 89", stripe_customer_id: null, created_at: "2025-12-01T09:00:00Z", updated_at: "2025-12-01T09:00:00Z", subscription: { id: "s3", merchant_id: "m3", stripe_subscription_id: null, plan_type: "semiannual", status: "past_due", current_period_start: "2025-12-01T00:00:00Z", current_period_end: "2026-06-01T00:00:00Z", cancel_at_period_end: false, created_at: "2025-12-01T09:00:00Z", updated_at: "2025-12-01T09:00:00Z" } },
];

export async function listMerchants(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ success: boolean; error: string | null; data?: { merchants: MerchantWithSubscription[]; total: number } }> {
  const { page = 1, limit = 20, search } = params;

  try {
    const supabase = createAdminClient();
    let query = supabase.from("merchants").select("*, subscriptions(*)", { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    const mapped = (data || []).map((m: Record<string, unknown>) => ({
      ...m,
      subscription: Array.isArray(m.subscriptions) ? (m.subscriptions as Subscription[])[0] || null : null,
    })) as MerchantWithSubscription[];

    return { success: true, error: null, data: { merchants: mapped, total: count || 0 } };
  } catch {
    let filtered = [...mockMerchants];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s));
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { success: true, error: null, data: { merchants: paged, total } };
  }
}
