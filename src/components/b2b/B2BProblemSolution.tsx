"use client";

import { AlertTriangle, CheckCircle2, ArrowRight, Eye, Banknote, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

const painPointKeys = [
  { icon: Eye, key: "visibility" },
  { icon: Banknote, key: "commission" },
  { icon: MessageSquare, key: "reviews" },
] as const;

export function B2BProblemSolution() {
  const t = useTranslations("b2bLanding.problemSolution");

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            {t("title")}
            <br />
            <span className="text-[var(--color-just-tag)]">
              {t("titleHighlight")}
            </span>
          </h2>
        </div>

        <div className="mt-16 space-y-12">
          {painPointKeys.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center"
              >
                {/* Problem */}
                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-red-900">
                      {t(`problems.${item.key}.title`)}
                    </h3>
                  </div>
                  <p className="text-sm text-red-800/80 leading-relaxed">
                    {t(`problems.${item.key}.text`)}
                  </p>
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-just-tag)]">
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex lg:hidden items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-just-tag)]">
                    <ArrowRight className="h-4 w-4 text-white rotate-90" />
                  </div>
                </div>

                {/* Solution */}
                <div className="rounded-2xl border border-green-100 bg-green-50/50 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-900">
                      {t(`solutions.${item.key}.title`)}
                    </h3>
                  </div>
                  <p className="text-sm text-green-800/80 leading-relaxed">
                    {t(`solutions.${item.key}.text`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
