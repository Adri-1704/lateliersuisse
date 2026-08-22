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
 * Stripe Price IDs — grille tarifaire unique et définitive (décision produit
 * du 2026-08-22) : le tarif de lancement ("Early Bird", places limitées aux
 * 100 premiers restaurants) devient LE tarif, pour tout le monde et pour
 * toujours. Le tarif "catalogue" (plus cher) est abandonné.
 *
 * Les variables d'environnement gardent leur suffixe historique "_LAUNCH" —
 * ce sont les IDs de prix Stripe déjà configurés en prod, on ne les renomme
 * pas pour éviter toute rupture. Les variables "_CATALOGUE" existent encore
 * potentiellement dans l'environnement Stripe/Vercel mais ne sont plus lues
 * par le code : il n'y a plus de notion de phase.
 */
const e = (key: string) => (process.env[key] || "").trim();

const TIER_PRICES: Record<"monthly" | "semiannual" | "annual", Record<number, string>> = {
  monthly: {
    50:  e("STRIPE_PRICE_MONTHLY_50_LAUNCH"),
    100: e("STRIPE_PRICE_MONTHLY_100_LAUNCH"),
    200: e("STRIPE_PRICE_MONTHLY_200_LAUNCH"),
  },
  semiannual: {
    50:  e("STRIPE_PRICE_SEMIANNUAL_50_LAUNCH"),
    100: e("STRIPE_PRICE_SEMIANNUAL_100_LAUNCH"),
    200: e("STRIPE_PRICE_SEMIANNUAL_200_LAUNCH"),
  },
  annual: {
    50:  e("STRIPE_PRICE_ANNUAL_50_LAUNCH"),
    100: e("STRIPE_PRICE_ANNUAL_100_LAUNCH"),
    200: e("STRIPE_PRICE_ANNUAL_200_LAUNCH"),
  },
};

export type WhatsAppTier = 50 | 100 | 200;

/**
 * Grille tarifaire unique (CHF, prix "mensuel équivalent"), par palier
 * d'abonnés WhatsApp (50/100/200 en interne = 200/400/800 messages affichés
 * côté UI, voir MerchantSignupClient.tsx) et par périodicité.
 * Sert aux estimations MRR/ARR de l'admin (src/actions/admin/stats.ts).
 * Source : src/app/[locale]/partenaire-inscription/MerchantSignupClient.tsx
 * (tableau TIER_DISPLAY_PRICES.launch).
 */
export const PLAN_DETAILS: Record<WhatsAppTier, Record<"monthly" | "semiannual" | "annual", number>> = {
  50:  { monthly: 59.95,  semiannual: 52.95,  annual: 49.95 },
  100: { monthly: 89.95,  semiannual: 79.95,  annual: 74.95 },
  200: { monthly: 149.95, semiannual: 132.95, annual: 124.95 },
};

export const TRIAL_DAYS = 14;

/**
 * Returns the Stripe price ID for a given plan/tier combination.
 * - planType: billing period (monthly/semiannual/annual)
 * - whatsappTier: subscriber count chosen by restaurant (50/100/200)
 * Il n'y a plus qu'une seule grille tarifaire : le prix ne dépend plus du
 * nombre d'abonnés déjà en portefeuille (ex-mécanisme "Early Bird", retiré).
 */
export function getPriceId(
  planType: "monthly" | "semiannual" | "annual",
  whatsappTier: WhatsAppTier = 100,
): string {
  return TIER_PRICES[planType]?.[whatsappTier] || "";
}
