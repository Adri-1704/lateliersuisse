import { getWhatsAppCosts } from "@/actions/admin/whatsapp-costs";
import { MessageCircle, DollarSign, Send, Calendar, Info } from "lucide-react";

function fmtUsd(n: number) {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(n);
}

function fmtMonth(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("fr-CH", {
    month: "long",
    year: "numeric",
  });
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function WhatsAppCostsPage() {
  const data = await getWhatsAppCosts();
  const maxCost = data.byRestaurant[0]?.costUsd ?? 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <MessageCircle className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Coûts Meta WhatsApp</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Dépenses estimées par restaurant — conversations marketing Meta Cloud API
          </p>
        </div>
      </div>

      {/* Pricing note */}
      <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Tarif appliqué : <strong>{fmtUsd(data.pricePerMessageUsd)} USD / message marketing</strong> (Suisse / Europe de l&apos;Ouest).
          Mettre à jour la constante{" "}
          <code className="rounded bg-blue-100 px-1 font-mono text-xs">META_MARKETING_PRICE_USD</code>{" "}
          dans{" "}
          <code className="rounded bg-blue-100 px-1 font-mono text-xs">src/actions/admin/whatsapp-costs.ts</code>{" "}
          si Meta change ses tarifs.
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Coût estimé — ce mois",
            value: fmtUsd(data.thisMonthCostUsd),
            sub: `${data.thisMonthMessages} messages envoyés`,
            icon: <DollarSign className="h-5 w-5 text-indigo-600" />,
          },
          {
            title: "Coût estimé — total",
            value: fmtUsd(data.allTimeCostUsd),
            sub: `${data.allTimeMessages} messages au total`,
            icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
          },
          {
            title: "Messages — ce mois",
            value: data.thisMonthMessages.toLocaleString("fr-CH"),
            sub: "conversations ouvertes",
            icon: <Send className="h-5 w-5 text-indigo-600" />,
          },
          {
            title: "Broadcasts envoyés",
            value: data.totalBroadcasts.toLocaleString("fr-CH"),
            sub: `sur ${data.byRestaurant.length} restaurant${data.byRestaurant.length !== 1 ? "s" : ""}`,
            icon: <MessageCircle className="h-5 w-5 text-indigo-600" />,
          },
        ].map((kpi) => (
          <div key={kpi.title} className="rounded-2xl border border-[#eaecf0] bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{kpi.title}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                {kpi.icon}
              </div>
            </div>
            <p className="text-3xl font-bold tabular-nums text-gray-900">{kpi.value}</p>
            <p className="mt-1 text-xs text-gray-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Per-restaurant table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">Détail par restaurant</h2>

        {data.byRestaurant.length === 0 ? (
          <div className="rounded-2xl border border-[#eaecf0] bg-white py-12 text-center text-gray-400">
            Aucun broadcast WhatsApp enregistré pour le moment.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Restaurant</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Broadcasts</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Messages</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Coût estimé</th>
                  <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:table-cell">Dernier envoi</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Part</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f5]">
                {data.byRestaurant.map((r) => {
                  const pct = maxCost > 0 ? (r.costUsd / maxCost) * 100 : 0;
                  return (
                    <tr key={r.id} className="hover:bg-[#fafbfc] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.name}</p>
                        {r.city && <p className="text-xs text-gray-400">{r.city}</p>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">{r.broadcastCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">{r.totalMessages.toLocaleString("fr-CH")}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold tabular-nums text-gray-900">{fmtUsd(r.costUsd)}</span>
                      </td>
                      <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">{fmtDate(r.lastBroadcastAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 tabular-nums">{Math.round(pct)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-[#eaecf0] bg-[#f8fafc]">
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">{data.totalBroadcasts}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">{data.allTimeMessages.toLocaleString("fr-CH")}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-gray-900">{fmtUsd(data.allTimeCostUsd)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell" />
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Monthly breakdown */}
      {data.byMonth.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Historique mensuel
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Mois</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Broadcasts</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Messages</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Coût estimé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f5]">
                {data.byMonth.map((m, i) => (
                  <tr key={m.month} className="hover:bg-[#fafbfc] transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {fmtMonth(m.month)}
                      {i === 0 && (
                        <span
                          className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: "#eef2ff", color: "#4f46e5" }}
                        >
                          en cours
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{m.broadcasts}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{m.messages.toLocaleString("fr-CH")}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">{fmtUsd(m.costUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
