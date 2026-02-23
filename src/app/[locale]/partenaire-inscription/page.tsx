"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Check, Star, Zap, Crown, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const plans = [
  {
    id: "monthly",
    icon: Star,
    price: 49,
    period: "perMonth",
    color: "border-gray-200",
    features: ["listing", "photos", "menu", "stats"],
  },
  {
    id: "semiannual",
    icon: Zap,
    price: 259,
    period: "perSemester",
    color: "border-blue-300",
    badge: null,
    features: ["listing", "photos", "menu", "stats", "badge"],
  },
  {
    id: "annual",
    icon: Crown,
    price: 459,
    period: "perYear",
    color: "border-[var(--color-just-tag)]",
    badge: "popular",
    features: ["listing", "photos", "menu", "stats", "badge", "priority"],
  },
  {
    id: "lifetime",
    icon: Infinity,
    price: 999,
    period: "oneTime",
    color: "border-yellow-400",
    badge: "bestValue",
    features: ["listing", "photos", "menu", "stats", "badge", "priority", "support"],
  },
];

export default function MerchantSignupPage() {
  const t = useTranslations("merchant");
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [step, setStep] = useState<"plans" | "form">("plans");

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
        </div>

        {step === "plans" && (
          <>
            {/* Pricing Plans */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                        <span className="text-3xl font-bold text-gray-900">
                          CHF {plan.price}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {t(plan.period)}
                        </span>
                      </div>
                    </div>

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
                <Badge className="bg-[var(--color-just-tag)] text-white border-0">
                  {t(selectedPlan)} - CHF {plans.find((p) => p.id === selectedPlan)?.price}
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
