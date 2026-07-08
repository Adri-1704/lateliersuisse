import Link from "next/link";
import { listRestaurants } from "@/actions/admin/restaurants";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { RestaurantDeleteButton } from "@/components/admin/RestaurantDeleteButton";
import { Plus, Pencil, Star, UtensilsCrossed } from "lucide-react";

const priceLabels: Record<string, string> = {
  "1": "CHF",
  "2": "CHF CHF",
  "3": "CHF CHF CHF",
  "4": "CHF CHF CHF CHF",
};

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; published?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await listRestaurants({
    page,
    search: params.search,
    published: params.published,
  });

  const restaurants = result.data?.restaurants || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <UtensilsCrossed className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Restaurants</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              {total} restaurant{total > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Link
          href="/admin/restaurants/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      <SearchInput placeholder="Rechercher par nom, ville, canton..." />

      {restaurants.length === 0 ? (
        <EmptyState title="Aucun restaurant" description="Aucun restaurant ne correspond à votre recherche." />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Nom</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Ville</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Canton</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Cuisine</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Prix</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Note</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-4 py-3 w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f5]">
                {restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-[#fafbfc] transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.name_fr}</td>
                    <td className="px-4 py-3 text-gray-600">{r.city}</td>
                    <td className="px-4 py-3 text-gray-500">{r.canton}</td>
                    <td className="px-4 py-3 text-gray-500">{r.cuisine_type}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{priceLabels[r.price_range] || r.price_range}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {r.avg_rating.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={
                          r.is_published
                            ? { background: "#f0fdf4", color: "#16a34a" }
                            : { background: "#f3f4f6", color: "#6b7280" }
                        }
                      >
                        {r.is_published ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/restaurants/${r.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <RestaurantDeleteButton id={r.id} name={r.name_fr} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} />
        </>
      )}
    </div>
  );
}
