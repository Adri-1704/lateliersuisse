"use client";

import { Zap, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface B2BEarlyBirdBannerProps {
  spotsRemaining: number;
}

const FOUNDING_LIMIT = 50;

export function B2BEarlyBirdBanner({ spotsRemaining }: B2BEarlyBirdBannerProps) {
  const t = useTranslations("b2bLanding.earlyBirdBanner");

  if (spotsRemaining <= 0) {
    return (
      <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 to-red-600 py-2.5 text-center text-sm font-semibold text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4">
          <Zap className="h-4 w-4" />
          <span>{t("expired")}</span>
        </div>
      </div>
    );
  }

  // Sub-urgency : the first 50 get an exclusive "Founding 50" bonus
  const soldCount = 100 - spotsRemaining;
  const foundingRemaining = Math.max(0, FOUNDING_LIMIT - soldCount);
  const showFounding = foundingRemaining > 0;

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 to-red-600 py-2.5 text-center text-sm font-semibold text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-4 w-4" />
          {t("active", { count: spotsRemaining })}
        </span>
        {showFounding && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Founding 50 · {foundingRemaining} places bonus
          </span>
        )}
      </div>
    </div>
  );
}
