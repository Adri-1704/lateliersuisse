import { listFeatured } from "@/actions/admin/featured";
import { FeaturedManager } from "@/components/admin/FeaturedManager";
import { Star } from "lucide-react";

const monthNames = ["", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

export default async function FeaturedPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.month || String(now.getMonth() + 1));
  const year = parseInt(params.year || String(now.getFullYear()));
  const result = await listFeatured({ month, year });

  const featured = result.data?.featured || [];
  const total = result.data?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Restaurants du mois</h1>
        <p className="text-muted-foreground">
          <Star className="mr-1 inline h-4 w-4 fill-yellow-400 text-yellow-400" />
          {monthNames[month]} {year} — {total} restaurant{total > 1 ? "s" : ""} selectionne{total > 1 ? "s" : ""}
        </p>
      </div>

      <FeaturedManager featured={featured} month={month} year={year} />
    </div>
  );
}
