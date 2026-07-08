import { listNewsletterSubscribers } from "@/actions/admin/newsletter";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { Newspaper } from "lucide-react";

const localeLabels: Record<string, string> = {
  fr: "Français",
  de: "Allemand",
  en: "Anglais",
};

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await listNewsletterSubscribers({ page, search: params.search });

  const subscribers = result.data?.subscribers || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Newspaper className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Newsletter</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {total} abonné{total > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <SearchInput placeholder="Rechercher par email..." />

      {subscribers.length === 0 ? (
        <EmptyState title="Aucun abonné" description="Aucun abonné à la newsletter." />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Langue</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f5]">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#fafbfc] transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.email}</td>
                    <td className="px-4 py-3 text-gray-600">{localeLabels[s.locale] || s.locale}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={
                          s.is_active
                            ? { background: "#f0fdf4", color: "#16a34a" }
                            : { background: "#f3f4f6", color: "#6b7280" }
                        }
                      >
                        {s.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(s.created_at).toLocaleDateString("fr-CH")}
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
