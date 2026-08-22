"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALIGRO_DISCOUNT_PERCENT, ALIGRO_PROMO_CODE, getAligroDiscountedPrice } from "@/config/aligro";
import {
  MESSAGE_TIERS,
  BASE_PRICES,
  messagesPerMonth,
  totalForPeriod,
  totalForPeriodFromMonthly,
  type MessageTier,
  type BillingPeriod,
} from "@/config/pricing";

/**
 * Bloc de prix remisés pour les clients ALIGRO : reprend la grille de base
 * (`src/config/pricing.ts`) et affiche, pour chaque palier et chaque
 * périodicité (mensuel / semestriel / annuel, sélectionnés via les onglets
 * ci-dessous), le prix de base barré et le prix ALIGRO (remise
 * `ALIGRO_DISCOUNT_PERCENT`, voir `src/config/aligro.ts`) mis en avant, ainsi
 * que le total remisé de la période quand elle n'est pas mensuelle. Changer
 * la constante de remise met automatiquement à jour tous les prix et totaux
 * affichés ici — aucun montant n'est codé en dur dans ce fichier.
 *
 * Chaque carte porte un bouton d'inscription qui pointe vers
 * `/fr/partenaire-inscription` en conservant `?ref=aligro` (attribution du
 * partenariat, voir `AligroFinalCTA`/`AligroHero`) et en ajoutant `plan` /
 * `subs` : ce sont exactement les paramètres lus par `MerchantSignupClient`
 * (`searchParams.get("plan")`, `searchParams.get("subs")`) pour pré-sélectionner
 * la périodicité et le palier choisis ici et sauter directement à l'étape
 * d'inscription.
 *
 * Accessibilité :
 * - Le prix de base barré (`<s>`) est précédé d'un intitulé explicite en
 *   lecture d'écran ("Prix de base, avant remise ALIGRO") et le prix effectif
 *   d'un intitulé "Prix ALIGRO" — un lecteur d'écran ne peut donc jamais
 *   confondre le prix barré avec le prix courant. Le même traitement est
 *   appliqué au total par période (base barré vs total ALIGRO).
 * - Le sélecteur de périodicité suit le motif ARIA "tabs" complet :
 *   `role="tablist"`/`role="tab"`/`aria-selected`, navigation au clavier par
 *   flèches gauche/droite (roving tabindex) en plus de Tab, et le contenu mis
 *   à jour (les 3 cartes) est un `role="tabpanel"` relié par `aria-labelledby`
 *   à l'onglet actif.
 *
 * Contenu 100% en français en dur, comme le reste de la page
 * /fr/clients-aligro.
 */
/**
 * Palier mis en avant. Les descriptions de profil d'établissement
 * (« Petits établissements, tables d'hôtes », « Restaurants familiaux »…)
 * ont été retirées : elles enfermaient le lecteur dans une catégorie alors
 * que le seul critère qui compte ici est le volume de messages.
 */
const POPULAR_TIER: MessageTier = 100;

const BILLING_TABS: { id: BillingPeriod; label: string; badge?: string }[] = [
  { id: "monthly", label: "Mensuel" },
  { id: "semiannual", label: "Semestriel", badge: "−11%" },
  { id: "annual", label: "Annuel", badge: "−17%" },
];

function periodTotalLabel(period: BillingPeriod): string {
  return period === "semiannual" ? "au total pour 6 mois" : "au total pour 1 an";
}

export function AligroPricingBlock() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const tabRefs = useRef<Record<BillingPeriod, HTMLButtonElement | null>>({
    monthly: null,
    semiannual: null,
    annual: null,
  });
  const panelId = useId();
  const tabIds = {
    monthly: `${panelId}-tab-monthly`,
    semiannual: `${panelId}-tab-semiannual`,
    annual: `${panelId}-tab-annual`,
  } satisfies Record<BillingPeriod, string>;

  function focusTab(index: number) {
    const target = BILLING_TABS[(index + BILLING_TABS.length) % BILLING_TABS.length];
    setBilling(target.id);
    tabRefs.current[target.id]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(BILLING_TABS.length - 1);
    }
  }

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
            Le prix affiché est votre équivalent mensuel, remise de {discountPercent}% déjà
            déduite, quelle que soit la périodicité choisie. Pour en bénéficier, saisissez votre
            code partenaire au moment du paiement :
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

        {/* Sélecteur de périodicité — motif ARIA "tabs" complet (roving tabindex,
            navigation clavier par flèches, aria-selected/aria-controls). */}
        <div className="mt-10 flex justify-center">
          <div
            role="tablist"
            aria-label="Périodicité de facturation"
            className="flex gap-1 rounded-full bg-gray-200 p-1"
          >
            {BILLING_TABS.map(({ id, label, badge }, index) => {
              const isSelected = billing === id;
              return (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[id] = el;
                  }}
                  role="tab"
                  id={tabIds[id]}
                  type="button"
                  aria-selected={isSelected}
                  aria-controls={`${panelId}-panel`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setBilling(id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-white font-semibold text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                  {badge && (
                    <span className="absolute -right-1.5 -top-2 rounded-full bg-[var(--color-just-tag)] px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          id={`${panelId}-panel`}
          role="tabpanel"
          aria-labelledby={tabIds[billing]}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {MESSAGE_TIERS.map((tier) => {
            const base = BASE_PRICES[tier][billing];
            const discounted = getAligroDiscountedPrice(base);
            if (discounted === null) return null;
            const popular = tier === POPULAR_TIER;

            const showTotal = billing !== "monthly";
            const baseTotal = totalForPeriod(tier, billing);
            const discountedTotal = totalForPeriodFromMonthly(discounted, billing);

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

                <div className="mt-4">
                  {/* Le prix de base est volontairement affiché en grand :
                      c'est la comparaison avec le tarif ALIGRO juste en
                      dessous qui fait percevoir la remise. Barré, en gris
                      moyen et légèrement plus petit que le prix remisé, il
                      reste clairement l'ancien prix sans lui voler la
                      vedette. */}
                  <p className="whitespace-nowrap leading-none text-gray-400">
                    <span className="sr-only">Prix de base, avant remise ALIGRO : </span>
                    {/* La taille de police doit être portée par le <s>
                        lui-même : le navigateur calcule la position du trait
                        d'après la taille de l'élément barré, pas celle d'un
                        enfant. Avec la taille sur un <span> interne, la barre
                        se plaçait beaucoup trop haut sur les chiffres. */}
                    <s className="font-condensed text-3xl font-bold decoration-[3px] decoration-gray-400">
                      CHF {base.toFixed(2)}
                    </s>
                    <span className="ml-1 text-sm">/mois</span>
                  </p>
                  <p className="mt-1.5 whitespace-nowrap leading-none">
                    <span className="sr-only">
                      Prix ALIGRO, remise de {discountPercent}% déjà appliquée :{" "}
                    </span>
                    <span className="font-condensed text-5xl font-black text-[var(--color-just-tag)]">
                      CHF {discounted.toFixed(2)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">/mois</span>
                  </p>
                  {showTotal && (
                    <p className="mt-2 text-sm text-gray-400">
                      <span className="sr-only">
                        Total de base pour la période, avant remise ALIGRO :{" "}
                      </span>
                      <s className="decoration-2 decoration-gray-400">CHF {baseTotal.toFixed(2)}</s>{" "}
                      <span className="sr-only">
                        Total ALIGRO pour la période, remise déjà appliquée :{" "}
                      </span>
                      <span className="font-bold text-gray-700">
                        CHF {discountedTotal.toFixed(2)}
                      </span>{" "}
                      {periodTotalLabel(billing)}
                    </p>
                  )}
                </div>

                <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-just-tag)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-just-tag)]">
                  <BadgePercent className="h-3.5 w-3.5" aria-hidden="true" />
                  -{discountPercent}% partenaire ALIGRO
                </div>

                <div className="mt-auto pt-6">
                  <p className="mb-2 text-center text-[11px] text-gray-500">
                    Code{" "}
                    <span className="font-mono font-bold text-gray-900">{ALIGRO_PROMO_CODE}</span>{" "}
                    à saisir au paiement
                  </p>
                  <Button
                    asChild
                    className={`w-full py-5 text-sm font-semibold ${
                      popular
                        ? "bg-[var(--color-just-tag)] text-white hover:bg-[var(--color-just-tag-dark)]"
                        : "border-2 border-gray-200 bg-transparent text-gray-900 hover:border-gray-900 hover:bg-transparent"
                    }`}
                  >
                    <Link href={`/fr/partenaire-inscription?ref=aligro&plan=${billing}&subs=${tier}`}>
                      Profiter de l&apos;offre
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Prix TTC · Sans engagement pour le plan mensuel · Sans le code {ALIGRO_PROMO_CODE}, le
          tarif standard s&apos;applique.
        </p>
      </div>
    </section>
  );
}
