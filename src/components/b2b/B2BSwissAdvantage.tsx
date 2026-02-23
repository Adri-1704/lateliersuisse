"use client";

import { useTranslations } from "next-intl";
import { Globe, Search, ShieldCheck, Users } from "lucide-react";
import { SwissCrossIcon } from "@/components/ui/swiss-cross";

const advantages = [
  {
    key: "trilingual",
    icon: Globe,
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "seo",
    icon: Search,
    color: "bg-green-50 text-green-600",
  },
  {
    key: "data",
    icon: ShieldCheck,
    color: "bg-purple-50 text-purple-600",
  },
  {
    key: "community",
    icon: Users,
    color: "bg-orange-50 text-orange-600",
  },
];

export function B2BSwissAdvantage() {
  const t = useTranslations("b2b.swissAdvantage");

  return (
    <section className="bg-[var(--color-warm-cream)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-just-tag)]/10 px-4 py-1.5 text-sm font-semibold text-[var(--color-just-tag)]">
            <SwissCrossIcon size={14} />
            {t("badge")}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((adv) => {
            const Icon = adv.icon;
            return (
              <div
                key={adv.key}
                className="rounded-2xl border bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl ${adv.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {t(`${adv.key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {t(`${adv.key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
