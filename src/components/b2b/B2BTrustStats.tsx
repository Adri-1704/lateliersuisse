"use client";

import { UtensilsCrossed, MapPin, Star, Ban } from "lucide-react";
import { useTranslations } from "next-intl";

interface B2BTrustStatsProps {
  totalRestaurants: number;
  totalReviews: number;
}

function formatCount(n: number): string {
  return n.toLocaleString("fr-CH").replace(/\u202f|,/g, " ");
}

export function B2BTrustStats({ totalRestaurants, totalReviews }: B2BTrustStatsProps) {
  const t = useTranslations("b2bLanding.trustStats");

  const stats = [
    { value: `${formatCount(totalRestaurants)}+`, label: t("restaurants"), icon: UtensilsCrossed },
    { value: "7", label: t("cantons"), icon: MapPin },
    { value: `${formatCount(totalReviews)}+`, label: t("reviews"), icon: Star },
    { value: "0%", label: t("commission"), icon: Ban },
  ];

  return (
    <section className="bg-[var(--color-just-tag)] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white sm:text-3xl">
                {value}
              </div>
              <div className="mt-1 text-sm text-white/80">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
