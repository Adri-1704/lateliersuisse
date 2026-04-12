"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { SearchFilters } from "@/components/restaurants/SearchFilters";
import { RestaurantCardSkeletonGrid } from "@/components/restaurants/RestaurantCardSkeleton";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant } from "@/data/mock-restaurants";

const RestaurantMap = dynamic(
  () => import("@/components/map/RestaurantMap").then((mod) => mod.RestaurantMap),
  { ssr: false, loading: () => <div className="h-[600px] rounded-xl bg-gray-100 animate-pulse" /> }
);

// Placeholder images for restaurants without cover images
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

function mapDbToRestaurant(row: Record<string, unknown>, index: number): Restaurant {
  return {
    id: row.id as string,
    slug: row.slug as string,
    nameFr: row.name_fr as string,
    nameDe: row.name_de as string,
    nameEn: row.name_en as string,
    descriptionFr: (row.description_fr as string) || "",
    descriptionDe: (row.description_de as string) || "",
    descriptionEn: (row.description_en as string) || "",
    cuisineType: (row.cuisine_type as string) || "",
    canton: row.canton as string,
    city: row.city as string,
    address: (row.address as string) || "",
    postalCode: (row.postal_code as string) || "",
    latitude: (row.latitude as number) || 0,
    longitude: (row.longitude as number) || 0,
    phone: (row.phone as string) || "",
    email: (row.email as string) || "",
    website: (row.website as string) || "",
    priceRange: parseInt(row.price_range as string || "2") as 1 | 2 | 3 | 4,
    avgRating: parseFloat(row.avg_rating as string) || 0,
    reviewCount: (row.review_count as number) || 0,
    openingHours: (row.opening_hours as Record<string, { open: string; close: string }>) || {},
    features: (row.features as string[]) || [],
    coverImage: (row.cover_image as string) || placeholderImages[index % placeholderImages.length],
    images: [],
    isFeatured: (row.is_featured as boolean) || false,
    isPublished: (row.is_published as boolean) || true,
    menuItems: [],
  };
}

function RestaurantsContent() {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  // Fetch restaurants from Supabase
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .eq("is_published", true)
          .order("avg_rating", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          setRestaurants([]);
        } else {
          setRestaurants((data || []).map((row, i) => mapDbToRestaurant(row as Record<string, unknown>, i)));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    let results = [...restaurants];

    const canton = searchParams.get("canton");
    const cuisine = searchParams.get("cuisine");
    const city = searchParams.get("city")?.toLowerCase();
    const price = searchParams.get("price");
    const rating = searchParams.get("rating");
    const features = searchParams.get("features")?.split(",").filter(Boolean) || [];
    const query = searchParams.get("q")?.toLowerCase();
    const sort = searchParams.get("sort") || "rating";

    if (canton) results = results.filter((r) => r.canton === canton);
    if (cuisine) results = results.filter((r) => r.cuisineType === cuisine);
    if (city) results = results.filter((r) => r.city.toLowerCase().includes(city));
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
  }, [searchParams, locale, restaurants]);

  // Reset to page 1 when filters change
  const prevFilteredCount = filteredRestaurants.length;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

  // Pagination
  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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

          {/* View toggle */}
          <div className="hidden sm:flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm ${viewMode === "list" ? "bg-[var(--color-just-tag)] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <List className="h-4 w-4" />
              {t("listView")}
            </button>
            <button
              onClick={() => setViewMode("map")}
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

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <RestaurantCardSkeletonGrid />
          ) : viewMode === "map" ? (
            <div className="h-[600px] rounded-xl overflow-hidden border">
              <RestaurantMap restaurants={filteredRestaurants} locale={locale} />
            </div>
          ) : filteredRestaurants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedRestaurants.map((restaurant) => (
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
                    onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    {locale === "de" ? "Zurück" : locale === "en" ? "Previous" : "Précédent"}
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className={page === currentPage ? "bg-[var(--color-just-tag)] text-white" : ""}
                      onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    {locale === "de" ? "Weiter" : locale === "en" ? "Next" : "Suivant"}
                  </Button>
                </div>
              )}

              <p className="mt-4 text-center text-sm text-gray-400">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredRestaurants.length)} / {filteredRestaurants.length}
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
