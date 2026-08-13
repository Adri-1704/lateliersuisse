/**
 * Configuration de l'offre partenaire Aligro.
 *
 * Le pourcentage de remise n'est pas encore décidé au moment de l'écriture de
 * cette page. Toute la page `/fr/clients-aligro` passe par `getAligroOfferLabel()`
 * pour afficher le libellé de l'offre : tant que `ALIGRO_DISCOUNT_PERCENT` vaut
 * `null`, un texte générique est affiché.
 *
 * >>> Le jour où le pourcentage est décidé, il suffit de changer UNE SEULE LIGNE
 * >>> ci-dessous (ex: `ALIGRO_DISCOUNT_PERCENT = 20`) pour que toute la page se
 * >>> mette à jour automatiquement.
 */
export const ALIGRO_DISCOUNT_PERCENT: number | null = null;

/**
 * Libellé de l'offre à afficher sur la page, dérivé de `ALIGRO_DISCOUNT_PERCENT`.
 * - Si le pourcentage n'est pas encore décidé (`null`) : texte générique sans chiffre.
 * - Sinon : texte précis avec le pourcentage de remise.
 */
export function getAligroOfferLabel(): string {
  if (ALIGRO_DISCOUNT_PERCENT === null) {
    return "Offre exclusive réservée aux clients Aligro";
  }
  return `${ALIGRO_DISCOUNT_PERCENT}% de remise sur votre abonnement Just-Tag`;
}
