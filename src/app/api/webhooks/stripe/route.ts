import { NextRequest, NextResponse } from "next/server";
import { handleSubscriptionWebhook } from "@/actions/subscriptions";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Stripe Webhook Handler
 *
 * Handles subscription lifecycle events from Stripe.
 * Endpoint: POST /api/webhooks/stripe
 *
 * Configure in Stripe Dashboard:
 * - checkout.session.completed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_failed
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    let event;

    // Verify Stripe signature in production, fallback to JSON.parse in dev
    if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_SECRET_KEY) {
      const { getStripe } = await import("@/lib/stripe");
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      console.warn(
        "[Stripe Webhook] No STRIPE_WEBHOOK_SECRET configured, skipping signature verification"
      );
      event = JSON.parse(body);
    }

    console.log(`Stripe webhook: ${event.type}`);

    // ── Event-level idempotence (C3 fix) ──
    // Check if we already processed this Stripe event ID
    try {
      const supabase = createAdminClient();
      const { data: existingEvent } = await supabase
        .from("stripe_events" as string)
        .select("id")
        .eq("id", event.id)
        .maybeSingle();

      if (existingEvent) {
        console.log(`[Stripe Webhook] Event ${event.id} already processed — skipping.`);
        return NextResponse.json({ received: true, deduplicated: true });
      }

      // Record this event as processed
      await (supabase.from("stripe_events" as string) as ReturnType<typeof supabase.from>)
        .insert({ id: event.id, event_type: event.type });
    } catch (dedupeErr) {
      // If stripe_events table doesn't exist yet, continue processing
      // (the subscription-level idempotence in handleSubscriptionWebhook is the fallback)
      console.warn("[Stripe Webhook] Event dedup check failed (table may not exist yet):", dedupeErr);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleSubscriptionWebhook(
          "checkout.session.completed",
          event.data.object
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionWebhook(
          "customer.subscription.updated",
          event.data.object
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionWebhook(
          "customer.subscription.deleted",
          event.data.object
        );
        break;

      case "invoice.payment_failed":
        console.warn(
          "Payment failed for subscription:",
          event.data.object.subscription
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
