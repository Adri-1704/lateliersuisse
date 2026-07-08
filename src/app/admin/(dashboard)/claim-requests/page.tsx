import Link from "next/link";
import { listClaimRequests } from "@/actions/admin/claims";
import { EmptyState } from "@/components/admin/EmptyState";
import { ShieldCheck } from "lucide-react";

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "En attente", bg: "#fffbeb", color: "#d97706" },
  approved: { label: "Approuvé", bg: "#f0fdf4", color: "#16a34a" },
  rejected: { label: "Rejeté", bg: "#fef2f2", color: "#dc2626" },
};

const filterTabs = [
  { value: "pending", label: "En attente" },
  { value: "approved", label: "Approuvées" },
  { value: "rejected", label: "Rejetées" },
  { value: "all", label: "Toutes" },
];

export default async function ClaimRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "pending";
  const result = await listClaimRequests({ status: statusFilter });
  const claims = result.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Demandes de claim</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {claims.length} demande{claims.length > 1 ? "s" : ""}{" "}
            {statusFilter === "pending" ? "en attente" : statusFilter === "all" ? "au total" : ""}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/claim-requests?status=${tab.value}`}
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

      {claims.length === 0 ? (
        <EmptyState title="Aucune demande" description="Aucune demande de claim ne correspond à ce filtre." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Restaurant</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Ville</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Commerçant</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Méthode</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f5]">
              {claims.map((c) => {
                const s = statusConfig[c.status] || { label: c.status, bg: "#f3f4f6", color: "#374151" };
                return (
                  <tr key={c.id} className="cursor-pointer hover:bg-[#fafbfc] transition-colors">
                    <td className="px-4 py-3 text-gray-500">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">
                        {new Date(c.created_at).toLocaleDateString("fr-CH")}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">{c.restaurant_name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">{c.restaurant_city}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">{c.merchant_name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">{c.merchant_email}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">{c.method}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
