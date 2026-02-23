"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { SearchFilters } from "@/components/restaurants/SearchFilters";
import { RestaurantCardSkeletonGrid } from "@/components/restaurants/RestaurantCardSkeleton";
import { mockRestaurants } from "@/data/mock-restaurants";

function RestaurantsContent() {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredRestaurants = useMemo(() => {
    let results = mockRestaurants.filter((r) => r.isPublished);

    const canton = searchParams.get("canton");
    const cuisine = searchParams.get("cuisine");
    const price = searchParams.get("price");
    const rating = searchParams.get("rating");
    const features = searchParams.get("features")?.split(",").filter(Boolean) || [];
    const query = searchParams.get("q")?.toLowerCase();
    const sort = searchParams.get("sort") || "rating";

    if (canton) results = results.filter((r) => r.canton === canton);
    if (cuisine) results = results.filter((r) => r.cuisineType === cuisine);
    if (price) results = results.filter((r) => r.priceRange <= parseInt(price));
    if (rating) results = results.filter((r) => r.avgRating >= parseFloat(rating));
    if (features.length > 0) {
      results = results.filter((r) =>
        features.every((f) => r.features.includes(f))
      );
    }
    if (query) {
      results = results.filter(
        (r) =>
          r.nameFr.toLowerCase().includes(query) ||
          r.nameDe.toLowerCase().includes(query) ||
          r.nameEn.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query) ||
          r.cuisineType.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sort) {
      case "rating":
        results.sort((a, b) => b.avgRating - a.avgRating);
        break;
      case "price":
        results.sort((a, b) => a.priceRange - b.priceRange);
        break;
      case "priceDesc":
        results.sort((a, b) => b.priceRange - a.priceRange);
        break;
      case "newest":
        results.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "name":
        results.sort((a, b) => {
          const getName = (r: typeof a) => {
            switch (locale) {
              case "de": return r.nameDe;
              case "en": return r.nameEn;
              case "pt": return r.namePt || r.nameEn;
              case "es": return r.nameEs || r.nameEn;
              default: return r.nameFr;
            }
          };
          const nameA = getName(a);
          const nameB = getName(b);
          return nameA.localeCompare(nameB);
        });
        break;
    }

    return results;
  }, [searchParams, locale]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("results", { count: filteredRestaurants.length })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            defaultValue={searchParams.get("sort") || "rating"}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams.toString());
              newParams.set("sort", e.target.value);
              router.push(`/${locale}/restaurants?${newParams.toString()}`);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="rating">{t("sortRating")}</option>
            <option value="price">{t("sortPrice")}</option>
            <option value="priceDesc">{t("sortPriceDesc")}</option>
            <option value="newest">{t("sortNewest")}</option>
            <option value="name">{t("sortName")}</option>
          </select>

          {/* Mobile filters button */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t("filters")}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] overflow-y-auto">
              <div className="mt-6">
                <SearchFilters />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border bg-white p-5">
            <SearchFilters />
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl">🍽️</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {t("noResults")}
              </h3>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  window.location.href = `/${locale}/restaurants`;
                }}
              >
                {t("clearAll")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><RestaurantCardSkeletonGrid /></div>}>
      <RestaurantsContent />
    </Suspense>
  );
}
