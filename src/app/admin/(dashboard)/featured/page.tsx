import { listFeaturedRestaurants } from "@/actions/admin/featured";
import { FeaturedManager } from "@/components/admin/FeaturedManager";
import { Star } from "lucide-react";

export default async function FeaturedPage() {
  const result = await listFeaturedRestaurants();

  const restaurants = result.data?.restaurants || [];
  const total = result.data?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Star className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Restaurants du mois</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {total} restaurant{total > 1 ? "s" : ""} sélectionné{total > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <FeaturedManager restaurants={restaurants} />
    </div>
  );
}
