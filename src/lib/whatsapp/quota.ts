/**
 * Fonction pure, volontairement hors des fichiers "use server" : Next.js
 * exige que toute fonction exportée d'un module "use server" soit async
 * (traitée comme une Server Action), ce qui ne convient pas à un simple
 * calcul synchrone partagé entre plusieurs appelants (dashboard + webhook).
 */
export function monthlyQuotaForTier(tier: number | null): number {
  // tier === null signifie explicitement "pas d'abonnement actif/en essai
  // pour ce marchand" (voir getWhatsAppPlanTier) : dans ce cas, AUCUN envoi
  // n'est autorisé — pas de quota gratuit par défaut. Un tier connu
  // (50/100/200) donne 200/400/800 messages individuels/mois.
  if (tier === null) return 0;
  return tier * 4;
}
