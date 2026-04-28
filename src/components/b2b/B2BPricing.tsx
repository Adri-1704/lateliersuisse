"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Check, Gift, Zap, ShieldCheck, Store, Camera, UtensilsCrossed, MapPin, Clock, Video, MessageCircle, ChefHat, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const includedFeatures = [
  { key: "presence", icon: Store },
  { key: "photoHighlight", icon: Camera },
  { key: "menuDisplay", icon: UtensilsCrossed },
  { key: "platDuJour", icon: ChefHat },
  { key: "whatsappSignup", icon: MessageCircle },
  { key: "addressContact", icon: MapPin },
  { key: "openingHours", icon: Clock },
  { key: "videoPresentation", icon: Video },
];

const earlyBirdPlans = [
  {
    id: "monthly",
    pricePerMonth: 29.95,
    standardPrice: "49.95",
    totalPrice: null,
    toteBags: null,
    badge: null,
    highlighted: false,
  },
  {
    id: "semiannual",
    pricePerMonth: 26.50,
    standardPrice: "44.80",
    totalPrice: "159",
    toteBags: 50,
    badge: null,
    highlighted: false,
  },
  {
    id: "annual",
    pricePerMonth: 24.90,
    standardPrice: "41.60",
    totalPrice: "299",
    toteBags: 100,
    badge: "bestValue",
    highlighted: true,
  },
];

const whatsappOptions = [
  { id: "none", label: "Pas d'option WhatsApp", price: 0 },
  { id: "hebdo_starter", label: "Hebdo — 50 abonnés", price: 9.90 },
  { id: "hebdo_pro", label: "Hebdo — 200 abonnés", price: 24.90 },
  { id: "hebdo_premium", label: "Hebdo — 500 abonnés", price: 49.90 },
  { id: "quotidien_starter", label: "Quotidien — 50 abonnés", price: 29.90 },
  { id: "quotidien_pro", label: "Quotidien — 200 abonnés", price: 79.90 },
  { id: "quotidien_premium", label: "Quotidien — 500 abonnés", price: 199.90 },
];

const lifetimePlan = {
  price: "1 495",
  toteBags: 500,
  features: ["listing", "photos", "stats", "badge", "priority", "support"],
};

interface B2BPricingProps {
  spotsRemaining?: number;
}

export function B2BPricing({ spotsRemaining = 100 }: B2BPricingProps) {
  const t = useTranslations("b2b.pricing");
  const tMerchant = useTranslations("merchant");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [whatsappChoice, setWhatsappChoice] = useState<Record<string, string>>({});

  function getWhatsappMonthlyPrice(planId: string): number {
    const choice = whatsappChoice[planId] || "none";
    return whatsappOptions.find((o) => o.id === choice)?.price || 0;
  }

  function getPeriodMultiplier(planId: string): number {
    if (planId === "semiannual") return 6;
    if (planId === "annual") return 12;
    return 1;
  }

  function getPeriodLabel(planId: string): string {
    if (planId === "semiannual") return "/6 mois";
    if (planId === "annual") return "/an";
    return "/mois";
  }

  function handleSelectPlan(planId: string) {
    setSelectedPlan(planId);
    const waChoice = whatsappChoice[planId] || "none";
    const planParam = planId === "lifetime" ? "lifetime" : `${planId}_early`;
    const waParam = waChoice !== "none" ? `&whatsapp=${waChoice}` : "";
    router.push(`/${locale}/partenaire-inscription?plan=${planParam}${waParam}`);
  }

  return (
    <section id="b2b-pricing" className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Des prix clairs, sans surprise
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Tous les plans incluent les mêmes fonctionnalités. Ajoutez l&apos;option WhatsApp pour notifier vos clients fidèles.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <ShieldCheck className="h-4 w-4" />
            14 jours d&apos;essai gratuit — satisfait ou remboursé
          </div>
        </div>

        {/* Early Bird banner */}
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-[var(--color-just-tag)] to-[var(--color-just-tag-dark)] p-6 text-center text-white shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Offre de lancement</span>
            <Badge className="bg-white text-[var(--color-just-tag)] border-0 font-bold">-40%</Badge>
          </div>
          <p className="text-base sm:text-lg font-semibold">
            {spotsRemaining > 0
              ? <>Offre de lancement : -40% pour les 100 premiers abonnés. Ces tarifs ne reviendront pas.</>
              : <>Offre Early Bird bientôt terminée. Inscrivez-vous avant qu&apos;il ne soit trop tard.</>}
          </p>
        </div>

        {/* Included in all plans */}
        <div className="mt-10 rounded-2xl border border-[var(--color-alpine-green)]/20 bg-[var(--color-warm-cream)] p-6 sm:p-8">
          <h3 className="text-center text-sm font-bold uppercase tracking-wider text-[var(--color-alpine-green)]">
            {t("includedTitle")}
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {includedFeatures.map(({ key, icon: Icon }) => (
              <div key={key} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-alpine-green)]/10">
                  <Icon className="h-5 w-5 text-[var(--color-alpine-green)]" />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {t(`included.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {earlyBirdPlans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const waMonthly = getWhatsappMonthlyPrice(plan.id);
            const multiplier = getPeriodMultiplier(plan.id);
            const periodLabel = getPeriodLabel(plan.id);
            const totalPeriod = (plan.pricePerMonth + waMonthly) * multiplier;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer rounded-2xl border-2 bg-white p-6 transition-all ${
                  isSelected
                    ? "border-[var(--color-just-tag)] ring-2 ring-[var(--color-just-tag)]/20 shadow-lg"
                    : plan.highlighted
                      ? "border-[var(--color-just-tag)] shadow-lg hover:shadow-xl"
                      : "border-gray-200 hover:shadow-md"
                }`}
              >
                {plan.badge === "bestValue" && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-just-tag)] text-white border-0 px-3">
                    Meilleur rapport qualité-prix
                  </Badge>
                )}

                <h3 className="text-lg font-semibold text-gray-900">
                  {tMerchant(plan.id)}
                </h3>

                {/* Base Price */}
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[var(--color-just-tag)]">
                      CHF {plan.pricePerMonth.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">/mois</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2 text-sm">
                    <span className="text-gray-400 line-through">CHF {plan.standardPrice}/mois</span>
                    <span className="font-semibold text-[var(--color-just-tag)]">après 100 inscrits</span>
                  </div>
                  {plan.totalPrice && (
                    <p className="mt-1 text-sm text-gray-500">
                      soit CHF {plan.totalPrice} au total
                    </p>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    14 jours gratuits
                  </div>
                </div>

                {/* Tote bags bonus */}
                {plan.toteBags && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-just-tag-light)] px-3 py-2">
                    <Gift className="h-4 w-4 shrink-0 text-[var(--color-just-tag)]" />
                    <span className="text-sm font-medium text-[var(--color-just-tag-dark)]">
                      + {plan.toteBags} tote-bags personnalisés offerts
                    </span>
                  </div>
                )}

                {/* Features */}
                <ul className="mt-5 space-y-2.5">
                  {[
                    "Fiche complète",
                    "Photos & vidéo",
                    "Plat du jour via WhatsApp",
                    "Menus & contact",
                    "Localisation",
                    "Offres du moment",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-[var(--color-just-tag)]" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* WhatsApp add-on selector */}
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Option WhatsApp</span>
                  </div>
                  <p className="text-xs text-green-600 mb-2">
                    Envoyez vos plats du jour directement par WhatsApp à vos clients
                  </p>
                  <div className="relative">
                    <select
                      value={whatsappChoice[plan.id] || "none"}
                      onChange={(e) => {
                        e.stopPropagation();
                        setWhatsappChoice((prev) => ({ ...prev, [plan.id]: e.target.value }));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full appearance-none rounded-lg border border-green-300 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none"
                    >
                      {whatsappOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.id === "none" ? opt.label : `${opt.label} — +${opt.price.toFixed(2)} CHF/mois`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Total */}
                {waMonthly > 0 && (
                  <div className="mt-3 rounded-lg bg-gray-900 px-4 py-3 text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {multiplier > 1 ? `Total (paiement unique)` : "Total mensuel"}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      CHF {totalPeriod.toFixed(2)}<span className="text-sm font-normal text-gray-400">{periodLabel}</span>
                    </p>
                    {multiplier > 1 && (
                      <p className="mt-1 text-xs text-gray-500">
                        soit CHF {(plan.pricePerMonth + waMonthly).toFixed(2)}/mois
                      </p>
                    )}
                  </div>
                )}

                <Button
                  className={`mt-4 w-full ${
                    isSelected
                      ? "bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)]"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.id);
                  }}
                >
                  14 jours gratuits — sans engagement
                </Button>
                <p className="mt-2 text-center text-[11px] text-gray-500">
                  Aucun débit avant la fin des 14 jours · Annulable à tout moment
                </p>
              </div>
            );
          })}
        </div>

        {/* Lifetime Plan */}
        <div
          onClick={() => setSelectedPlan("lifetime")}
          className={`mt-8 cursor-pointer rounded-2xl border-2 p-6 sm:p-8 text-white transition-all ${
            selectedPlan === "lifetime"
              ? "border-[var(--color-just-tag)] bg-gray-900 ring-2 ring-[var(--color-just-tag)]/20"
              : "border-gray-900 bg-gray-900 hover:border-gray-700"
          }`}
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{t("lifetimeTitle")}</h3>
                <Badge className="bg-[var(--color-just-tag)] text-white border-0">
                  Exclusif
                </Badge>
              </div>
              <p className="mt-2 text-gray-300 max-w-lg">
                Le calcul est simple : à CHF 24.90/mois, vous atteignez CHF 1 495 en 5 ans. Avec l&apos;offre à vie, vous économisez tout ce qui vient après. Et les 500 tote-bags personnalisés (valeur estimée CHF 2 500) sont offerts.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Gift className="h-5 w-5 text-[var(--color-just-tag)]" />
                <span className="font-medium text-[var(--color-just-tag)]">
                  + 500 tote-bags personnalisés offerts
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-end shrink-0">
              <div className="text-center sm:text-right">
                <div className="text-3xl font-bold sm:text-4xl">
                  CHF {lifetimePlan.price}
                </div>
                <span className="text-sm text-gray-400">paiement unique</span>
              </div>
              <Button
                className={`${
                  selectedPlan === "lifetime"
                    ? "bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)]"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan("lifetime");
                }}
              >
                Choisir l&apos;offre à vie
              </Button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-start">
            {lifetimePlan.features.map((feature) => (
              <span key={feature} className="flex items-center gap-1.5 text-sm text-gray-300">
                <Check className="h-4 w-4 text-[var(--color-just-tag)]" />
                {t(`features.${feature}`)}
              </span>
            ))}
          </div>

          {/* WhatsApp add-on for lifetime */}
          <div className="mt-6 rounded-xl border border-green-400/30 bg-green-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-green-400" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Option WhatsApp</span>
              <span className="rounded-full bg-green-400/20 px-2 py-0.5 text-xs text-green-300">abonnement mensuel</span>
            </div>
            <p className="text-xs text-green-300 mb-3">
              Envoyez vos plats du jour par WhatsApp à vos clients. Facturé mensuellement en plus du paiement unique.
            </p>
            <div className="relative">
              <select
                value={whatsappChoice["lifetime"] || "none"}
                onChange={(e) => {
                  e.stopPropagation();
                  setWhatsappChoice((prev) => ({ ...prev, lifetime: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full appearance-none rounded-lg border border-green-400/30 bg-gray-800 px-3 py-2 pr-8 text-sm text-white focus:border-green-400 focus:ring-1 focus:ring-green-400/30 outline-none"
              >
                {whatsappOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.id === "none" ? opt.label : `${opt.label} — +${opt.price.toFixed(2)} CHF/mois`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {getWhatsappMonthlyPrice("lifetime") > 0 && (
              <div className="mt-3 rounded-lg bg-gray-800 px-4 py-3 text-center">
                <p className="text-sm text-white">
                  <span className="font-bold">CHF {lifetimePlan.price}</span>
                  <span className="text-gray-400"> une fois</span>
                  <span className="text-gray-500 mx-2">+</span>
                  <span className="font-bold text-green-400">CHF {getWhatsappMonthlyPrice("lifetime").toFixed(2)}</span>
                  <span className="text-gray-400">/mois</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Light contact alternative */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Pas prêt ? Laissez-nous votre numéro, on vous rappelle :{" "}
            <a href="mailto:contact@just-tag.app" className="text-[var(--color-just-tag)] underline hover:text-[var(--color-just-tag-dark)]">
              contact@just-tag.app
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
