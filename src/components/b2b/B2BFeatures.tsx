"use client";

import { Store, Search, Camera, MessageSquare, BarChart3, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

const featureKeys = [
  { icon: Store, key: "profile" },
  { icon: Search, key: "seo" },
  { icon: Camera, key: "gallery" },
  { icon: MessageSquare, key: "reviewMgmt" },
  { icon: BarChart3, key: "stats" },
  { icon: Phone, key: "directContact" },
] as const;

export function B2BFeatures() {
  const t = useTranslations("b2bLanding.features");

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

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-just-tag)]/10">
                <Icon className="h-6 w-6 text-[var(--color-just-tag)]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {t(`items.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
