"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { SearchFilters } from "@/components/restaurants/SearchFilters";
import type { RestaurantListItem, RestaurantMapItem } from "@/lib/restaurants/queries";
import type { Restaurant } from "@/data/mock-restaurants";

const RestaurantMap = dynamic(
  () => import("@/components/map/RestaurantMap").then((mod) => mod.RestaurantMap),
  { ssr: false, loading: () => <div className="h-[600px] rounded-xl bg-gray-100 animate-pulse" /> }
);

// ---------------------------------------------------------------------------
// Placeholder images (moved from old page.tsx)
// ---------------------------------------------------------------------------

const placeholderImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80",
  "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80",
];

// ---------------------------------------------------------------------------
// Mapper: RestaurantListItem (DB snake_case) → Restaurant (camelCase for card)
// ---------------------------------------------------------------------------

function listItemToRestaurant(item: RestaurantListItem, index: number): Restaurant {
  return {
    id: item.id,
    slug: item.slug,
    nameFr: item.name_fr,
    nameDe: item.name_de,
    nameEn: item.name_en,
    descriptionFr: item.description_fr || "",
    descriptionDe: item.description_de || "",
    descriptionEn: item.description_en || "",
    cuisineType: item.cuisine_type || "",
    canton: item.canton,
    city: item.city,
    address: "",
    postalCode: "",
    latitude: item.latitude || 0,
    longitude: item.longitude || 0,
    phone: "",
    email: "",
    website: "",
    priceRange: parseInt(item.price_range || "2") as 1 | 2 | 3 | 4,
    avgRating: item.avg_rating || 0,
    reviewCount: item.review_count || 0,
    openingHours: (item.opening_hours as Record<string, { open: string; close: string }>) || {},
    features: item.features || [],
    coverImage: item.cover_image || placeholderImages[index % placeholderImages.length],
    images: [],
    isFeatured: item.is_featured || false,
    isPublished: true,
    menuItems: [],
  };
}

// ---------------------------------------------------------------------------
// Mapper: RestaurantMapItem → Restaurant (minimal, for the map component)
// ---------------------------------------------------------------------------

function mapItemToRestaurant(item: RestaurantMapItem): Restaurant {
  return {
    id: item.id,
    slug: item.slug,
    nameFr: item.name_fr,
    nameDe: item.name_fr,
    nameEn: item.name_fr,
    descriptionFr: "",
    descriptionDe: "",
    descriptionEn: "",
    cuisineType: item.cuisine_type || "",
    canton: item.canton,
    city: item.city,
    address: "",
    postalCode: "",
    latitude: item.latitude,
    longitude: item.longitude,
    phone: "",
    email: "",
    website: "",
    priceRange: 2,
    avgRating: item.avg_rating || 0,
    reviewCount: item.review_count || 0,
    openingHours: {},
    features: [],
    coverImage: "",
    images: [],
    isFeatured: false,
    isPublished: true,
    menuItems: [],
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 24;

interface RestaurantsViewProps {
  restaurants: RestaurantListItem[];
  totalCount: number;
  currentPage: number;
  mapRestaurants: RestaurantMapItem[] | null;
  locale: string;
  cuisineCounts?: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RestaurantsView({
  restaurants,
  totalCount,
  currentPage,
  mapRestaurants,
  locale,
  cuisineCounts,
}: RestaurantsViewProps) {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">(
    searchParams.get("view") === "map" ? "map" : "list"
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Map RestaurantListItem → Restaurant for card rendering
  const mappedRestaurants = restaurants.map((r, i) => listItemToRestaurant(r, (currentPage - 1) * ITEMS_PER_PAGE + i));

  // Map RestaurantMapItem → Restaurant for the map component
  const mappedMapRestaurants = mapRestaurants ? mapRestaurants.map(mapItemToRestaurant) : mappedRestaurants;

  // Navigate to a new page while preserving other search params
  const goToPage = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        newParams.delete("page");
      } else {
        newParams.set("page", String(page));
      }
      router.push(`/${locale}/restaurants?${newParams.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchParams, router, locale]
  );

  // Toggle view mode — push view param to URL so server knows to fetch map data
  const handleViewToggle = useCallback(
    (mode: "list" | "map") => {
      setViewMode(mode);
      const newParams = new URLSearchParams(searchParams.toString());
      if (mode === "map") {
        newParams.set("view", "map");
      } else {
        newParams.delete("view");
      }
      router.push(`/${locale}/restaurants?${newParams.toString()}`);
    },
    [searchParams, router, locale]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("results", { count: totalCount })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            defaultValue={searchParams.get("sort") || "rating"}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams.toString());
              newParams.set("sort", e.target.value);
              newParams.delete("page");
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

          {/* View toggle */}
          <div className="hidden sm:flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => handleViewToggle("list")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm ${viewMode === "list" ? "bg-[var(--color-just-tag)] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <List className="h-4 w-4" />
              {t("listView")}
            </button>
            <button
              onClick={() => handleViewToggle("map")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm ${viewMode === "map" ? "bg-[var(--color-just-tag)] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <Map className="h-4 w-4" />
              {t("mapView")}
            </button>
          </div>

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
                <SearchFilters cuisineCounts={cuisineCounts} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border bg-white p-5">
            <SearchFilters cuisineCounts={cuisineCounts} />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {viewMode === "map" ? (
            <div className="h-[600px] rounded-xl overflow-hidden border">
              <RestaurantMap restaurants={mappedMapRestaurants} locale={locale} />
            </div>
          ) : totalCount > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {mappedRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    {locale === "de" ? "Zurück" : locale === "en" ? "Previous" : "Précédent"}
                  </Button>

                  <span className="text-sm text-gray-600 px-2">
                    {currentPage} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    {locale === "de" ? "Weiter" : locale === "en" ? "Next" : "Suivant"}
                  </Button>
                </div>
              )}

              <p className="mt-4 text-center text-sm text-gray-400">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} / {totalCount}
              </p>
            </>
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
                  router.push(`/${locale}/restaurants`);
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
