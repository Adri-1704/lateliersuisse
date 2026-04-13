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
 * Stripe Price IDs - Standard pricing (after first 100 customers)
 */
export const PLAN_PRICES: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || "",
  semiannual: process.env.STRIPE_PRICE_SEMIANNUAL || "",
  annual: process.env.STRIPE_PRICE_ANNUAL || "",
};

/**
 * Stripe Price IDs - Early Bird pricing (first 100 customers)
 */
export const PLAN_PRICES_EARLY: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY_EARLY || "",
  semiannual: process.env.STRIPE_PRICE_SEMIANNUAL_EARLY || "",
  annual: process.env.STRIPE_PRICE_ANNUAL_EARLY || "",
};

export const PLAN_DETAILS = {
  monthly: { price: 49.95, priceEarly: 29.95, interval: "month" as const, label: "Mensuel" },
  semiannual: { price: 269, priceEarly: 159, interval: "6 months" as const, label: "Semestriel" },
  annual: { price: 499, priceEarly: 299, interval: "year" as const, label: "Annuel" },
};

export const EARLY_BIRD_LIMIT = 100;
export const TRIAL_DAYS = 14;

/**
 * Returns the right price ID based on Early Bird availability.
 */
export function getPriceId(planType: "monthly" | "semiannual" | "annual", subscriberCount: number): string {
  if (subscriberCount < EARLY_BIRD_LIMIT) {
    return PLAN_PRICES_EARLY[planType];
  }
  return PLAN_PRICES[planType];
}

export function isEarlyBirdAvailable(subscriberCount: number): boolean {
  return subscriberCount < EARLY_BIRD_LIMIT;
}
