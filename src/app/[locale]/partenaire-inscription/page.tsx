"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Check, Star, Zap, Crown, Infinity, Gift, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const earlyBirdPlans = [
  {
    id: "monthly",
    icon: Star,
    pricePerMonth: "29.95",
    totalPrice: null,
    period: "perMonth",
    color: "border-gray-200",
    badge: null,
    features: ["listing", "photos", "menu", "stats"],
    toteBags: null,
  },
  {
    id: "semiannual",
    icon: Zap,
    pricePerMonth: "26.50",
    totalPrice: "159",
    period: "perSemester",
    color: "border-blue-300",
    badge: null,
    features: ["listing", "photos", "menu", "stats", "badge"],
    toteBags: 50,
  },
  {
    id: "annual",
    icon: Crown,
    pricePerMonth: "24.90",
    totalPrice: "299",
    period: "perYear",
    color: "border-[var(--color-just-tag)]",
    badge: "popular",
    features: ["listing", "photos", "menu", "stats", "badge", "priority"],
    toteBags: 100,
  },
  {
    id: "lifetime",
    icon: Infinity,
    pricePerMonth: null,
    totalPrice: "1 495",
    period: "oneTime",
    color: "border-yellow-400",
    badge: "bestValue",
    features: ["listing", "photos", "menu", "stats", "badge", "priority", "support"],
    toteBags: 500,
  },
];

const standardPlans = [
  {
    id: "monthly",
    icon: Star,
    pricePerMonth: "49.95",
    totalPrice: null,
    period: "perMonth",
    color: "border-gray-200",
    badge: null,
    features: ["listing", "photos", "menu", "stats"],
    toteBags: null,
  },
  {
    id: "semiannual",
    icon: Zap,
    pricePerMonth: "44.80",
    totalPrice: "269",
    period: "perSemester",
    color: "border-blue-300",
    badge: null,
    features: ["listing", "photos", "menu", "stats", "badge"],
    toteBags: 50,
  },
  {
    id: "annual",
    icon: Crown,
    pricePerMonth: "41.60",
    totalPrice: "499",
    period: "perYear",
    color: "border-[var(--color-just-tag)]",
    badge: "popular",
    features: ["listing", "photos", "menu", "stats", "badge", "priority"],
    toteBags: 100,
  },
  {
    id: "lifetime",
    icon: Infinity,
    pricePerMonth: null,
    totalPrice: "1 495",
    period: "oneTime",
    color: "border-yellow-400",
    badge: "bestValue",
    features: ["listing", "photos", "menu", "stats", "badge", "priority", "support"],
    toteBags: 500,
  },
];

export default function MerchantSignupPage() {
  const t = useTranslations("merchant");
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [step, setStep] = useState<"plans" | "form">("plans");
  const [activeTab, setActiveTab] = useState<"earlyBird" | "standard">("earlyBird");

  const plans = activeTab === "earlyBird" ? earlyBirdPlans : standardPlans;
  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <>
      {/* noindex meta */}
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
            {t("subtitle")}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <ShieldCheck className="h-4 w-4" />
            Satisfait ou remboursé pendant 30 jours
          </div>
        </div>

        {step === "plans" && (
          <>
            {/* Tab toggle Early Bird / Standard */}
            <div className="mt-8 flex items-center justify-center">
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
                  Early Bird
                  <Badge className="ml-1 bg-white/20 text-white text-[10px] border-0 px-1.5 py-0">
                    -40%
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
                  Standard
                </button>
              </div>
            </div>

            {activeTab === "earlyBird" && (
              <div className="mt-4 text-center">
                <p className="text-sm text-[var(--color-just-tag)] font-medium">
                  <Star className="mr-1 inline h-4 w-4" />
                  Tarif de lancement réservé aux 100 premiers restaurants
                </p>
                <div className="mx-auto mt-3 max-w-sm">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-[var(--color-just-tag)] transition-all" style={{ width: "62%" }} />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">38 places restantes</p>
                </div>
              </div>
            )}

            {/* Pricing Plans */}
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const PlanIcon = plan.icon;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative cursor-pointer rounded-2xl border-2 bg-white p-6 transition-all ${
                      isSelected
                        ? "border-[var(--color-just-tag)] shadow-lg ring-2 ring-[var(--color-just-tag)]/20"
                        : `${plan.color} hover:shadow-md`
                    }`}
                  >
                    {plan.badge && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-just-tag)] text-white border-0 px-3">
                        {t(plan.badge)}
                      </Badge>
                    )}
                    <div className="text-center">
                      <PlanIcon className={`mx-auto h-8 w-8 ${isSelected ? "text-[var(--color-just-tag)]" : "text-gray-400"}`} />
                      <h3 className="mt-3 text-lg font-semibold text-gray-900">
                        {t(plan.id)}
                      </h3>
                      <div className="mt-2">
                        {plan.pricePerMonth ? (
                          <>
                            <span className="text-3xl font-bold text-gray-900">
                              CHF {plan.pricePerMonth}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">/mois</span>
                          </>
                        ) : (
                          <>
                            <span className="text-3xl font-bold text-gray-900">
                              CHF {plan.totalPrice}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              {t(plan.period)}
                            </span>
                          </>
                        )}
                      </div>
                      {plan.totalPrice && plan.pricePerMonth && (
                        <p className="mt-1 text-xs text-gray-500">
                          soit CHF {plan.totalPrice} au total
                        </p>
                      )}
                    </div>

                    {/* Tote bags bonus */}
                    {plan.toteBags && (
                      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-just-tag)]/5 px-2 py-1.5">
                        <Gift className="h-3.5 w-3.5 shrink-0 text-[var(--color-just-tag)]" />
                        <span className="text-xs font-medium text-[var(--color-just-tag)]">
                          + {plan.toteBags} tote bags offerts
                        </span>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          <span className="text-gray-700">{t(`features.${feature}`)}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`mt-6 w-full ${
                        isSelected
                          ? "bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)]"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan.id);
                        setStep("form");
                      }}
                    >
                      {t("subscribe")}
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {step === "form" && (
          <div className="mx-auto mt-12 max-w-lg">
            <div className="rounded-2xl border bg-white p-8 shadow-sm">
              <div className="mb-6 text-center">
                <Badge className="bg-[var(--color-just-tag)] text-white border-0 text-sm px-4 py-1">
                  {t(selectedPlan)} — CHF {selectedPlanData?.pricePerMonth ? `${selectedPlanData.pricePerMonth}/mois` : selectedPlanData?.totalPrice}
                </Badge>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Stripe checkout integration would go here
                  alert("Stripe Checkout integration - Coming soon!");
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">{t("form.name")}</Label>
                  <Input id="name" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email">{t("form.email")}</Label>
                  <Input id="email" type="email" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="phone">{t("form.phone")}</Label>
                  <Input id="phone" type="tel" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="restaurantName">{t("form.restaurantName")}</Label>
                  <Input id="restaurantName" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="city">{t("form.city")}</Label>
                  <Input id="city" required className="mt-1.5" />
                </div>

                <Button
                  type="submit"
                  className="mt-6 w-full bg-[var(--color-just-tag)] py-3 text-base hover:bg-[var(--color-just-tag-dark)]"
                >
                  {t("form.submit")}
                </Button>
              </form>

              <Button
                variant="ghost"
                className="mt-4 w-full"
                onClick={() => setStep("plans")}
              >
                ← Changer de plan
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
