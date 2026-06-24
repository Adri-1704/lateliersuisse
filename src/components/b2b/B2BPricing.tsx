"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Zap, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRICES = {
  monthly:    { 50: [49.95, 69.95] as const, 100: [59.95, 79.95] as const, 200: [99.95, 119.95] as const },
  semiannual: { 50: [44.90, 62.90] as const, 100: [53.90, 71.90] as const, 200: [89.90, 107.90] as const },
  annual:     { 50: [41.90, 58.90] as const, 100: [49.90, 66.90] as const, 200: [83.90, 99.90] as const },
} as const;

type Billing = keyof typeof PRICES;
type Tier = 50 | 100 | 200;

const BILLING_TABS: { id: Billing; label: string; badge?: string }[] = [
  { id: "monthly",    label: "Mensuel" },
  { id: "semiannual", label: "Semestriel", badge: "−11%" },
  { id: "annual",     label: "Annuel",     badge: "−17%" },
];

const TIERS: { count: Tier; desc: string; highlight: boolean }[] = [
  { count: 50,  desc: "Petits cafés, tables d'hôtes", highlight: false },
  { count: 100, desc: "Restaurants familiaux",         highlight: true  },
  { count: 200, desc: "Brasseries, pizzerias",         highlight: false },
];

const FEATURES = [
  "Fiche établissement complète",
  "Photos & vidéo",
  "Menus & carte",
  "Adresse, contact & plan",
  "Horaires d'ouverture",
  "Offres du moment",
  "Envoi WhatsApp 1–2×/semaine",
  "Opt-in géré pour vous",
];

interface B2BPricingProps {
  spotsRemaining?: number;
}

export function B2BPricing({ spotsRemaining = 100 }: B2BPricingProps) {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [isLaunch, setIsLaunch] = useState(true);

  const phaseIdx = isLaunch ? 0 : 1;

  function handleCTA(tier: Tier) {
    router.push(`/${locale}/partenaire-inscription?plan=${billing}&subs=${tier}`);
  }

  return (
    <section id="b2b-pricing" className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Des prix clairs, WhatsApp inclus
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Choisissez votre plan selon le nombre de clients à qui vous souhaitez envoyer vos menus et offres.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <ShieldCheck className="h-4 w-4" />
            14 jours d&apos;essai gratuit — satisfait ou remboursé
          </div>
        </div>

        {/* Early Bird banner */}
        {spotsRemaining > 0 && (
          <div className="mt-8 rounded-2xl bg-gray-900 p-5 text-center text-white shadow-lg sm:p-6">
            <div className="mb-1 flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-[var(--color-just-tag)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-just-tag)]">
                Prix de lancement
              </span>
            </div>
            <p className="text-sm font-semibold sm:text-base">
              Tarif réduit garanti à vie pour les 100 premiers inscrits. Plus que{" "}
              <strong>{spotsRemaining}</strong> places. Ces tarifs ne reviendront pas.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="mt-10 flex flex-col items-center gap-5">
          {/* Billing tabs */}
          <div className="flex gap-1 rounded-full bg-gray-200 p-1">
            {BILLING_TABS.map(({ id, label, badge }) => (
              <button
                key={id}
                onClick={() => setBilling(id)}
                className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  billing === id
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
            ))}
          </div>

          {/* Launch / catalogue toggle */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span
              className={`text-sm transition-colors ${
                isLaunch ? "font-semibold text-gray-900" : "text-gray-400"
              }`}
            >
              Prix lancement
            </span>
            <button
              role="switch"
              aria-checked={!isLaunch}
              onClick={() => setIsLaunch((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isLaunch ? "bg-[var(--color-just-tag)]" : "bg-gray-400"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                  isLaunch ? "" : "translate-x-5"
                }`}
              />
            </button>
            <span
              className={`text-sm transition-colors ${
                !isLaunch ? "font-semibold text-gray-900" : "text-gray-400"
              }`}
            >
              Prix catalogue
            </span>
            {isLaunch && (
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-just-tag)]">
                — 100 premiers inscrits
              </span>
            )}
          </div>
        </div>

        {/* Section subtitle */}
        <div className="mt-8 text-center">
          <p className="text-base font-semibold text-gray-900">
            WhatsApp inclus · 1 à 2× par semaine
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Choisissez le nombre d&apos;abonnés selon la taille de votre restaurant
          </p>
        </div>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TIERS.map(({ count, desc, highlight }) => {
            const price = PRICES[billing][count][phaseIdx];
            const showTotal = billing !== "monthly";
            const totalAmount = billing === "semiannual"
              ? (price * 6).toFixed(2)
              : (price * 12).toFixed(2);
            const totalPeriod = billing === "semiannual" ? "/ 6 mois" : "/ an";

            return (
              <div
                key={count}
                className={`relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white transition-all hover:-translate-y-1 hover:shadow-xl ${
                  highlight
                    ? "border-[var(--color-just-tag)] shadow-lg shadow-[var(--color-just-tag)]/10"
                    : "border-gray-200"
                }`}
              >
                {/* Popular badge */}
                {highlight && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2">
                    <span className="rounded-b-lg bg-[var(--color-just-tag)] px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                      ⭐ Populaire
                    </span>
                  </div>
                )}

                {/* Top */}
                <div className="p-6 pt-8">
                  <div
                    className={`mb-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      highlight
                        ? "bg-[var(--color-just-tag)]/10 text-[var(--color-just-tag)]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count} abonnés
                  </div>
                  <div className="font-condensed text-5xl font-black leading-none text-gray-900">
                    {count}
                    <span className="text-xl font-semibold text-gray-400"> abonnés</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{desc}</p>
                </div>

                {/* Price */}
                <div className="px-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-condensed text-lg font-bold text-[var(--color-just-tag)]">CHF</span>
                    <span className="font-condensed text-5xl font-black leading-none text-gray-900">
                      {price.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">/mois · tout inclus</p>
                  {showTotal && (
                    <p className="mt-1 text-xs text-gray-400">
                      soit{" "}
                      <span className="font-semibold text-gray-600">CHF {totalAmount}</span>{" "}
                      {totalPeriod}
                    </p>
                  )}
                </div>

                {/* WhatsApp badge */}
                <div className="mx-4 mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">WhatsApp inclus</p>
                      <p className="text-xs text-green-700">
                        Jusqu&apos;à {count} abonnés · 1 à 2× par semaine
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-auto px-4 pt-4">
                  <Button
                    className={`w-full py-5 text-sm font-semibold ${
                      highlight
                        ? "bg-[var(--color-just-tag)] text-white hover:bg-[var(--color-just-tag-dark)]"
                        : count === 200
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : "border-2 border-gray-200 bg-transparent text-gray-900 hover:border-gray-900 hover:bg-transparent"
                    }`}
                    onClick={() => handleCTA(count)}
                  >
                    Essayer 14 jours gratuits
                  </Button>
                  <p className="mb-4 mt-1.5 text-center text-[10px] text-gray-400">
                    Aucun débit · Annulable à tout moment
                  </p>
                </div>

                {/* Features */}
                <div className="border-t border-gray-100 px-6 py-5">
                  <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    Inclus dans chaque plan
                  </p>
                  <ul className="space-y-2">
                    {FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-2.5 w-2.5 text-green-600" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <p className="mt-10 text-center text-xs leading-relaxed text-gray-400">
          Tous les prix sont en CHF · TVA 8.1% non incluse
          <br />
          Prix de lancement garantis à vie pour les 100 premiers inscrits · Au-delà des abonnés inclus, paliers supplémentaires disponibles sur demande
        </p>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Des questions ?{" "}
            <a
              href="mailto:contact@just-tag.app"
              className="text-[var(--color-just-tag)] underline hover:text-[var(--color-just-tag-dark)]"
            >
              contact@just-tag.app
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
