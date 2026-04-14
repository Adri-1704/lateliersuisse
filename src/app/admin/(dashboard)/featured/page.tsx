import { listFeaturedRestaurants } from "@/actions/admin/featured";
import { FeaturedManager } from "@/components/admin/FeaturedManager";
import { Star } from "lucide-react";

export default async function FeaturedPage() {
  const result = await listFeaturedRestaurants();

  const restaurants = result.data?.restaurants || [];
  const total = result.data?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Restaurants du mois</h1>
        <p className="text-muted-foreground">
          <Star className="mr-1 inline h-4 w-4 fill-yellow-400 text-yellow-400" />
          {total} restaurant{total > 1 ? "s" : ""} sélectionné{total > 1 ? "s" : ""}
        </p>
      </div>

      <FeaturedManager restaurants={restaurants} />
    </div>
  );
}
