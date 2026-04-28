"use client";

import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";

interface B2BEarlyBirdBannerProps {
  spotsRemaining: number;
}

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

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 to-red-600 py-2.5 text-center text-sm font-semibold text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4">
        <Zap className="h-4 w-4" />
        <span>{t("active", { count: spotsRemaining })}</span>
      </div>
    </div>
  );
}
