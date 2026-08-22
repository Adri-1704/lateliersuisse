"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Grille unique et définitive depuis le 2026-08-22 (fin de l'offre de
// lancement Early Bird : ces tarifs sont désormais les prix de base, pour
// tout le monde et pour toujours).
const PRICES = {
  monthly:    { 50: 59.95,  100: 89.95,  200: 149.95 },
  semiannual: { 50: 52.95,  100: 79.95,  200: 132.95 },
  annual:     { 50: 49.95,  100: 74.95,  200: 124.95 },
} as const;

type Billing = keyof typeof PRICES;
type Tier = 50 | 100 | 200;

const BILLING_TAB_IDS: { id: Billing; badge?: string }[] = [
  { id: "monthly" },
  { id: "semiannual", badge: "−11%" },
  { id: "annual",     badge: "−17%" },
];

const TIER_CONFIG: { count: Tier; descKey: "small" | "medium" | "large"; highlight: boolean }[] = [
  { count: 50,  descKey: "small",  highlight: false },
  { count: 100, descKey: "medium", highlight: true  },
  { count: 200, descKey: "large",  highlight: false },
];

export function B2BPricing() {
  const t = useTranslations("b2bLanding.pricing");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [billing, setBilling] = useState<Billing>("monthly");

  const features = t.raw("features") as string[];

  function handleCTA(tier: Tier) {
    router.push(`/${locale}/partenaire-inscription?plan=${billing}&subs=${tier}`);
  }

  return (
    <section id="b2b-pricing" className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            {t("gridTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            {t("gridSubtitle", { count: 800 })}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <ShieldCheck className="h-4 w-4" />
            {t("trialBadge")}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-col items-center gap-5">
          {/* Billing tabs */}
          <div className="flex gap-1 rounded-full bg-gray-200 p-1">
            {BILLING_TAB_IDS.map(({ id, badge }) => (
              <button
                key={id}
                onClick={() => setBilling(id)}
                className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  billing === id
                    ? "bg-white font-semibold text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t(`billingTabs.${id}`)}
                {badge && (
                  <span className="absolute -right-1.5 -top-2 rounded-full bg-[var(--color-just-tag)] px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section subtitle */}
        <div className="mt-8 text-center">
          <p className="text-base font-semibold text-gray-900">
            {t("messagesIncludedTitle")}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t("messagesIncludedSubtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TIER_CONFIG.map(({ count, descKey, highlight }) => {
            const price = PRICES[billing][count];
            const showTotal = billing !== "monthly";
            const totalAmount = billing === "semiannual"
              ? (price * 6).toFixed(2)
              : (price * 12).toFixed(2);
            const totalPeriod = billing === "semiannual" ? t("totalPeriodSemiannual") : t("totalPeriodAnnual");

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
                      ⭐ {t("popularBadge")}
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
                    {t("messagesPerMonthBadge", { count: count * 4 })}
                  </div>
                  <div className="font-condensed text-5xl font-black leading-none text-gray-900">{count * 4}</div>
                  <p className="mt-0.5 text-sm font-semibold text-gray-400">{t("messagesPerMonthLabel")}</p>
                  <p className="mt-1 text-xs text-gray-500">{t(`tierDescriptions.${descKey}`)}</p>
                </div>

                {/* Price */}
                <div className="px-6">
                  <p className="whitespace-nowrap leading-none">
                    <span className="font-condensed text-lg font-bold text-[var(--color-just-tag)] align-baseline">CHF </span><span className="font-condensed text-5xl font-black leading-none text-gray-900">{price.toFixed(2)}</span><span className="ml-1 text-xs text-gray-500 align-baseline"> {t("priceSuffix")}</span>
                  </p>
                  {showTotal && (
                    <p className="mt-1 text-xs text-gray-400">
                      {t("totalPricePrefix")}{" "}
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
                      <p className="text-xs font-semibold text-green-800">{t("whatsappIncludedTitle")}</p>
                      <p className="text-xs text-green-700">
                        {t("whatsappIncludedDesc", { count: count * 4 })}
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
                    {t("ctaButton")}
                  </Button>
                  <p className="mb-4 mt-1.5 text-center text-[10px] text-gray-400">
                    {t("ctaNote")}
                  </p>
                </div>

                {/* Features */}
                <div className="border-t border-gray-100 px-6 py-5">
                  <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    {t("includedInPlan")}
                  </p>
                  <ul className="space-y-2">
                    {features.map((f) => (
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
          {t("footnote1")}
          <br />
          {t("footnote2")}
        </p>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {t("questionsPrefix")}{" "}
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
