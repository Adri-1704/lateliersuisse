"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwissCrossIcon } from "@/components/ui/swiss-cross";

export function B2BHero() {
  const t = useTranslations("b2b.hero");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-gray-900/70" />

      {/* Swiss cross watermark */}
      <svg className="pointer-events-none absolute right-10 top-10 opacity-[0.04]" width="300" height="300" viewBox="0 0 32 32" fill="none">
        <path d="M14 8h4v6h6v4h-6v6h-4v-6H8v-4h6V8z" fill="white" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="max-w-3xl">
          {/* Swiss badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white animate-fade-in-up">
            <SwissCrossIcon size={14} />
            100% Swiss
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in-up">
            {t("title")}
          </h1>
          <p className="mt-6 text-lg text-gray-300 animate-fade-in-up animate-delay-100">
            {t("subtitle")}
          </p>

          {/* Benefits list */}
          <ul className="mt-8 space-y-3 animate-fade-in-up animate-delay-200">
            {(["benefit1", "benefit2", "benefit3"] as const).map((key) => (
              <li key={key} className="flex items-center gap-3 text-white">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-just-tag)]" />
                <span className="text-base sm:text-lg">{t(key)}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-400 animate-fade-in-up animate-delay-200">
            <Users className="h-4 w-4" />
            {t("socialProof")}
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row animate-fade-in-up animate-delay-300">
            <Button
              size="lg"
              className="bg-[var(--color-just-tag)] px-8 py-6 text-base font-semibold hover:bg-[var(--color-just-tag-dark)]"
              onClick={() => scrollTo("b2b-contact")}
            >
              {t("cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white/30 px-8 py-6 text-base font-semibold text-white hover:bg-white/10"
              onClick={() => scrollTo("b2b-pricing")}
            >
              {t("ctaSecondary")}
              <ChevronDown className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
