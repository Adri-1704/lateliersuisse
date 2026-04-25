"use server";

import { createAdminClient } from "@/lib/supabase/server";

/**
 * Conversion event types we track in the funnel.
 *
 * - signup_started: form opened (TODO: hook into UI)
 * - signup_completed: merchant account created
 * - checkout_initiated: Stripe Checkout session created
 * - payment_success: Stripe webhook checkout.session.completed
 * - subscription_active: subscription becomes active (post-trial conversion)
 * - subscription_canceled: subscription canceled
 * - affiliate_recruit: a new merchant signed up via someone's ref code
 */
export type ConversionEventType =
  | "signup_started"
  | "signup_completed"
  | "checkout_initiated"
  | "payment_success"
  | "subscription_active"
  | "subscription_canceled"
  | "affiliate_recruit";

interface LogConversionParams {
  eventType: ConversionEventType;
  merchantId?: string | null;
  affiliateRef?: string | null;
  planType?: string | null;
  amountChf?: number | null;
  metadata?: Record<string, unknown>;
}

/**
 * Logs a conversion event. Non-blocking and silent on failure
 * (we never want analytics to break the actual flow).
 */
export async function logConversionEvent(
  params: LogConversionParams
): Promise<void> {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("conversion_events") as any).insert({
      event_type: params.eventType,
      merchant_id: params.merchantId || null,
      affiliate_ref: params.affiliateRef || null,
      plan_type: params.planType || null,
      amount_chf: params.amountChf ?? null,
      metadata: params.metadata || null,
    });
  } catch (err) {
    // Silent fail — analytics must never break the user flow.
    console.warn("[conversion] Failed to log event:", params.eventType, err);
  }
}
