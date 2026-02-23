"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SwissCrossIcon } from "@/components/ui/swiss-cross";
import { cantons } from "@/data/cantons";
import { cuisineCategories } from "@/data/mock-categories";
import { getLocalizedLabel, getLocalizedName } from "@/lib/locale-helpers";

const heroImages = [
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop", alt: "Restaurant interior" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop", alt: "Fine dining" },
  { src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop", alt: "Swiss cuisine" },
  { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop", alt: "Restaurant terrace" },
];

const popularTags = [
  { key: "fondue", label: { fr: "Fondue", de: "Fondue", en: "Fondue", pt: "Fondue", es: "Fondue" } },
  { key: "terrasse", label: { fr: "Terrasse", de: "Terrasse", en: "Terrace", pt: "Terraço", es: "Terraza" } },
  { key: "brunch", label: { fr: "Brunch", de: "Brunch", en: "Brunch", pt: "Brunch", es: "Brunch" } },
  { key: "lac", label: { fr: "Vue sur le lac", de: "Seeblick", en: "Lake view", pt: "Vista para o lago", es: "Vista al lago" } },
];

export function HeroSection() {
  const t = useTranslations("hero");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [canton, setCanton] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (canton) searchParams.set("canton", canton);
    if (cuisine) searchParams.set("cuisine", cuisine);
    if (query) searchParams.set("q", query);
    router.push(`/${locale}/restaurants?${searchParams.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    router.push(`/${locale}/restaurants?q=${encodeURIComponent(tag)}`);
  };

  const getCantonLabelLocal = (c: { label: string; labelDe: string; labelEn: string; labelPt?: string; labelEs?: string }) => {
    return getLocalizedLabel(c, locale);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-gray-900">
      {/* Swiss cross watermark */}
      <div className="absolute -right-20 -top-20 opacity-[0.04]">
        <svg width="500" height="500" viewBox="0 0 32 32" fill="none">
          <path d="M14 8h4v6h6v4h-6v6h-4v-6H8v-4h6V8z" fill="white" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text + Search */}
          <div className="animate-fade-in-up">
            {/* Swiss badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
              <SwissCrossIcon size={16} className="text-[var(--color-just-tag)]" />
              <span>{t("swissBadge")}</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-300 sm:text-lg">
              {t("subtitle")}
            </p>

            {/* Search Box */}
            <div className="mt-8 animate-fade-in-up animate-delay-200">
              <div className="rounded-xl bg-white p-3 shadow-2xl sm:rounded-2xl sm:p-4">
                <div className="flex flex-col gap-3">
                  {/* Row 1: Canton + Cuisine selects */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <select
                      value={canton}
                      onChange={(e) => setCanton(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-[var(--color-just-tag)] focus:ring-2 focus:ring-[var(--color-just-tag)]/20"
                    >
                      <option value="">{t("allCantons")}</option>
                      {cantons.map((c) => (
                        <option key={c.value} value={c.value}>
                          {getCantonLabelLocal(c)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-[var(--color-just-tag)] focus:ring-2 focus:ring-[var(--color-just-tag)]/20"
                    >
                      <option value="">{t("allCuisines")}</option>
                      {cuisineCategories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.icon} {getLocalizedName(c, locale)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Row 2: Text search + Button */}
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder={t("searchPlaceholder")}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="h-[46px] flex-1 border-gray-200 bg-gray-50 focus-visible:ring-[var(--color-just-tag)]/20"
                    />
                    <Button
                      onClick={handleSearch}
                      className="h-[46px] shrink-0 bg-[var(--color-just-tag)] px-6 text-white hover:bg-[var(--color-just-tag-dark)] sm:px-8"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {t("searchButton")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Popular search tags */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400">{t("popularSearches")}:</span>
                {popularTags.map((tag) => (
                  <button
                    key={tag.key}
                    onClick={() => handleTagClick(tag.label[locale as keyof typeof tag.label] || tag.label.en)}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs text-gray-300 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    {tag.label[locale as keyof typeof tag.label] || tag.label.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats counter */}
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-400 animate-fade-in-up animate-delay-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[var(--color-just-tag)]" />
                <span>{t("statsCounter")}</span>
              </div>
            </div>
          </div>

          {/* Right: Image mosaic */}
          <div className="hidden lg:block animate-fade-in-up animate-delay-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="relative h-48 overflow-hidden rounded-2xl">
                  <Image
                    src={heroImages[0].src}
                    alt={heroImages[0].alt}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <div className="relative h-56 overflow-hidden rounded-2xl">
                  <Image
                    src={heroImages[1].src}
                    alt={heroImages[1].alt}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              </div>
              <div className="space-y-3 pt-8">
                <div className="relative h-56 overflow-hidden rounded-2xl">
                  <Image
                    src={heroImages[2].src}
                    alt={heroImages[2].alt}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <div className="relative h-48 overflow-hidden rounded-2xl">
                  <Image
                    src={heroImages[3].src}
                    alt={heroImages[3].alt}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
