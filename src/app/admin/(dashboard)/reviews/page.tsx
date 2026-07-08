import { listReviews } from "@/actions/admin/reviews";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { MessageSquare, Star } from "lucide-react";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await listReviews({ page, search: params.search });

  const reviews = result.data?.reviews || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Avis</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{total} avis publiés</p>
        </div>
      </div>

      <SearchInput placeholder="Rechercher par auteur, commentaire..." />

      {reviews.length === 0 ? (
        <EmptyState title="Aucun avis" description="Aucun avis ne correspond à votre recherche." />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Auteur</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Restaurant</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Note</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Commentaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f5]">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[#fafbfc] transition-colors">
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString("fr-CH")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.author_name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.restaurant_name || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < r.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="max-w-[300px] truncate px-4 py-3 text-gray-500">
                      {r.comment || "—"}
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
