import Link from "next/link";
import { listMerchants } from "@/actions/admin/merchants";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Eye, Store } from "lucide-react";

const planLabels: Record<string, string> = {
  monthly: "Mensuel",
  semiannual: "Semestriel",
  annual: "Annuel",
  lifetime: "À vie",
};

const planColors: Record<string, { bg: string; color: string }> = {
  monthly: { bg: "#f3f4f6", color: "#374151" },
  semiannual: { bg: "#eff6ff", color: "#2563eb" },
  annual: { bg: "#eef2ff", color: "#4f46e5" },
  lifetime: { bg: "#fef3c7", color: "#92400e" },
};

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await listMerchants({ page, search: params.search });

  const merchants = result.data?.merchants || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Store className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Commerçants</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {total} commerçant{total > 1 ? "s" : ""} inscrit{total > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <SearchInput placeholder="Rechercher par nom, email..." />

      {merchants.length === 0 ? (
        <EmptyState title="Aucun commerçant" description="Aucun commerçant inscrit pour le moment." />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Nom</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Téléphone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Plan</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Inscription</th>
                  <th className="px-4 py-3 w-[60px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f5]">
                {merchants.map((m) => {
                  const plan = m.subscription?.plan_type;
                  const planStyle = plan ? planColors[plan] : null;
                  return (
                    <tr key={m.id} className="hover:bg-[#fafbfc] transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{m.name}</td>
                      <td className="px-4 py-3 text-gray-600">{m.email}</td>
                      <td className="px-4 py-3 text-gray-500">{m.phone || "—"}</td>
                      <td className="px-4 py-3">
                        {plan && planStyle ? (
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ background: planStyle.bg, color: planStyle.color }}
                          >
                            {planLabels[plan] || plan}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {m.subscription ? (
                          <StatusBadge status={m.subscription.status} />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(m.created_at).toLocaleDateString("fr-CH")}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/merchants/${m.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} />
        </>
      )}
    </div>
  );
}
