"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cuisineCategories } from "@/data/mock-categories";
import { getLocalizedName } from "@/lib/locale-helpers";
import { SwissCrossIcon } from "@/components/ui/swiss-cross";

const categoryImages: Record<string, string> = {
  suisse: "https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=200&h=200&fit=crop",
  italien: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop",
  francais: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop",
  japonais: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop",
  chinois: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop",
  indien: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop",
  thai: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=200&h=200&fit=crop",
  mexicain: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&h=200&fit=crop",
  libanais: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=200&fit=crop",
  turc: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=200&h=200&fit=crop",
  espagnol: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=200&h=200&fit=crop",
  grec: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
  americain: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
  coreen: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200&h=200&fit=crop",
  vietnamien: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&h=200&fit=crop",
  africain: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&h=200&fit=crop",
  portugais: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=200&h=200&fit=crop",
  vegetarien: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop",
  "fruits-de-mer": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200&h=200&fit=crop",
  steakhouse: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop",
};

export function CategoryGrid() {
  const t = useTranslations("categories");
  const params = useParams();
  const locale = params.locale as string;

  // Put Swiss cuisine first, then the rest
  const sortedCategories = [
    ...cuisineCategories.filter((c) => c.slug === "suisse"),
    ...cuisineCategories.filter((c) => c.slug !== "suisse"),
  ];

  return (
    <section className="bg-[var(--color-warm-cream)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {sortedCategories.map((category) => {
            const name = getLocalizedName(category, locale);
            const isSwiss = category.slug === "suisse";
            const imageUrl = categoryImages[category.slug];

            return (
              <Link
                key={category.slug}
                href={`/${locale}/restaurants?cuisine=${category.slug}`}
                className={`group relative flex flex-col items-center rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-6 ${
                  isSwiss
                    ? "border-[var(--color-just-tag)]/30 ring-1 ring-[var(--color-just-tag)]/10"
                    : "hover:border-[var(--color-just-tag)]/30"
                }`}
              >
                {isSwiss && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[var(--color-just-tag)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                    <SwissCrossIcon size={10} />
                    {locale === "de" ? "Entdecken" : locale === "en" ? "Discover" : locale === "pt" ? "Descobrir" : locale === "es" ? "Descubrir" : "Découverte"}
                  </span>
                )}
                {imageUrl ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full sm:h-14 sm:w-14">
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="56px"
                    />
                  </div>
                ) : (
                  <span className="text-3xl sm:text-4xl">{category.icon}</span>
                )}
                <span className="mt-2 text-center text-sm font-medium text-gray-700 group-hover:text-[var(--color-just-tag)] transition-colors">
                  {name}
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  {category.count} restaurants
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
