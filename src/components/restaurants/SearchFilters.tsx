"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cantons } from "@/data/cantons";
import { cuisineCategories } from "@/data/mock-categories";
import { featuresOptions } from "@/data/mock-restaurants";
import { getLocalizedLabel, getLocalizedName, getLocalizedLabelAlt } from "@/lib/locale-helpers";

export function SearchFilters() {
  const t = useTranslations("search");
  const tHero = useTranslations("hero");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCanton = searchParams.get("canton") || "";
  const currentCuisine = searchParams.get("cuisine") || "";
  const currentPrice = searchParams.get("price") || "";
  const currentRating = searchParams.get("rating") || "";
  const currentFeatures = searchParams.get("features")?.split(",").filter(Boolean) || [];

  const getCantonLabelLocal = (c: { label: string; labelDe: string; labelEn: string; labelPt?: string; labelEs?: string }) => {
    return getLocalizedLabel(c, locale);
  };

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      router.push(`/${locale}/restaurants?${newParams.toString()}`);
    },
    [searchParams, router, locale]
  );

  const toggleFeature = useCallback(
    (feature: string) => {
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter((f) => f !== feature)
        : [...currentFeatures, feature];
      const newParams = new URLSearchParams(searchParams.toString());
      if (newFeatures.length > 0) {
        newParams.set("features", newFeatures.join(","));
      } else {
        newParams.delete("features");
      }
      router.push(`/${locale}/restaurants?${newParams.toString()}`);
    },
    [currentFeatures, searchParams, router, locale]
  );

  const clearAll = () => {
    router.push(`/${locale}/restaurants`);
  };

  const hasActiveFilters = currentCanton || currentCuisine || currentPrice || currentRating || currentFeatures.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("filters")}</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-[var(--color-just-tag)]">
            <X className="mr-1 h-3 w-3" />
            {t("clearAll")}
          </Button>
        )}
      </div>

      {/* Canton Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {tHero("canton")}
        </label>
        <select
          value={currentCanton}
          onChange={(e) => updateFilter("canton", e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-2 focus:ring-[var(--color-just-tag)]/20"
        >
          <option value="">{tHero("allCantons")}</option>
          {cantons.map((c) => (
            <option key={c.value} value={c.value}>
              {getCantonLabelLocal(c)}
            </option>
          ))}
        </select>
      </div>

      {/* Cuisine Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {tHero("cuisineType")}
        </label>
        <select
          value={currentCuisine}
          onChange={(e) => updateFilter("cuisine", e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-2 focus:ring-[var(--color-just-tag)]/20"
        >
          <option value="">{tHero("allCuisines")}</option>
          {cuisineCategories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.icon} {getLocalizedName(c, locale)}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t("priceRange")}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((price) => (
            <Button
              key={price}
              variant={currentPrice === String(price) ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateFilter("price", currentPrice === String(price) ? "" : String(price))
              }
              className={
                currentPrice === String(price)
                  ? "bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)]"
                  : ""
              }
            >
              {"$".repeat(price)}
            </Button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t("minRating")}
        </label>
        <div className="flex gap-2">
          {[3, 3.5, 4, 4.5].map((rating) => (
            <Button
              key={rating}
              variant={currentRating === String(rating) ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateFilter("rating", currentRating === String(rating) ? "" : String(rating))
              }
              className={
                currentRating === String(rating)
                  ? "bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)]"
                  : ""
              }
            >
              <Star className="mr-1 h-3 w-3 fill-current" />
              {rating}+
            </Button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t("features")}
        </label>
        <div className="flex flex-wrap gap-2">
          {featuresOptions.map((feature) => {
            const label = getLocalizedLabelAlt(feature, locale);
            const isActive = currentFeatures.includes(feature.value);
            return (
              <Badge
                key={feature.value}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)] text-white border-0"
                    : "hover:border-[var(--color-just-tag)] hover:text-[var(--color-just-tag)]"
                }`}
                onClick={() => toggleFeature(feature.value)}
              >
                {label}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
