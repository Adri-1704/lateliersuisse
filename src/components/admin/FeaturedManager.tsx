"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFeatured, searchRestaurants } from "@/actions/admin/featured";
import type { FeaturedRestaurantRow } from "@/actions/admin/featured";
import { toast } from "sonner";
import { Plus, Trash2, Search, Star } from "lucide-react";

interface FeaturedManagerProps {
  restaurants: FeaturedRestaurantRow[];
}

export function FeaturedManager({ restaurants }: FeaturedManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<
    { id: string; name: string; city: string | null; canton: string | null; is_featured: boolean }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  async function handleSearch(query: string) {
    setSearch(query);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await searchRestaurants(query);
    if (res.data) {
      setResults(res.data.filter((r) => !r.is_featured));
    }
    setSearching(false);
  }

  function handleAdd(restaurant: { id: string; name: string }) {
    startTransition(async () => {
      const res = await toggleFeatured(restaurant.id, true);
      if (res.success) {
        toast.success(`${restaurant.name} ajouté aux restaurants du mois`);
        setSearch("");
        setResults([]);
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de l'ajout");
      }
    });
  }

  function handleRemove(id: string, name: string) {
    if (confirmRemoveId !== id) {
      setConfirmRemoveId(id);
      return;
    }
    setConfirmRemoveId(null);
    startTransition(async () => {
      const res = await toggleFeatured(id, false);
      if (res.success) {
        toast.success(`${name} retiré des restaurants du mois`);
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors du retrait");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Search to add */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Ajouter un restaurant
        </label>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Rechercher un restaurant par nom..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-[#eaecf0] bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {(searching ||
          results.length > 0 ||
          (search.length >= 2 && results.length === 0 && !searching)) && (
          <div className="max-w-md overflow-hidden rounded-xl border border-[#eaecf0] bg-white shadow-sm">
            {searching && (
              <p className="p-3 text-sm text-gray-400">Recherche...</p>
            )}
            {!searching && results.length === 0 && search.length >= 2 && (
              <p className="p-3 text-sm text-gray-400">
                Aucun restaurant trouvé (ou déjà tous sélectionnés)
              </p>
            )}
            {results.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-[#f8fafc] transition-colors border-b border-[#f0f2f5] last:border-b-0"
              >
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{r.name}</span>
                  {r.city && (
                    <span className="ml-2 text-gray-400">
                      {r.city}
                      {r.canton ? ` (${r.canton})` : ""}
                    </span>
                  )}
                </div>
                <button
                  disabled={isPending}
                  onClick={() => handleAdd({ id: r.id, name: r.name })}
                  className="flex items-center gap-1 rounded-lg border border-[#eaecf0] bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                  Ajouter
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured restaurants list */}
      {restaurants.length === 0 ? (
        <div className="rounded-2xl border border-[#eaecf0] bg-white py-10 text-center text-gray-400">
          Aucun restaurant sélectionné comme restaurant du mois.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Restaurant</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Ville</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Canton</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Note</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Avis</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f5]">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-[#fafbfc] transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{r.name_fr}</td>
                  <td className="px-4 py-3 text-gray-600">{r.city || "—"}</td>
                  <td className="px-4 py-3">
                    {r.canton ? (
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: "#eef2ff", color: "#4f46e5" }}
                      >
                        {r.canton}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.avg_rating ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {r.avg_rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.review_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      disabled={isPending}
                      onClick={() => handleRemove(r.id, r.name_fr)}
                      onBlur={() => setConfirmRemoveId(null)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                        confirmRemoveId === r.id
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "border border-[#eaecf0] bg-white text-gray-500 hover:text-red-600 hover:border-red-200"
                      }`}
                    >
                      {confirmRemoveId === r.id ? (
                        "Confirmer"
                      ) : (
                        <>
                          <Trash2 className="h-3 w-3" />
                          Retirer
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
