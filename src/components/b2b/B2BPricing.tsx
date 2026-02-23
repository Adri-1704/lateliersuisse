"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, Gift, Star, Zap, ShieldCheck, Store, Camera, UtensilsCrossed, MapPin, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const includedFeatures = [
  { key: "presence", icon: Store },
  { key: "photoHighlight", icon: Camera },
  { key: "menuDisplay", icon: UtensilsCrossed },
  { key: "addressContact", icon: MapPin },
  { key: "openingHours", icon: Clock },
  { key: "videoPresentation", icon: Video },
];

const earlyBirdPlans = [
  {
    id: "monthly",
    pricePerMonth: "29.95",
    totalPrice: null,
    periodKey: "perMonth",
    features: ["listing", "photos", "stats"],
    toteBags: null,
    badge: null,
    highlighted: false,
  },
  {
    id: "semiannual",
    pricePerMonth: "26.50",
    totalPrice: "159",
    periodKey: "perSemester",
    features: ["listing", "photos", "stats", "badge"],
    toteBags: 50,
    badge: null,
    highlighted: false,
  },
  {
    id: "annual",
    pricePerMonth: "24.90",
    totalPrice: "299",
    periodKey: "perYear",
    features: ["listing", "photos", "stats", "badge", "priority"],
    toteBags: 100,
    badge: "bestValue",
    highlighted: true,
  },
];

const standardPlans = [
  {
    id: "monthly",
    pricePerMonth: "49.95",
    totalPrice: null,
    periodKey: "perMonth",
    features: ["listing", "photos", "stats"],
    toteBags: null,
    badge: null,
    highlighted: false,
  },
  {
    id: "semiannual",
    pricePerMonth: "44.80",
    totalPrice: "269",
    periodKey: "perSemester",
    features: ["listing", "photos", "stats", "badge"],
    toteBags: 50,
    badge: null,
    highlighted: false,
  },
  {
    id: "annual",
    pricePerMonth: "41.60",
    totalPrice: "499",
    periodKey: "perYear",
    features: ["listing", "photos", "stats", "badge", "priority"],
    toteBags: 100,
    badge: "bestValue",
    highlighted: true,
  },
];

const lifetimePlan = {
  price: "1 495",
  toteBags: 500,
  features: ["listing", "photos", "stats", "badge", "priority", "support"],
};

export function B2BPricing() {
  const t = useTranslations("b2b.pricing");
  const tMerchant = useTranslations("merchant");
  const params = useParams();
  const locale = params.locale as string;
  const [activeTab, setActiveTab] = useState<"earlyBird" | "standard">("earlyBird");

  const plans = activeTab === "earlyBird" ? earlyBirdPlans : standardPlans;

  return (
    <section id="b2b-pricing" className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            {t("subtitle")}
          </p>
          {/* Guarantee badge */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <ShieldCheck className="h-4 w-4" />
            {t("guarantee")}
          </div>
        </div>

        {/* Tab toggle */}
        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex rounded-xl bg-gray-200 p-1">
            <button
              onClick={() => setActiveTab("earlyBird")}
              className={`relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === "earlyBird"
                  ? "bg-[var(--color-just-tag)] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Zap className="h-4 w-4" />
              {t("earlyBirdTab")}
              <Badge className="ml-1 bg-white/20 text-white text-[10px] border-0 px-1.5 py-0">
                {t("earlyBirdBadge")}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab("standard")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === "standard"
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("standardTab")}
            </button>
          </div>
        </div>

        {activeTab === "earlyBird" && (
          <div className="mt-4 text-center">
            <p className="text-sm text-[var(--color-just-tag)] font-medium">
              <Star className="mr-1 inline h-4 w-4" />
              {t("earlyBirdNote")}
            </p>
            {/* Progress bar for early bird spots */}
            <div className="mx-auto mt-3 max-w-sm">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-[var(--color-just-tag)] transition-all" style={{ width: "62%" }} />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">{t("spotsLeft", { count: 38 })}</p>
            </div>
          </div>
        )}

        {/* Included in all plans */}
        <div className="mt-10 rounded-2xl border border-[var(--color-alpine-green)]/20 bg-[var(--color-warm-cream)] p-6 sm:p-8">
          <h3 className="text-center text-sm font-bold uppercase tracking-wider text-[var(--color-alpine-green)]">
            {t("includedTitle")}
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md ${
                plan.highlighted
                  ? "border-[var(--color-just-tag)] ring-2 ring-[var(--color-just-tag)]/20 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {plan.badge === "bestValue" && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-just-tag)] text-white border-0 px-3">
                  {t("bestValue")}
                </Badge>
              )}

              <h3 className="text-lg font-semibold text-gray-900">
                {tMerchant(plan.id)}
              </h3>

              {/* Price */}
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    CHF {plan.pricePerMonth}
                  </span>
                  <span className="text-sm text-gray-500">
                    {t("perMonthLabel")}
                  </span>
                </div>
                {plan.totalPrice && (
                  <p className="mt-1 text-sm text-gray-500">
                    {t("totalLabel", { price: plan.totalPrice })}
                  </p>
                )}
              </div>

              {/* Tote bags bonus */}
              {plan.toteBags && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-just-tag-light)] px-3 py-2">
                  <Gift className="h-4 w-4 shrink-0 text-[var(--color-just-tag)]" />
                  <span className="text-sm font-medium text-[var(--color-just-tag-dark)]">
                    {t("toteBags", { count: plan.toteBags })}
                  </span>
                </div>
              )}

              {/* Features */}
              <ul className="mt-5 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-[var(--color-just-tag)]" />
                    <span className="text-gray-700">{t(`features.${feature}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Lifetime Plan */}
        <div className="mt-8 rounded-2xl border-2 border-gray-900 bg-gray-900 p-6 sm:p-8 text-white">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{t("lifetimeTitle")}</h3>
                <Badge className="bg-[var(--color-just-tag)] text-white border-0">
                  {t("lifetimeExclusive")}
                </Badge>
              </div>
              <p className="mt-2 text-gray-300">{t("lifetimeDesc")}</p>
              <div className="mt-3 flex items-center gap-2">
                <Gift className="h-5 w-5 text-[var(--color-just-tag)]" />
                <span className="font-medium text-[var(--color-just-tag)]">
                  {t("toteBags", { count: lifetimePlan.toteBags })}
                </span>
              </div>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <div className="text-3xl font-bold sm:text-4xl">
                CHF {lifetimePlan.price}
              </div>
              <span className="text-sm text-gray-400">{t("oneTimePayment")}</span>
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
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Button
            asChild
            size="lg"
            className="bg-[var(--color-just-tag)] px-8 text-base font-semibold hover:bg-[var(--color-just-tag-dark)]"
          >
            <Link href={`/${locale}/partenaire-inscription`}>
              {t("cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-gray-500">{t("note")}</p>
        </div>
      </div>
    </section>
  );
}
