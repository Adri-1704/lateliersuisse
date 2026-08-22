/**
 * Configuration de l'offre partenaire ALIGRO.
 *
 * Toute la page `/fr/clients-aligro` passe par `getAligroOfferLabel()` pour
 * afficher le libellé de l'offre : changer la constante ci-dessous suffit à
 * mettre à jour la page entière.
 *
 * Remise arrêtée à -40% le 2026-08-21. Le pourcentage affiché ici doit rester
 * synchronisé avec le code promotionnel `ALIGRO40` créé dans le Dashboard
 * Stripe (Produits > Codes promotionnels) : c'est LUI qui applique réellement
 * la remise au paiement. Le checkout accepte les codes promo natifs
 * (`allow_promotion_codes: true`, voir src/actions/subscriptions.ts) et le
 * webhook range le code rédimé dans `affiliate_ref`, d'où le suivi des
 * clients ALIGRO dans /admin/affiliations.
 *
 * Valeurs possibles :
 * - un nombre (ex. `40`) : affiche « -40% sur tous vos abonnements »
 * - `"X"` : placeholder pour présenter la maquette à un partenaire avant que
 *   le pourcentage ne soit arrêté (affiche « -X% »)
 * - `null` : texte générique sans chiffre
 */
export const ALIGRO_DISCOUNT_PERCENT: number | "X" | null = 40;

/**
 * Code promotionnel à saisir par le restaurateur sur la page de paiement
 * Stripe. C'est LUI, et lui seul, qui déclenche la remise : le tarif remisé
 * affiché sur /clients-aligro est une vitrine, aucun prix réduit n'est
 * facturé sans ce code. Il doit correspondre exactement au code créé dans le
 * Dashboard Stripe (Produits > Codes promotionnels).
 */
export const ALIGRO_PROMO_CODE = "ALIGRO40";

/**
 * Libellé de l'offre à afficher sur la page, dérivé de `ALIGRO_DISCOUNT_PERCENT`.
 * - Si le pourcentage n'est pas encore décidé (`null`) : texte générique sans chiffre.
 * - Sinon : texte précis avec le pourcentage de remise.
 */
export function getAligroOfferLabel(): string {
  if (ALIGRO_DISCOUNT_PERCENT === null) {
    return "Offre exclusive réservée aux clients ALIGRO";
  }
  return `-${ALIGRO_DISCOUNT_PERCENT}% sur tous vos abonnements`;
}

/**
 * Applique la remise ALIGRO à un prix de base (voir `src/config/pricing.ts`
 * pour la grille de base). Retourne `null` tant que le pourcentage n'est pas
 * un nombre arrêté (`"X"` placeholder ou `null`) : dans ce cas, impossible
 * d'afficher un prix remisé fiable — mieux vaut ne rien calculer que
 * d'afficher un chiffre inventé.
 */
export function getAligroDiscountedPrice(basePrice: number): number | null {
  if (typeof ALIGRO_DISCOUNT_PERCENT !== "number") {
    return null;
  }
  return Math.round(basePrice * (1 - ALIGRO_DISCOUNT_PERCENT / 100) * 100) / 100;
}
