"use server";

import { getStripe, getPriceId, TRIAL_DAYS, type WhatsAppTier } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { freeTrialWelcome, freeTrialAdminNotification } from "@/lib/email-templates";
import { logConversionEvent } from "@/lib/analytics/conversion-events";

// ────────────────────────────────────────────────────────────────────────────
// Checkout session
// ────────────────────────────────────────────────────────────────────────────

interface CreateCheckoutParams {
  planType: "monthly" | "semiannual" | "annual";
  merchantId: string;
  locale: string;
  restaurantId?: string;
  /** WhatsApp subscriber tier chosen by the restaurant (50 / 100 / 200) */
  whatsappTier?: WhatsAppTier;
  /** Affiliate referral code (from cookie jt_ref) */
  affiliateRef?: string;
}

interface CheckoutResult {
  url: string | null;
  error: string | null;
}

/**
 * Create a Stripe Checkout session for an EXISTING merchant.
 * Mode "subscription" with a 14-day trial (monthly/semiannual/annual).
 * The merchant must already exist in DB (created during signup step).
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const { planType, merchantId, locale, restaurantId, whatsappTier = 100, affiliateRef } = params;

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

    // Grille tarifaire unique — le prix ne dépend plus du nombre d'abonnés
    // déjà en portefeuille (ex-mécanisme "Early Bird", retiré).
    const priceId = getPriceId(planType, whatsappTier);

    if (!priceId) {
      return { url: null, error: "Plan invalide ou prix Stripe non configuré" };
    }

    const metadata: Record<string, string> = {
      merchant_id: merchantId,
      plan_type: planType,
      locale: locale,
      whatsapp_tier: String(whatsappTier),
    };
    if (restaurantId) {
      metadata.restaurant_id = restaurantId;
    }
    if (affiliateRef) {
      metadata.affiliate_ref = affiliateRef;
    }

    const stripeLocale =
      locale === "fr" ? "fr"
        : locale === "de" ? "de"
          : locale === "pt" ? "pt"
            : locale === "es" ? "es"
              : "en";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: merchant.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      // Champ "code promo" natif sur la page Stripe — permet d'offrir une
      // remise (ex. partenariat Aligro) sans avoir besoin de coder quoi que
      // ce soit côté app : le code + le % se créent dans le Dashboard Stripe
      // (Produits > Codes promotionnels) le jour où le montant est décidé.
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/espace-client?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/partenaire-inscription?step=plan&canceled=1`,
      locale: stripeLocale,
    };

    sessionParams.subscription_data = {
      trial_period_days: TRIAL_DAYS,
      metadata,
    };

    // Reassurance messages on the Stripe checkout page
    sessionParams.custom_text = {
      submit: {
        message: "Aucun débit pendant les 14 jours d'essai. Annulable à tout moment depuis votre espace client, sans justification.",
      },
      after_submit: {
        message: "Vous recevrez un email de confirmation. En cas de question : contact@just-tag.app",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Log checkout_initiated event (non-blocking)
    void logConversionEvent({
      eventType: "checkout_initiated",
      merchantId,
      affiliateRef: affiliateRef || null,
      planType,
      metadata: { restaurant_id: restaurantId || null },
    });

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

    const priceId = getPriceId(planType);

    if (!priceId) {
      return { url: null, error: "Invalid plan type or missing price configuration" };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: merchantEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
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
  /** Affiliate referral code (from cookie jt_ref) */
  affiliateRef?: string;
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
      affiliate_ref: params.affiliateRef || null,
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
