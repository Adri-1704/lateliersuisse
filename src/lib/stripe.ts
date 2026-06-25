import Stripe from "stripe";

/**
 * Lazy-initialized Stripe client.
 * Does NOT throw at module load — allows the server to start without STRIPE_SECRET_KEY.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
      maxNetworkRetries: 3,
      timeout: 20000,
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return _stripe;
}

/**
 * Stripe Price IDs — new tiered model (3 billing × 3 subscriber tiers × 2 phases)
 * Phase "launch" = early bird (first 100 restaurants), "catalogue" = standard
 */
const TIER_PRICES: Record<string, Record<number, Record<string, string>>> = {
  monthly: {
    50:  { launch: process.env.STRIPE_PRICE_MONTHLY_50_LAUNCH || "", catalogue: process.env.STRIPE_PRICE_MONTHLY_50_CATALOGUE || "" },
    100: { launch: process.env.STRIPE_PRICE_MONTHLY_100_LAUNCH || "", catalogue: process.env.STRIPE_PRICE_MONTHLY_100_CATALOGUE || "" },
    200: { launch: process.env.STRIPE_PRICE_MONTHLY_200_LAUNCH || "", catalogue: process.env.STRIPE_PRICE_MONTHLY_200_CATALOGUE || "" },
  },
  semiannual: {
    50:  { launch: process.env.STRIPE_PRICE_SEMIANNUAL_50_LAUNCH || "", catalogue: process.env.STRIPE_PRICE_SEMIANNUAL_50_CATALOGUE || "" },
    100: { launch: process.env.STRIPE_PRICE_SEMIANNUAL_100_LAUNCH || "", catalogue: process.env.STRIPE_PRICE_SEMIANNUAL_100_CATALOGUE || "" },
    200: { launch: process.env.STRIPE_PRICE_SEMIANNUAL_200_LAUNCH || "", catalogue: process.env.STRIPE_PRICE_SEMIANNUAL_200_CATALOGUE || "" },
  },
  annual: {
    50:  { launch: process.env.STRIPE_PRICE_ANNUAL_50_LAUNCH || "", catalogue: process.env.STRIPE_PRICE_ANNUAL_50_CATALOGUE || "" },
    100: { launch: process.env.STRIPE_PRICE_ANNUAL_100_LAUNCH || "", catalogue: process.env.STRIPE_PRICE_ANNUAL_100_CATALOGUE || "" },
    200: { launch: process.env.STRIPE_PRICE_ANNUAL_200_LAUNCH || "", catalogue: process.env.STRIPE_PRICE_ANNUAL_200_CATALOGUE || "" },
  },
};

export const LIFETIME_PRICE_ID = process.env.STRIPE_PRICE_LIFETIME || "";
export const LIFETIME_PRICE_EARLY_ID = process.env.STRIPE_PRICE_LIFETIME_EARLY || "";

// Used by admin dashboard for MRR/ARR estimates (based on 100-subscriber tier)
export const PLAN_DETAILS = {
  monthly:    { price: 79.95, priceEarly: 59.95, interval: "month" as const,     label: "Mensuel" },
  semiannual: { price: 71.90, priceEarly: 53.90, interval: "6 months" as const,  label: "Semestriel" },
  annual:     { price: 66.90, priceEarly: 49.90, interval: "year" as const,       label: "Annuel" },
  lifetime:   { price: 1495,  priceEarly: 1495,  interval: "one-time" as const,   label: "Lifetime" },
};

export const EARLY_BIRD_LIMIT = 100;
export const TRIAL_DAYS = 14;

export type WhatsAppTier = 50 | 100 | 200;

/**
 * Returns the Stripe price ID for a given plan/tier/early-bird combination.
 * - planType: billing period (monthly/semiannual/annual/lifetime)
 * - whatsappTier: subscriber count chosen by restaurant (50/100/200)
 * - earlyBirdCount: number of existing early-bird subscriptions (determines launch vs catalogue)
 */
export function getPriceId(
  planType: "monthly" | "semiannual" | "annual" | "lifetime",
  earlyBirdCount: number,
  whatsappTier: WhatsAppTier = 100,
): string {
  if (planType === "lifetime") {
    if (earlyBirdCount < EARLY_BIRD_LIMIT && LIFETIME_PRICE_EARLY_ID) {
      return LIFETIME_PRICE_EARLY_ID;
    }
    return LIFETIME_PRICE_ID;
  }

  const phase = earlyBirdCount < EARLY_BIRD_LIMIT ? "launch" : "catalogue";
  const tier = TIER_PRICES[planType]?.[whatsappTier];
  return tier?.[phase] || "";
}

export function isEarlyBirdAvailable(subscriberCount: number): boolean {
  return subscriberCount < EARLY_BIRD_LIMIT;
}
