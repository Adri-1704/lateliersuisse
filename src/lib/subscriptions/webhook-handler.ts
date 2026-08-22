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

      // L'offre "à vie" (paiement unique, mode "payment") a été retirée du
      // catalogue — aucun restaurateur ne l'a jamais souscrite. Le code ne
      // crée plus JAMAIS de session en mode "payment" (voir
      // src/actions/subscriptions.ts), mais Stripe peut en théorie encore
      // émettre un tel événement pour un vieux Payment Link créé manuellement
      // dans le Dashboard ou un test. On l'ignore explicitement plutôt que de
      // planter ou d'insérer un abonnement incohérent (plan_type "lifetime"
      // n'a d'ailleurs plus de sens applicatif) : on logue un avertissement
      // et on répond 2xx (voir route.ts) pour que Stripe ne rejoue pas
      // indéfiniment un événement qu'on ne saura jamais traiter.
      if (data.mode === "payment") {
        console.warn(
          `[Webhook] checkout.session.completed en mode "payment" reçu (session ${data.id}) — l'offre à vie n'est plus commercialisée, cet événement est ignoré. Si ce n'est pas un test manuel, vérifier qu'aucun ancien Payment Link Stripe n'est encore actif.`
        );
        return;
      }

      try {
        const supabase = createAdminClient();
        const metadata = data.metadata || {};
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
        const planType = metadata.plan_type || "monthly";
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
          const { error: insertSubError } = await (supabase.from("subscriptions") as any).insert({
            merchant_id: merchant.id,
            stripe_subscription_id: data.subscription || data.payment_intent,
            stripe_checkout_session_id: checkoutSessionId,
            plan_type: planType,
            status: initialStatus,
            // Le tarif de lancement réservé aux 100 premiers a été retiré :
            // il n'existe plus qu'une grille unique. La colonne est conservée
            // pour les abonnés historiques, mais n'est plus jamais vraie.
            is_early_bird: false,
            affiliate_ref: affiliateRef,
            whatsapp_tier: metadata.whatsapp_tier ? Number(metadata.whatsapp_tier) : 100,
            current_period_start: new Date().toISOString(),
          });

          if (insertSubError) {
            throw new Error(
              `[Webhook] Échec de l'insertion de l'abonnement (checkout ${checkoutSessionId}): ${insertSubError.message}`
            );
          }

          // Log payment + affiliate recruit events
          const amount = data.amount_total ? data.amount_total / 100 : null;
          void logConversionEvent({
            eventType: "payment_success",
            merchantId: merchant.id,
            affiliateRef,
            planType,
            amountChf: amount,
            metadata: { mode: "subscription" },
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
        // On ne doit PAS envoyer les emails de confirmation ni marquer
        // l'événement comme traité (voir route.ts) si l'abonnement n'a pas
        // été écrit en base : on propage l'erreur pour que le webhook
        // réponde en non-2xx et que Stripe rejoue l'événement.
        throw err;
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
        const planType = metadata.plan_type || "monthly";

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

        // Depuis l'API Stripe 2025-03-31, current_period_start/end n'existent
        // plus forcément à la racine de l'objet Subscription : ils sont
        // déplacés sur items.data[0].current_period_*. On lit d'abord la
        // valeur "moderne", avec repli sur l'ancienne pour rester compatible
        // quelle que soit la version d'API configurée côté Stripe Dashboard.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const firstItem = data.items?.data?.[0] as any;
        const periodStartRaw = firstItem?.current_period_start ?? data.current_period_start;
        const periodEndRaw = firstItem?.current_period_end ?? data.current_period_end;

        const updatePayload: Record<string, unknown> = {
          status: mapStripeStatus(data.status),
          cancel_at_period_end: data.cancel_at_period_end,
        };

        // On ne construit une Date que si la valeur est un nombre fini —
        // sinon on n'écrit pas le champ plutôt que de planter sur
        // `new Date(NaN).toISOString()`. Le statut, lui, est TOUJOURS mis à
        // jour, même si les dates de période sont indisponibles.
        if (typeof periodStartRaw === "number" && Number.isFinite(periodStartRaw)) {
          updatePayload.current_period_start = new Date(periodStartRaw * 1000).toISOString();
        } else {
          console.warn(
            `[Webhook] current_period_start absent/invalide pour la subscription ${data.id} — champ non mis à jour.`
          );
        }
        if (typeof periodEndRaw === "number" && Number.isFinite(periodEndRaw)) {
          updatePayload.current_period_end = new Date(periodEndRaw * 1000).toISOString();
        } else {
          console.warn(
            `[Webhook] current_period_end absent/invalide pour la subscription ${data.id} — champ non mis à jour.`
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("subscriptions") as any)
          .update(updatePayload)
          .eq("stripe_subscription_id", data.id);

        if (error) {
          throw new Error(
            `[Webhook] Échec de la mise à jour de la subscription ${data.id}: ${error.message}`
          );
        }
      } catch (err) {
        console.error(
          "Supabase error in customer.subscription.updated:",
          err
        );
        throw err;
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
