/**
 * Fonction pure, volontairement hors des fichiers "use server" : Next.js
 * exige que toute fonction exportée d'un module "use server" soit async
 * (traitée comme une Server Action), ce qui ne convient pas à un simple
 * calcul synchrone partagé entre plusieurs appelants (dashboard + webhook).
 */
export function monthlyQuotaForTier(tier: number | null): number {
  return (tier ?? 50) * 4; // 50→200, 100→400, 200→800 messages individuels/mois
}
