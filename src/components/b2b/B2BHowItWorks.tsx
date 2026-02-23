"use client";

import { useTranslations } from "next-intl";
import { UserPlus, ImagePlus, Globe, TrendingUp } from "lucide-react";

const steps = [
  { key: "step1", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
  { key: "step2", icon: ImagePlus, color: "bg-orange-50 text-orange-600" },
  { key: "step3", icon: Globe, color: "bg-green-50 text-green-600" },
  { key: "step4", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
];

export function B2BHowItWorks() {
  const t = useTranslations("b2b.howItWorks");

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="relative text-center">
                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gray-200 lg:block" />
                )}

                {/* Step number */}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-just-tag)] text-xl font-bold text-white shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-xl ${step.color}`}>
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {t(`${step.key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
