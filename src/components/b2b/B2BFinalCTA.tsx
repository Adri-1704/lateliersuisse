"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface B2BFinalCTAProps {
  spotsRemaining: number;
}

export function B2BFinalCTA({ spotsRemaining }: B2BFinalCTAProps) {
  const t = useTranslations("b2bLanding.finalCta");

  const scrollToPricing = () => {
    document.getElementById("b2b-pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 sm:py-28">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/60" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          {spotsRemaining > 0
            ? t("spotsLeft", { count: spotsRemaining })
            : t("joinNow")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
          {t("subtitle")}
        </p>

        <Button
          size="lg"
          className="mt-8 bg-[var(--color-just-tag)] px-10 py-6 text-lg font-semibold hover:bg-[var(--color-just-tag-dark)]"
          onClick={scrollToPricing}
        >
          {t("cta")}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="mt-6 text-sm text-gray-400">
          {t("contactNote")}{" "}
          <a
            href="mailto:contact@just-tag.app"
            className="text-white underline hover:text-gray-200"
          >
            contact@just-tag.app
          </a>
        </p>
      </div>
    </section>
  );
}
