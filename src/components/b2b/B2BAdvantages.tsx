"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Eye, MessageSquare, Megaphone, Sparkles, CheckCircle2 } from "lucide-react";

const advantages = [
  {
    key: "visibility",
    icon: Eye,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "reviews",
    icon: MessageSquare,
    image: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&h=400&fit=crop",
    color: "bg-orange-50 text-orange-600",
  },
  {
    key: "marketing",
    icon: Megaphone,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
    color: "bg-green-50 text-green-600",
  },
  {
    key: "simplicity",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&h=400&fit=crop",
    color: "bg-purple-50 text-purple-600",
  },
];

export function B2BAdvantages() {
  const t = useTranslations("b2b.advantages");

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

        <div className="mt-16 space-y-20">
          {advantages.map((adv, index) => {
            const Icon = adv.icon;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={adv.key}
                className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16 ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:w-1/2">
                  <Image
                    src={adv.image}
                    alt={t(`${adv.key}.title`)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                {/* Content */}
                <div className="lg:w-1/2">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${adv.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
                    {t(`${adv.key}.title`)}
                  </h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {t(`${adv.key}.desc`)}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {(["point1", "point2", "point3"] as const).map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-just-tag)]" />
                        <span className="text-gray-700">{t(`${adv.key}.${point}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
