"use server";

import { getStripe, getPriceId, TRIAL_DAYS, EARLY_BIRD_LIMIT } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { paymentConfirmation, merchantWelcome, freeTrialWelcome, freeTrialAdminNotification } from "@/lib/email-templates";
import { createServerClient } from "@supabase/ssr";

// ────────────────────────────────────────────────────────────────────────────
// Early Bird seats counter (used by signup flow + landing page)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Returns how many Early Bird seats are still available (out of 100).
 * Counts subscriptions with is_early_bird = true AND status active/trialing.
 */
export async function getEarlyBirdSeatsAvailable(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("is_early_bird", true)
      .in("status", ["active", "trialing"]);

    const taken = count || 0;
    return Math.max(0, EARLY_BIRD_LIMIT - taken);
  } catch {
    // If query fails, assume seats available (don't block sales)
    return EARLY_BIRD_LIMIT;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Checkout session (unified: subscription + lifetime)
// ────────────────────────────────────────────────────────────────────────────

interface CreateCheckoutParams {
  planType: "monthly" | "semiannual" | "annual" | "lifetime";
  merchantId: string;
  locale: string;
  restaurantId?: string;
}

interface CheckoutResult {
  url: string | null;
  error: string | null;
}

/**
 * Create a Stripe Checkout session for an EXISTING merchant.
 * - Subscriptions (monthly/semiannual/annual) -> mode "subscription" with 14-day trial
 * - Lifetime -> mode "payment" (one-time)
 * The merchant must already exist in DB (created during signup step).
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const { planType, merchantId, locale, restaurantId } = params;

  try {
    // If Stripe is not configured, return placeholder
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log(
        `[Stripe] Not configured. Placeholder checkout for merchant ${merchantId} — Plan: ${planType}`
      );
      return {
        url: `/${locale}/espace-client`,
        error: null,
      };
    }

    const stripe = getStripe();
    const supabase = createAdminClient();

    // Get merchant email for Stripe customer_email
    const { data: merchant } = await supabase
      .from("merchants")
      .select("email, name")
      .eq("id", merchantId)
      .single() as { data: { email: string; name: string } | null; error: unknown };

    if (!merchant) {
      return { url: null, error: "Marchand introuvable" };
    }

    // Count active subscribers to determine Early Bird eligibility
    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("is_early_bird", true)
      .in("status", ["active", "trialing"]);

    const subscriberCount = count || 0;
    const isEarlyBird = subscriberCount < EARLY_BIRD_LIMIT;
    const priceId = getPriceId(planType, subscriberCount);

    if (!priceId) {
      return { url: null, error: "Plan invalide ou prix Stripe non configuré" };
    }

    const isLifetime = planType === "lifetime";

    const metadata: Record<string, string> = {
      merchant_id: merchantId,
      plan_type: planType,
      locale: locale,
      is_early_bird: isEarlyBird ? "true" : "false",
    };
    if (restaurantId) {
      metadata.restaurant_id = restaurantId;
    }

    const stripeLocale =
      locale === "fr" ? "fr"
        : locale === "de" ? "de"
          : locale === "pt" ? "pt"
            : locale === "es" ? "es"
              : "en";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      mode: isLifetime ? "payment" : "subscription",
      payment_method_types: ["card"],
      customer_email: merchant.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/espace-client?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/partenaire-inscription?step=plan&canceled=1`,
      locale: stripeLocale,
    };

    // Only add trial for subscriptions (not lifetime)
    if (!isLifetime) {
      sessionParams.subscription_data = {
        trial_period_days: TRIAL_DAYS,
        metadata,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return { url: session.url, error: null };
  } catch (error) {
    console.error("Checkout error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { url: null, error: `Erreur Stripe: ${msg}` };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Legacy: createCheckoutSession for B2BPricing (backwards-compatible)
// Kept for transition period — will be removed once B2BPricing redirects
// ────────────────────────────────────────────────────────────────────────────

interface LegacyCheckoutParams {
  planType: "monthly" | "semiannual" | "annual";
  merchantName: string;
  merchantEmail: string;
  merchantPhone: string;
  restaurantName: string;
  restaurantCity: string;
  locale: string;
}

/**
 * @deprecated Use the new createCheckoutSession with merchantId instead.
 * Kept for B2BPricing backward compatibility during transition.
 */
export async function createLegacyCheckoutSession(
  params: LegacyCheckoutParams
): Promise<CheckoutResult> {
  const { planType, merchantEmail, locale } = params;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        url: `/${locale}/partenaire-inscription`,
        error: null,
      };
    }

    const stripe = getStripe();
    const supabase = createAdminClient();

    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("is_early_bird", true)
      .in("status", ["active", "trialing"]);

    const subscriberCount = count || 0;
    const priceId = getPriceId(planType, subscriberCount);

    if (!priceId) {
      return { url: null, error: "Invalid plan type or missing price configuration" };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: merchantEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
      },
      metadata: {
        merchant_name: params.merchantName,
        merchant_phone: params.merchantPhone,
        restaurant_name: params.restaurantName,
        restaurant_city: params.restaurantCity,
        plan_type: planType,
        locale: locale,
        early_bird: subscriberCount < EARLY_BIRD_LIMIT ? "true" : "false",
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/partenaire-inscription/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/partenaire-inscription`,
      locale:
        locale === "fr" ? "fr"
          : locale === "de" ? "de"
            : locale === "pt" ? "pt"
              : locale === "es" ? "es"
                : "en",
    });

    return { url: session.url, error: null };
  } catch (error) {
    console.error("Checkout error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { url: null, error: `Stripe error: ${msg}` };
  }
}

/**
 * Handle Stripe webhook events for subscription lifecycle.
 * Called from /api/webhooks/stripe/route.ts
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

        // ── Create subscription record ──
        const isEarlyBird = metadata.is_early_bird === "true" || metadata.early_bird === "true";
        const planType = metadata.plan_type || (isLifetime ? "lifetime" : "monthly");

        if (isLifetime) {
          // Lifetime: one-time payment → subscription record with status active, no period end
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("subscriptions") as any).insert({
            merchant_id: merchant.id,
            stripe_subscription_id: data.payment_intent || data.id,
            plan_type: "lifetime",
            status: "active",
            is_early_bird: isEarlyBird,
            stripe_price_id: data.amount_total ? undefined : undefined, // price in line_items, not directly available
            current_period_start: new Date().toISOString(),
            current_period_end: "2099-12-31T23:59:59.000Z",
          });
        } else {
          // Subscription mode
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("subscriptions") as any).insert({
            merchant_id: merchant.id,
            stripe_subscription_id: data.subscription || data.payment_intent,
            plan_type: planType,
            status: "active",
            is_early_bird: isEarlyBird,
            current_period_start: new Date().toISOString(),
          });
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
        let restaurantName = metadata.restaurant_name || "";
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

      break;
    }

    case "customer.subscription.updated": {
      console.log("Subscription updated:", data.id);

      try {
        const supabase = createAdminClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("subscriptions") as any)
          .update({
            status: data.status === "active" ? "active" : "past_due",
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

/**
 * Create a free trial merchant account (no Stripe payment).
 */
export async function createFreeTrial(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
  restaurantName: string;
  city: string;
  locale?: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    const { data: merchant, error: merchantError } = await (supabase
      .from("merchants") as any)
      .upsert({ email: params.email, name: params.name, phone: params.phone }, { onConflict: "email" })
      .select()
      .single();
    if (merchantError) throw merchantError;
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);
    const { error: subError } = await (supabase.from("subscriptions") as any).insert({
      merchant_id: merchant.id,
      plan_type: "monthly",
      status: "trialing",
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
    });
    if (subError) throw subError;

    // Send emails (non-blocking — don't fail the signup if emails fail)
    const locale = params.locale || "fr";
    const emailData = {
      merchantName: params.name,
      merchantEmail: params.email,
      restaurantName: params.restaurantName,
      city: params.city,
      trialEndDate: trialEnd.toLocaleDateString(locale === "de" ? "de-CH" : locale === "en" ? "en-GB" : "fr-CH"),
    };

    // Welcome email to merchant
    const welcomeEmail = freeTrialWelcome(emailData, locale);
    await sendEmail({
      to: params.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
    });

    // Admin notification
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminNotif = freeTrialAdminNotification(emailData);
      await sendEmail({
        to: adminEmail,
        subject: adminNotif.subject,
        html: adminNotif.html,
      });
    }

    return { success: true, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Impossible de créer le compte";
    return { success: false, error: msg };
  }
}
