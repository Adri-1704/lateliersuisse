"use client";

import { useTranslations } from "next-intl";
import { UtensilsCrossed, MapPin, Star, ChefHat } from "lucide-react";
import { SwissCrossIcon } from "@/components/ui/swiss-cross";
import { useIntersectionObserver, useAnimatedCounter } from "@/hooks/use-intersection-observer";

function AnimatedStat({ target, suffix, label, icon: Icon }: {
  target: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.3 });
  const count = useAnimatedCounter(target, isVisible);

  // Format large numbers (15000 -> 15K)
  const formatted = count >= 1000 ? `${Math.floor(count / 1000)}K` : `${count}`;

  return (
    <div ref={ref} className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="mt-3 text-2xl font-bold text-white sm:text-3xl">
        {formatted}{suffix}
      </div>
      <div className="mt-1 text-sm text-white/80">{label}</div>
    </div>
  );
}

export function StatsSection() {
  const t = useTranslations("stats");

  const stats = [
    { icon: UtensilsCrossed, target: 500, suffix: "+", label: t("restaurants") },
    { icon: MapPin, target: 26, suffix: "", label: t("cantons") },
    { icon: Star, target: 15000, suffix: "+", label: t("reviews") },
    { icon: ChefHat, target: 40, suffix: "+", label: t("cuisines") },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--color-just-tag)] py-12 sm:py-16">
      {/* Swiss cross pattern background */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="grid h-full w-full grid-cols-8 gap-12 p-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <svg key={i} width="24" height="24" viewBox="0 0 20 20" fill="none" className="text-white">
              <path d="M8.5 4h3v4.5H16v3h-4.5V16h-3v-4.5H4v-3h4.5V4z" fill="currentColor" />
            </svg>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Swiss Quality badge */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <SwissCrossIcon size={16} className="text-white" />
            {t("swissQuality")}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat, index) => (
            <AnimatedStat key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
