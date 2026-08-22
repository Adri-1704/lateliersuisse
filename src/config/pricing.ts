/**
 * Grille tarifaire unique et définitive de Just-Tag.
 *
 * Décision produit du 2026-08-22 : il n'y a plus qu'une seule grille de
 * prix, valable pour tout le monde et pour toujours. L'ancienne notion de
 * « tarif de lancement » (Early Bird, réservé aux 100 premiers restaurants)
 * a disparu : ces montants sont désormais simplement LES prix de base.
 *
 * ⚠️ Cette grille reste dupliquée en dur dans plusieurs fichiers pour des
 * raisons historiques (voir liste ci-dessous) — ce module est la source de
 * vérité pour les NOUVEAUX usages (ex. bloc de prix remisés ALIGRO). Les
 * fichiers existants n'ont pas été migrés vers cette source dans ce lot afin
 * de limiter le risque de régression ; à envisager plus tard :
 * - src/components/b2b/B2BPricing.tsx
 * - src/components/b2b/B2BSimulator.tsx
 * - src/app/[locale]/whats-up/WhatsUpClient.tsx
 * - src/app/[locale]/partenaire-inscription/MerchantSignupClient.tsx
 * - src/app/[locale]/espace-client/(dashboard)/abonnement/page.tsx
 * - src/lib/stripe.ts (PLAN_DETAILS — sert aux estimations MRR/ARR admin)
 */

export type BillingPeriod = "monthly" | "semiannual" | "annual";

/**
 * Palier d'abonnés WhatsApp, tel qu'utilisé en interne (code, Stripe).
 * Côté UI publique, on affiche le nombre de messages/mois correspondant
 * (palier × 4) : 50 → 200 messages, 100 → 400 messages, 200 → 800 messages.
 */
export type MessageTier = 50 | 100 | 200;

export const MESSAGE_TIERS: readonly MessageTier[] = [50, 100, 200];

/** Nombre de messages WhatsApp inclus par mois pour un palier donné. */
export function messagesPerMonth(tier: MessageTier): number {
  return tier * 4;
}

/** Prix mensuel équivalent (CHF), par palier et par périodicité de facturation. */
export const BASE_PRICES: Record<MessageTier, Record<BillingPeriod, number>> = {
  50: { monthly: 59.95, semiannual: 52.95, annual: 49.95 },
  100: { monthly: 89.95, semiannual: 79.95, annual: 74.95 },
  200: { monthly: 149.95, semiannual: 132.95, annual: 124.95 },
};

/** Prix mensuel équivalent (CHF) pour un palier et une périodicité donnés. */
export function basePrice(tier: MessageTier, period: BillingPeriod): number {
  return BASE_PRICES[tier][period];
}

/** Montant total facturé pour la période (le prix de base est toujours "par mois"). */
export function totalForPeriod(tier: MessageTier, period: BillingPeriod): number {
  const monthly = basePrice(tier, period);
  const months = period === "semiannual" ? 6 : period === "annual" ? 12 : 1;
  return Math.round(monthly * months * 100) / 100;
}
