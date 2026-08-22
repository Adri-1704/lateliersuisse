"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { PLAN_DETAILS } from "@/lib/stripe";
import type { Subscription, DbRestaurant } from "@/lib/supabase/types";
import { requireAdmin } from "@/actions/admin/auth";

// ── Types ─────────────────────────────────────────────────────
export interface SaaSMetrics {
  // Revenue
  mrr: number;
  arr: number;
  revenueTotalEstime: number;

  // Growth
  mom: number; // percentage
  newSubscribersThisMonth: number;
  newSubscribersPrevMonth: number;

  // Retention
  churnRate: number;
  activeSubscribers: number;
  trialingSubscribers: number;
  trialConversionRate: number;

  // Clients
  totalMerchants: number;
  totalClaimRequests: number;
  claimsApproved: number;
  claimsPending: number;
  claimsRejected: number;
  claimToSubscriberRate: number;

  // Distribution
  subscribersByPlan: {
    monthly: number;
    semiannual: number;
    annual: number;
  };
  subscribersByCanton: { canton: string; count: number }[];

  // Operational
  totalPublishedRestaurants: number;
  claimedRestaurants: number;
  claimRate: number;
}

// ── Helper: monthly revenue for a single subscription ─────────
// Grille tarifaire unique par palier d'abonnés WhatsApp (50/100/200) — voir
// PLAN_DETAILS dans src/lib/stripe.ts. NB : les éventuels abonnés legacy
// encore sur l'ancien prix "catalogue" (is_early_bird = false, avant le
// 2026-08-22) sont ici estimés au tarif unique en vigueur, potentiellement
// inférieur à ce qu'ils paient réellement sur leur abonnement Stripe existant
// (leur prix Stripe n'est pas modifié par ce changement — voir rapport) : le
// MRR calculé ici peut donc légèrement sous-estimer la réalité tant que de
// tels abonnés existent. À vérifier en recette (nombre d'abonnés
// is_early_bird = false actifs/trialing).
function computeMonthlyRevenue(
  planType: string,
  whatsappTier: 50 | 100 | 200
): number {
  const tierPlans = PLAN_DETAILS[whatsappTier];
  const price = tierPlans?.[planType as keyof typeof tierPlans];
  if (typeof price !== "number") return 0;

  switch (planType) {
    case "monthly":
      return price; // already monthly
    case "semiannual":
      return price / 6;
    case "annual":
      return price / 12;
    default:
      return 0;
  }
}

// ── Main query ────────────────────────────────────────────────
export async function getSaaSMetrics(): Promise<SaaSMetrics> {
  await requireAdmin();
  try {
    const supabase = createAdminClient();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    // ── Parallel queries ──────────────────────────────────────
    const [
      allSubscriptions,
      newThisMonth,
      newPrevMonth,
      canceledThisMonth,
      activeStartOfMonth,
      merchants,
      claimRequests,
      publishedRestaurants,
      claimedRestaurants,
    ] = await Promise.all([
      // All active/trialing subscriptions (for MRR + distribution)
      supabase
        .from("subscriptions")
        .select("*")
        .in("status", ["active", "trialing"]),

      // New subscriptions this month
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth),

      // New subscriptions previous month
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfPrevMonth)
        .lte("created_at", endOfPrevMonth),

      // Canceled this month (for churn)
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "canceled")
        .gte("updated_at", startOfMonth),

      // Active at start of month (approximation: created before this month and not canceled before)
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .in("status", ["active", "trialing", "canceled"])
        .lt("created_at", startOfMonth),

      // Total merchants
      supabase
        .from("merchants")
        .select("id", { count: "exact", head: true }),

      // All claim requests
      (supabase.from("claim_requests") as ReturnType<typeof supabase.from>)
        .select("*"),

      // Published restaurants
      supabase
        .from("restaurants")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),

      // Claimed restaurants
      supabase
        .from("restaurants")
        .select("id", { count: "exact", head: true })
        .eq("claim_status", "claimed"),
    ]);

    // ── Trial conversion: all-time trials that ended ──────────
    const { data: rawTrialsEnded } = await supabase
      .from("subscriptions")
      .select("*")
      .in("status", ["active", "canceled", "past_due"]);
    const allTrialsEnded = ((rawTrialsEnded || []) as Subscription[]).filter(
      (s) => s.stripe_subscription_id !== null || s.stripe_checkout_session_id !== null
    );

    // We consider that a subscription that was once trialing and is now active = converted
    // Approximation: subscriptions that are active AND were created more than 14 days ago
    const { count: convertedTrials } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .not("stripe_subscription_id", "is", null)
      .lt("created_at", new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString());

    // ── Subscribers by canton (via restaurant) ────────────────
    const { data: rawCantonData } = await supabase
      .from("restaurants")
      .select("*")
      .eq("claim_status", "claimed")
      .not("merchant_id", "is", null);
    const cantonData = (rawCantonData || []) as DbRestaurant[];

    // ── Compute metrics ───────────────────────────────────────
    const allSubs = (allSubscriptions.data || []) as Subscription[];
    // Exclude comp/owner accounts (no Stripe payment of any kind)
    const subs = allSubs.filter(
      (s) => s.stripe_subscription_id !== null || s.stripe_checkout_session_id !== null
    );

    // MRR
    let mrr = 0;
    const byPlan = { monthly: 0, semiannual: 0, annual: 0 };
    let activeCount = 0;
    let trialingCount = 0;

    for (const sub of subs) {
      if (sub.status === "active") activeCount++;
      if (sub.status === "trialing") trialingCount++;

      if (sub.plan_type in byPlan) {
        byPlan[sub.plan_type as keyof typeof byPlan]++;
      }

      // Only count subscriptions with a confirmed Stripe payment in MRR
      if (sub.status === "active" && sub.stripe_subscription_id) {
        mrr += computeMonthlyRevenue(sub.plan_type, sub.whatsapp_tier ?? 100);
      }
    }

    const activeSubscribers = activeCount + trialingCount;

    // ARR
    const arr = mrr * 12;

    // Revenue total estimé
    const revenueTotalEstime = arr;

    // MoM: we need last month's MRR — approximate from new subscribers
    // Better approach: compare current new vs prev month new
    const newThisMonthCount = newThisMonth.count || 0;
    const newPrevMonthCount = newPrevMonth.count || 0;
    const mom = newPrevMonthCount > 0
      ? ((newThisMonthCount - newPrevMonthCount) / newPrevMonthCount) * 100
      : newThisMonthCount > 0 ? 100 : 0;

    // Churn
    const canceledCount = canceledThisMonth.count || 0;
    const activeAtStart = activeStartOfMonth.count || 0;
    const churnRate = activeAtStart > 0
      ? (canceledCount / activeAtStart) * 100
      : 0;

    // Trial conversion
    const totalTrialsEnded = allTrialsEnded.length;
    const converted = convertedTrials || 0;
    const trialConversionRate = totalTrialsEnded > 0
      ? (converted / totalTrialsEnded) * 100
      : 0;

    // Claims — cast to a concrete shape because of the ReturnType cast above
    const claims = (claimRequests.data || []) as Array<{ status: string; merchant_id: string }>;
    const claimsApproved = claims.filter((c) => c.status === "approved").length;
    const claimsPending = claims.filter((c) => c.status === "pending").length;
    const claimsRejected = claims.filter((c) => c.status === "rejected").length;

    // Claim → subscriber rate
    const approvedMerchantIds = new Set(
      claims
        .filter((c) => c.status === "approved")
        .map((c) => c.merchant_id)
    );
    const activeMerchantIds = new Set(subs.map((s) => s.merchant_id));
    const claimToSub = approvedMerchantIds.size > 0
      ? ([...approvedMerchantIds].filter((id) => activeMerchantIds.has(id)).length / approvedMerchantIds.size) * 100
      : 0;

    // Subscribers by canton
    const cantonMap = new Map<string, Set<string>>();
    for (const r of cantonData) {
      if (r.canton && r.merchant_id) {
        if (!cantonMap.has(r.canton)) cantonMap.set(r.canton, new Set());
        cantonMap.get(r.canton)!.add(r.merchant_id);
      }
    }
    const subscribersByCanton = [...cantonMap.entries()]
      .map(([canton, merchants]) => ({
        canton,
        count: [...merchants].filter((id) => activeMerchantIds.has(id)).length,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    // Restaurant stats
    const totalPublished = publishedRestaurants.count || 0;
    const totalClaimed = claimedRestaurants.count || 0;
    const claimRate = totalPublished > 0
      ? (totalClaimed / totalPublished) * 100
      : 0;

    return {
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      revenueTotalEstime: Math.round(revenueTotalEstime * 100) / 100,
      mom: Math.round(mom * 10) / 10,
      newSubscribersThisMonth: newThisMonthCount,
      newSubscribersPrevMonth: newPrevMonthCount,
      churnRate: Math.round(churnRate * 10) / 10,
      activeSubscribers,
      trialingSubscribers: trialingCount,
      trialConversionRate: Math.round(trialConversionRate * 10) / 10,
      totalMerchants: merchants.count || 0,
      totalClaimRequests: claims.length,
      claimsApproved,
      claimsPending,
      claimsRejected,
      claimToSubscriberRate: Math.round(claimToSub * 10) / 10,
      subscribersByPlan: byPlan,
      subscribersByCanton,
      totalPublishedRestaurants: totalPublished,
      claimedRestaurants: totalClaimed,
      claimRate: Math.round(claimRate * 10) / 10,
    };
  } catch {
    // Fallback: return zeroes when Supabase is not configured
    return {
      mrr: 0, arr: 0, revenueTotalEstime: 0,
      mom: 0, newSubscribersThisMonth: 0, newSubscribersPrevMonth: 0,
      churnRate: 0, activeSubscribers: 0, trialingSubscribers: 0, trialConversionRate: 0,
      totalMerchants: 0, totalClaimRequests: 0,
      claimsApproved: 0, claimsPending: 0, claimsRejected: 0, claimToSubscriberRate: 0,
      subscribersByPlan: { monthly: 0, semiannual: 0, annual: 0 },
      subscribersByCanton: [],
      totalPublishedRestaurants: 0, claimedRestaurants: 0, claimRate: 0,
    };
  }
}
