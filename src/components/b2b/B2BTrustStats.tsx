"use client";

import { useTranslations } from "next-intl";
import { UtensilsCrossed, MapPin, Star, ChefHat } from "lucide-react";

const stats = [
  { key: "restaurants", value: "500+", icon: UtensilsCrossed },
  { key: "cantons", value: "26", icon: MapPin },
  { key: "reviews", value: "15 000+", icon: Star },
  { key: "cuisines", value: "40+", icon: ChefHat },
] as const;

export function B2BTrustStats() {
  const t = useTranslations("b2b.stats");

  return (
    <section className="bg-[var(--color-just-tag)] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map(({ key, value, icon: Icon }) => (
            <div key={key} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white sm:text-3xl">
                {value}
              </div>
              <div className="mt-1 text-sm text-white/80">{t(key)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
