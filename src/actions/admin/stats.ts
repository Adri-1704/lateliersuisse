"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { PLAN_DETAILS, EARLY_BIRD_LIMIT } from "@/lib/stripe";
import type { Subscription, DbRestaurant } from "@/lib/supabase/types";

// ── Types ─────────────────────────────────────────────────────
export interface SaaSMetrics {
  // Revenue
  mrr: number;
  arr: number;
  revenueLifetime: number;
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
    lifetime: number;
  };
  earlyBirdCount: number;
  standardCount: number;
  subscribersByCanton: { canton: string; count: number }[];

  // Operational
  earlyBirdSpotsRemaining: number;
  totalPublishedRestaurants: number;
  claimedRestaurants: number;
  claimRate: number;
}

// ── Helper: monthly revenue for a single subscription ─────────
function computeMonthlyRevenue(
  planType: string,
  isEarlyBird: boolean
): number {
  const plan = PLAN_DETAILS[planType as keyof typeof PLAN_DETAILS];
  if (!plan) return 0;

  const price = isEarlyBird ? plan.priceEarly : plan.price;

  switch (planType) {
    case "monthly":
      return price; // already monthly
    case "semiannual":
      return price / 6;
    case "annual":
      return price / 12;
    case "lifetime":
      return 0; // one-time, not recurring
    default:
      return 0;
  }
}

// ── Main query ────────────────────────────────────────────────
export async function getSaaSMetrics(): Promise<SaaSMetrics> {
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
    const allTrialsEnded = (rawTrialsEnded || []) as Subscription[];

    // We consider that a subscription that was once trialing and is now active = converted
    // Approximation: subscriptions that are active AND were created more than 14 days ago
    const { count: convertedTrials } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .lt("created_at", new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString());

    // ── Subscribers by canton (via restaurant) ────────────────
    const { data: rawCantonData } = await supabase
      .from("restaurants")
      .select("*")
      .eq("claim_status", "claimed")
      .not("merchant_id", "is", null);
    const cantonData = (rawCantonData || []) as DbRestaurant[];

    // ── Compute metrics ───────────────────────────────────────
    const subs = (allSubscriptions.data || []) as Subscription[];

    // MRR
    let mrr = 0;
    const byPlan = { monthly: 0, semiannual: 0, annual: 0, lifetime: 0 };
    let earlyBirdCount = 0;
    let standardCount = 0;
    let activeCount = 0;
    let trialingCount = 0;

    for (const sub of subs) {
      const monthlyRev = computeMonthlyRevenue(sub.plan_type, sub.is_early_bird);
      mrr += monthlyRev;

      if (sub.plan_type in byPlan) {
        byPlan[sub.plan_type as keyof typeof byPlan]++;
      }

      if (sub.is_early_bird) earlyBirdCount++;
      else standardCount++;

      if (sub.status === "active") activeCount++;
      if (sub.status === "trialing") trialingCount++;
    }

    const activeSubscribers = activeCount + trialingCount;

    // ARR
    const arr = mrr * 12;

    // Lifetime revenue
    const lifetimeCount = byPlan.lifetime;
    const revenueLifetime = lifetimeCount * PLAN_DETAILS.lifetime.price;

    // Revenue total estimé
    const revenueTotalEstime = arr + revenueLifetime;

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

    // Early bird spots
    const earlyBirdSpotsRemaining = Math.max(0, EARLY_BIRD_LIMIT - earlyBirdCount);

    // Restaurant stats
    const totalPublished = publishedRestaurants.count || 0;
    const totalClaimed = claimedRestaurants.count || 0;
    const claimRate = totalPublished > 0
      ? (totalClaimed / totalPublished) * 100
      : 0;

    return {
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      revenueLifetime,
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
      earlyBirdCount,
      standardCount,
      subscribersByCanton,
      earlyBirdSpotsRemaining,
      totalPublishedRestaurants: totalPublished,
      claimedRestaurants: totalClaimed,
      claimRate: Math.round(claimRate * 10) / 10,
    };
  } catch {
    // Fallback: return zeroes when Supabase is not configured
    return {
      mrr: 0, arr: 0, revenueLifetime: 0, revenueTotalEstime: 0,
      mom: 0, newSubscribersThisMonth: 0, newSubscribersPrevMonth: 0,
      churnRate: 0, activeSubscribers: 0, trialingSubscribers: 0, trialConversionRate: 0,
      totalMerchants: 0, totalClaimRequests: 0,
      claimsApproved: 0, claimsPending: 0, claimsRejected: 0, claimToSubscriberRate: 0,
      subscribersByPlan: { monthly: 0, semiannual: 0, annual: 0, lifetime: 0 },
      earlyBirdCount: 0, standardCount: 0, subscribersByCanton: [],
      earlyBirdSpotsRemaining: EARLY_BIRD_LIMIT,
      totalPublishedRestaurants: 0, claimedRestaurants: 0, claimRate: 0,
    };
  }
}
