import { Suspense } from "react";
import { RestaurantCardSkeletonGrid } from "@/components/restaurants/RestaurantCardSkeleton";
import {
  fetchFilteredRestaurants,
  fetchAllFilteredForMap,
  fetchCuisineCounts,
  type RestaurantFilters,
} from "@/lib/restaurants/queries";
import RestaurantsView from "./RestaurantsView";

// ---------------------------------------------------------------------------
// Server Component — reads searchParams, fetches from Supabase, passes to view
// ---------------------------------------------------------------------------

export default async function RestaurantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  // ---- Parse searchParams into RestaurantFilters ----

  const canton = typeof sp.canton === "string" ? sp.canton : undefined;
  const cuisine = typeof sp.cuisine === "string" ? sp.cuisine : undefined;
  const city = typeof sp.city === "string" ? sp.city : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const priceMax =
    typeof sp.price === "string" && sp.price ? parseInt(sp.price, 10) : undefined;
  const ratingMin =
    typeof sp.rating === "string" && sp.rating ? parseFloat(sp.rating) : undefined;

  const features =
    typeof sp.features === "string"
      ? sp.features.split(",").filter(Boolean)
      : undefined;

  const sortRaw = typeof sp.sort === "string" ? sp.sort : "rating";
  const sort = (["rating", "price", "priceDesc", "name", "newest"].includes(sortRaw)
    ? sortRaw
    : "rating") as RestaurantFilters["sort"];

  const page =
    typeof sp.page === "string" && sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const viewIsMap = sp.view === "map";

  const filters: RestaurantFilters = {
    canton,
    cuisine,
    city,
    priceMax: priceMax != null && !isNaN(priceMax) ? priceMax : undefined,
    ratingMin: ratingMin != null && !isNaN(ratingMin) ? ratingMin : undefined,
    features: features && features.length > 0 ? features : undefined,
    query: q,
    sort,
  };

  // ---- Fetch data ----

  const [listResult, mapData, cuisineCounts] = await Promise.all([
    fetchFilteredRestaurants(filters, page, 24),
    viewIsMap ? fetchAllFilteredForMap(filters) : Promise.resolve(null),
    fetchCuisineCounts(),
  ]);

  // ---- Render ----

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <RestaurantCardSkeletonGrid />
        </div>
      }
    >
      <RestaurantsView
        restaurants={listResult.data}
        totalCount={listResult.totalCount}
        currentPage={page}
        mapRestaurants={mapData}
        locale={locale}
        cuisineCounts={cuisineCounts}
      />
    </Suspense>
  );
}
