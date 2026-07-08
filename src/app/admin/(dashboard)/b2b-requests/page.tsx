import Link from "next/link";
import { listB2BRequests } from "@/actions/admin/b2b-requests";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Briefcase } from "lucide-react";

const filterTabs = [
  { value: "all", label: "Toutes" },
  { value: "new", label: "Nouvelles" },
  { value: "contacted", label: "Contactées" },
  { value: "converted", label: "Converties" },
  { value: "archived", label: "Archivées" },
];

export default async function B2BRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const statusFilter = params.status || "all";
  const result = await listB2BRequests({
    page,
    search: params.search,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const requests = result.data?.requests || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Briefcase className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Demandes B2B</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {total} demande{total > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/b2b-requests?status=${tab.value}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-indigo-600 text-white"
                : "border border-[#eaecf0] bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <SearchInput placeholder="Rechercher par nom, restaurant, email..." />

      {requests.length === 0 ? (
        <EmptyState title="Aucune demande" description="Aucune demande B2B ne correspond à votre recherche." />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Nom</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Restaurant</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Ville</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Téléphone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f5]">
                {requests.map((r) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-[#fafbfc] transition-colors">
                    <td className="px-4 py-3 text-gray-500">
                      <Link href={`/admin/b2b-requests/${r.id}`} className="block">
                        {new Date(r.created_at).toLocaleDateString("fr-CH")}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <Link href={`/admin/b2b-requests/${r.id}`} className="block">
                        {r.first_name || r.last_name
                          ? `${r.first_name || ""} ${r.last_name || ""}`.trim()
                          : "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link href={`/admin/b2b-requests/${r.id}`} className="block">{r.restaurant_name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <Link href={`/admin/b2b-requests/${r.id}`} className="block">{r.city || "—"}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link href={`/admin/b2b-requests/${r.id}`} className="block">{r.email}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <Link href={`/admin/b2b-requests/${r.id}`} className="block">{r.phone || "—"}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
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
