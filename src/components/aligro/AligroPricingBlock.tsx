import { BadgePercent } from "lucide-react";
import { ALIGRO_DISCOUNT_PERCENT, ALIGRO_PROMO_CODE, getAligroDiscountedPrice } from "@/config/aligro";
import { MESSAGE_TIERS, BASE_PRICES, messagesPerMonth, type MessageTier } from "@/config/pricing";

/**
 * Bloc de prix remisés pour les clients ALIGRO : reprend la grille de base
 * (`src/config/pricing.ts`) et affiche, pour chaque palier, le prix de base
 * barré et le prix ALIGRO (remise `ALIGRO_DISCOUNT_PERCENT`, voir
 * `src/config/aligro.ts`) mis en avant. Changer la constante de remise met
 * automatiquement à jour les 3 prix affichés ici.
 *
 * Accessibilité : le prix de base barré (`<s>`) est précédé d'un intitulé
 * explicite en lecture d'écran ("Prix de base, avant remise ALIGRO") et le
 * prix effectif d'un intitulé "Prix ALIGRO" — un lecteur d'écran ne peut donc
 * jamais confondre le prix barré avec le prix courant. Contenu 100% en
 * français en dur, comme le reste de la page /fr/clients-aligro.
 */
const TIER_INFO: Record<MessageTier, { desc: string; popular: boolean }> = {
  50: { desc: "Petits établissements, tables d'hôtes", popular: false },
  100: { desc: "Restaurants familiaux, bars de quartier", popular: true },
  200: { desc: "Grands volumes, brasseries, traiteurs", popular: false },
};

export function AligroPricingBlock() {
  // Si le pourcentage n'est pas encore un nombre arrêté ("X" ou null), on ne
  // peut pas afficher de prix remisé fiable : mieux vaut ne rien montrer.
  if (typeof ALIGRO_DISCOUNT_PERCENT !== "number") {
    return null;
  }
  const discountPercent = ALIGRO_DISCOUNT_PERCENT;

  return (
    <section className="bg-white py-16 sm:py-24" aria-labelledby="aligro-pricing-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-just-tag)]/10 px-3 py-1 text-sm font-bold uppercase tracking-wide text-[var(--color-just-tag)]">
            <BadgePercent className="h-4 w-4" aria-hidden="true" />
            Tarif partenaire ALIGRO
          </p>
          <h2
            id="aligro-pricing-title"
            className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl"
          >
            Vos tarifs, remise ALIGRO déjà appliquée
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Le tarif mensuel, sans engagement, remise de {discountPercent}% déduite. Pour en
            bénéficier, saisissez votre code partenaire au moment du paiement :
          </p>
          <p className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-just-tag)] bg-[var(--color-just-tag)]/5 px-5 py-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Code partenaire
              </span>
              <span className="font-mono text-xl font-black tracking-wider text-gray-900">
                {ALIGRO_PROMO_CODE}
              </span>
            </span>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {MESSAGE_TIERS.map((tier) => {
            const base = BASE_PRICES[tier].monthly;
            const discounted = getAligroDiscountedPrice(base);
            if (discounted === null) return null;
            const { desc, popular } = TIER_INFO[tier];

            return (
              <div
                key={tier}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  popular
                    ? "border-[var(--color-just-tag)] shadow-md ring-1 ring-[var(--color-just-tag)]/20"
                    : "border-gray-200"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--color-just-tag)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    ⭐ Le plus populaire
                  </span>
                )}

                <div className="mb-2 inline-flex w-fit items-center rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {messagesPerMonth(tier)} messages/mois
                </div>
                <p className="text-sm text-gray-500">{desc}</p>

                <div className="mt-4">
                  <p className="text-sm text-gray-400">
                    <span className="sr-only">Prix de base, avant remise ALIGRO : </span>
                    <s className="decoration-2 decoration-gray-400">
                      CHF {base.toFixed(2)}/mois
                    </s>
                  </p>
                  <p className="mt-0.5 whitespace-nowrap leading-none">
                    <span className="sr-only">
                      Prix ALIGRO, remise de {discountPercent}% déjà appliquée :{" "}
                    </span>
                    <span className="font-condensed text-4xl font-black text-gray-900">
                      CHF {discounted.toFixed(2)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">/mois</span>
                  </p>
                </div>

                <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-just-tag)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-just-tag)]">
                  <BadgePercent className="h-3.5 w-3.5" aria-hidden="true" />
                  -{discountPercent}% partenaire ALIGRO
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Prix TTC · Sans engagement pour le plan mensuel · Formules semestrielle et annuelle
          également disponibles à l&apos;inscription, avec la même remise ALIGRO · Sans le code{" "}
          {ALIGRO_PROMO_CODE}, le tarif standard s&apos;applique.
        </p>
      </div>
    </section>
  );
}
