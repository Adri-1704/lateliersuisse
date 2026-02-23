"use client";

import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";

const testimonials = ["t1", "t2", "t3"] as const;

export function B2BTestimonials() {
  const t = useTranslations("b2b.testimonials");

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((key) => (
            <div
              key={key}
              className="rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <Quote className="h-8 w-8 text-[var(--color-just-tag)]/20" />

              <p className="mt-4 text-gray-700 leading-relaxed italic">
                &ldquo;{t(`${key}.quote`)}&rdquo;
              </p>

              {/* Rating */}
              <div className="mt-4 flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Author */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-just-tag-light)] text-sm font-bold text-[var(--color-just-tag)]">
                  {t(`${key}.name`).charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {t(`${key}.name`)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t(`${key}.restaurant`)} — {t(`${key}.city`)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
