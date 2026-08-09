import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import {
  paymentConfirmation,
  merchantWelcome,
  subscriptionPaymentAdminNotification,
} from "@/lib/email-templates";
import { createServerClient } from "@supabase/ssr";
import { logConversionEvent } from "@/lib/analytics/conversion-events";

// Statuts Stripe possibles : active, past_due, unpaid, canceled, incomplete,
// incomplete_expired, trialing, paused. Notre colonne DB (SubscriptionStatus,
// src/lib/supabase/types.ts) n'en connaît que 5 — "trialing" en particulier
// doit être préservé (sinon un client en plein essai gratuit affiche le
// badge rouge "Paiement en retard" au lieu du badge bleu "Période d'essai").
// Les statuts qu'on ne gère pas explicitement (unpaid, incomplete_expired,
// paused) retombent sur "past_due" par prudence plutôt que de planter l'insert.
function mapStripeStatus(
  stripeStatus: string
): "active" | "past_due" | "canceled" | "incomplete" | "trialing" {
  switch (stripeStatus) {
    case "active":
    case "trialing":
    case "canceled":
    case "incomplete":
      return stripeStatus;
    default:
      return "past_due";
  }
}

/**
 * Handle Stripe webhook events for subscription lifecycle.
 * Called EXCLUSIVEMENT depuis /api/webhooks/stripe/route.ts, après
 * vérification de la signature Stripe (stripe.webhooks.constructEvent).
 *
 * IMPORTANT : ce module n'est PAS "use server" — il ne doit jamais être
 * exposé comme Server Action (endpoint Next appelable publiquement sans
 * vérification de signature). Voir src/actions/subscriptions.ts pour le
 * détail de la faille corrigée.
 *
 * PR 2 change: merchant must already exist (created during signup).
 * The webhook reads metadata.merchant_id to link the subscription.
 * Falls back to legacy flow (create merchant from email) for old sessions.
 */
export async function handleSubscriptionWebhook(
  eventType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): Promise<void> {
  switch (eventType) {
    case "checkout.session.completed": {
      console.log("Checkout completed:", data.id);

      try {
        const supabase = createAdminClient();
        const metadata = data.metadata || {};
        const isLifetime = data.mode === "payment";
        const merchantId = metadata.merchant_id;

        // ── Resolve merchant ──
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let merchant: any = null;

        if (merchantId) {
          // New flow: merchant already exists
          const { data: existing } = await supabase
            .from("merchants")
            .select("*")
            .eq("id", merchantId)
            .single();
          merchant = existing;

          if (!merchant) {
            console.warn(`[Webhook] merchant_id ${merchantId} from metadata not found in DB — skipping.`);
            return;
          }

          // Update stripe_customer_id if not yet set
          if (!merchant.stripe_customer_id && data.customer) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from("merchants") as any)
              .update({ stripe_customer_id: data.customer })
              .eq("id", merchant.id);
          }
        } else {
          // Legacy flow (B2BPricing without signup): upsert merchant from email
          console.log("[Webhook] No merchant_id in metadata — using legacy flow (upsert by email)");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: upserted } = await (supabase.from("merchants") as any)
            .upsert(
              {
                email: data.customer_email,
                name: metadata.merchant_name || data.customer_email,
                phone: metadata.merchant_phone || null,
                stripe_customer_id: data.customer,
              },
              { onConflict: "email" }
            )
            .select()
            .single();
          merchant = upserted;

          if (!merchant) {
            console.error("[Webhook] Failed to upsert merchant from email");
            return;
          }

          // Legacy: create auth user + send welcome email (as before)
          try {
            const adminAuth = createServerClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
              { cookies: { getAll() { return []; }, setAll() {} } }
            );

            const { data: authUser, error: authError } = await adminAuth.auth.admin.createUser({
              email: data.customer_email,
              email_confirm: true,
            });

            if (authError && authError.message?.includes("already been registered")) {
              const { data: existingUsers } = await adminAuth.auth.admin.listUsers();
              const existingUser = existingUsers?.users?.find((u: { email?: string }) => u.email === data.customer_email);
              if (existingUser) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from("merchants") as any)
                  .update({ auth_user_id: existingUser.id })
                  .eq("id", merchant.id);
              }
            } else if (authUser?.user) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase.from("merchants") as any)
                .update({ auth_user_id: authUser.user.id })
                .eq("id", merchant.id);

              const { data: linkData } = await adminAuth.auth.admin.generateLink({
                type: "recovery",
                email: data.customer_email,
              });
              const recoveryUrl = linkData?.properties?.action_link || "";
              if (recoveryUrl && data.customer_email) {
                const locale = metadata.locale || "fr";
                const template = merchantWelcome(
                  {
                    merchantName: metadata.merchant_name || "",
                    merchantEmail: data.customer_email,
                    restaurantName: metadata.restaurant_name || "",
                    passwordResetUrl: recoveryUrl,
                  },
                  locale
                );
                await sendEmail({ to: data.customer_email, subject: template.subject, html: template.html });
              }
            }
          } catch (authErr) {
            console.error("Auth user creation error (legacy):", authErr);
          }
        }

        // ── Create subscription record (idempotent — C3 fix) ──
        const isEarlyBird = metadata.is_early_bird === "true" || metadata.early_bird === "true";
        const planType = metadata.plan_type || (isLifetime ? "lifetime" : "monthly");
        const checkoutSessionId: string = data.id; // cs_xxx — unique per checkout

        // Skip if we already processed this checkout session (idempotence guard)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingSub } = await (supabase.from("subscriptions") as any)
          .select("id")
          .eq("stripe_checkout_session_id", checkoutSessionId)
          .maybeSingle();

        // Un partenaire comme Aligro communique un code promo directement à
        // ses clients (pas de lien cliqué, donc pas de cookie jt_ref) : on
        // récupère le code réellement rédimé sur la session Stripe et on le
        // range dans affiliate_ref, pour qu'il apparaisse dans le même
        // dashboard /admin/affiliations que les parrainages classiques.
        let redeemedPromoCode: string | null = null;
        try {
          const stripe = getStripe();
          const fullSession = await stripe.checkout.sessions.retrieve(data.id, {
            expand: ["discounts.promotion_code"],
          });
          const promo = fullSession.discounts?.[0]?.promotion_code;
          if (promo && typeof promo === "object") {
            redeemedPromoCode = promo.code || null;
          }
        } catch (err) {
          console.error("[Webhook] Impossible de récupérer le code promo Stripe:", err);
        }

        const affiliateRef = metadata.affiliate_ref || redeemedPromoCode || null;

        if (existingSub) {
          console.log(`[Webhook] Subscription for checkout ${checkoutSessionId} already exists — skipping (idempotent).`);
        } else if (isLifetime) {
          // Lifetime: one-time payment -> subscription record with status active, no period end
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("subscriptions") as any).insert({
            merchant_id: merchant.id,
            stripe_subscription_id: data.payment_intent || data.id,
            stripe_checkout_session_id: checkoutSessionId,
            plan_type: "lifetime",
            status: "active",
            is_early_bird: isEarlyBird,
            current_period_start: new Date().toISOString(),
            current_period_end: "2099-12-31T23:59:59.000Z",
            affiliate_ref: affiliateRef,
          });

          // Log payment + affiliate recruit events
          const amount = data.amount_total ? data.amount_total / 100 : null;
          void logConversionEvent({
            eventType: "payment_success",
            merchantId: merchant.id,
            affiliateRef,
            planType: "lifetime",
            amountChf: amount,
            metadata: { is_early_bird: isEarlyBird, mode: "lifetime" },
          });
          if (affiliateRef) {
            void logConversionEvent({
              eventType: "affiliate_recruit",
              merchantId: merchant.id,
              affiliateRef,
              planType: "lifetime",
              amountChf: amount,
            });
          }
        } else {
          // Subscription mode — le statut réel (souvent "trialing" si
          // TRIAL_DAYS est configuré) doit venir de Stripe, pas être forcé
          // à "active" ici : sinon un client en plein essai gratuit voit
          // un badge "Paiement en retard" au lieu de "Période d'essai".
          let initialStatus: ReturnType<typeof mapStripeStatus> = "active";
          if (data.subscription) {
            try {
              const stripe = getStripe();
              const stripeSub = await stripe.subscriptions.retrieve(data.subscription as string);
              initialStatus = mapStripeStatus(stripeSub.status);
            } catch (err) {
              console.error("[Webhook] Impossible de récupérer le statut réel de la subscription:", err);
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("subscriptions") as any).insert({
            merchant_id: merchant.id,
            stripe_subscription_id: data.subscription || data.payment_intent,
            stripe_checkout_session_id: checkoutSessionId,
            plan_type: planType,
            status: initialStatus,
            is_early_bird: isEarlyBird,
            affiliate_ref: affiliateRef,
            whatsapp_tier: metadata.whatsapp_tier ? Number(metadata.whatsapp_tier) : 100,
            current_period_start: new Date().toISOString(),
          });

          // Log payment + affiliate recruit events
          const amount = data.amount_total ? data.amount_total / 100 : null;
          void logConversionEvent({
            eventType: "payment_success",
            merchantId: merchant.id,
            affiliateRef,
            planType,
            amountChf: amount,
            metadata: { is_early_bird: isEarlyBird, mode: "subscription" },
          });
          if (affiliateRef) {
            void logConversionEvent({
              eventType: "affiliate_recruit",
              merchantId: merchant.id,
              affiliateRef,
              planType,
              amountChf: amount,
            });
          }
        }
      } catch (err) {
        console.error("Supabase error in checkout.session.completed:", err);
      }

      // Send payment confirmation email
      try {
        const metadata = data.metadata || {};
        const locale = metadata.locale || "fr";

        // For new flow, get merchant name from DB
        let merchantName = metadata.merchant_name || "";
        const restaurantName = metadata.restaurant_name || "";
        if (metadata.merchant_id && !merchantName) {
          const supabase = createAdminClient();
          const { data: m } = await supabase
            .from("merchants")
            .select("name, email")
            .eq("id", metadata.merchant_id)
            .single() as { data: { name: string; email: string } | null; error: unknown };
          if (m) merchantName = m.name;
        }

        const template = paymentConfirmation(
          {
            merchantName,
            merchantEmail: data.customer_email || "",
            restaurantName,
            planType: metadata.plan_type || "",
          },
          locale
        );

        if (data.customer_email) {
          await sendEmail({ to: data.customer_email, subject: template.subject, html: template.html });
        }
      } catch (err) {
        console.error("Email error in checkout.session.completed:", err);
      }

      // Notifier l'admin du paiement
      try {
        const metadata = data.metadata || {};
        const isEarlyBird = metadata.is_early_bird === "true" || metadata.early_bird === "true";
        const planType = metadata.plan_type || (data.mode === "payment" ? "lifetime" : "monthly");

        // Récupérer les infos merchant (nouveau flow ou metadata legacy)
        let merchantName = metadata.merchant_name || "";
        const merchantEmail = data.customer_email || metadata.merchant_email || "";
        const restaurantName = metadata.restaurant_name || "";
        if (metadata.merchant_id && !merchantName) {
          const supabase = createAdminClient();
          const { data: m } = await supabase
            .from("merchants")
            .select("name")
            .eq("id", metadata.merchant_id)
            .single() as { data: { name: string } | null; error: unknown };
          if (m) merchantName = m.name;
        }

        const amountFormatted = typeof data.amount_total === "number"
          ? `${(data.amount_total / 100).toFixed(2)} ${(data.currency || "chf").toUpperCase()}`
          : undefined;

        const adminTemplate = subscriptionPaymentAdminNotification({
          merchantName,
          merchantEmail,
          restaurantName,
          planType,
          isEarlyBird,
          amount: amountFormatted,
        });
        const adminEmailAddress = process.env.ADMIN_EMAIL || "contact@just-tag.app";
        await sendEmail({
          to: adminEmailAddress,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          replyTo: merchantEmail || undefined,
        });
      } catch (err) {
        console.error("Admin payment notification error:", err);
      }

      break;
    }

    case "customer.subscription.updated": {
      console.log("Subscription updated:", data.id);

      try {
        const supabase = createAdminClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("subscriptions") as any)
          .update({
            status: mapStripeStatus(data.status),
            current_period_start: new Date(
              data.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              data.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: data.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", data.id);
      } catch (err) {
        console.error(
          "Supabase error in customer.subscription.updated:",
          err
        );
      }

      break;
    }

    case "customer.subscription.deleted": {
      console.log("Subscription canceled:", data.id);

      try {
        const supabase = createAdminClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("subscriptions") as any)
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", data.id);
      } catch (err) {
        console.error(
          "Supabase error in customer.subscription.deleted:",
          err
        );
      }

      break;
    }

    default:
      console.log("Unhandled webhook event:", eventType);
  }
}
