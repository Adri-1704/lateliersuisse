"use client";

import { ShieldCheck, Globe, Award } from "lucide-react";
import { SwissCrossIcon } from "@/components/ui/swiss-cross";

export function SwissTrustBanner() {
  return (
    <div className="border-t border-gray-200 bg-[var(--color-warm-cream)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-3 sm:gap-10 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:text-sm">
          <SwissCrossIcon size={14} className="text-[var(--color-just-tag)]" />
          Conçu en Suisse | Made in Switzerland | In der Schweiz entwickelt
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:text-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-alpine-green)]" />
          Données sécurisées
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:text-sm">
          <Globe className="h-3.5 w-3.5 text-blue-500" />
          FR · DE · EN
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 sm:text-sm">
          <Award className="h-3.5 w-3.5 text-[var(--color-gold-accent)]" />
          Qualité Suisse
        </span>
      </div>
    </div>
  );
}
