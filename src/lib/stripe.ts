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
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Stripe Price IDs for each subscription plan.
 * These should be created in Stripe Dashboard and set in env vars.
 */
export const PLAN_PRICES: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || "",
  semiannual: process.env.STRIPE_PRICE_SEMIANNUAL || "",
  annual: process.env.STRIPE_PRICE_ANNUAL || "",
  lifetime: process.env.STRIPE_PRICE_LIFETIME || "",
};

export const PLAN_DETAILS = {
  monthly: { price: 49, interval: "month" as const, label: "Mensuel" },
  semiannual: { price: 259, interval: "6 months" as const, label: "Semestriel" },
  annual: { price: 459, interval: "year" as const, label: "Annuel" },
  lifetime: { price: 999, interval: "once" as const, label: "A vie" },
};
