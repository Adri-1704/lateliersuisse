import { getWhatsAppCosts, META_MARKETING_PRICE_USD } from "@/actions/admin/whatsapp-costs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  return new Date(iso).toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function WhatsAppCostsPage() {
  const data = await getWhatsAppCosts();

  const maxCost = data.byRestaurant[0]?.costUsd ?? 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Coûts Meta WhatsApp</h1>
        <p className="text-muted-foreground">
          Dépenses estimées par restaurant — conversations marketing Meta Cloud API
        </p>
      </div>

      {/* Pricing note */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Tarif appliqué : <strong>{fmtUsd(META_MARKETING_PRICE_USD)} USD / conversation marketing</strong> (Suisse / Europe de l&apos;Ouest).
          Chaque message envoyé à un abonné = 1 conversation. Mettre à jour la constante{" "}
          <code className="rounded bg-blue-100 px-1 font-mono text-xs">META_MARKETING_PRICE_USD</code>{" "}
          dans <code className="rounded bg-blue-100 px-1 font-mono text-xs">src/actions/admin/whatsapp-costs.ts</code>{" "}
          si Meta change ses tarifs.
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Coût estimé — ce mois</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums">{fmtUsd(data.thisMonthCostUsd)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{data.thisMonthMessages} messages envoyés</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Coût estimé — total</p>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums">{fmtUsd(data.allTimeCostUsd)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{data.allTimeMessages} messages au total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Messages — ce mois</p>
              <Send className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums">{data.thisMonthMessages.toLocaleString("fr-CH")}</p>
            <p className="mt-1 text-xs text-muted-foreground">conversations ouvertes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Broadcasts envoyés</p>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums">{data.totalBroadcasts.toLocaleString("fr-CH")}</p>
            <p className="mt-1 text-xs text-muted-foreground">sur {data.byRestaurant.length} restaurant{data.byRestaurant.length !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-restaurant table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Détail par restaurant</h2>

        {data.byRestaurant.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucun broadcast WhatsApp enregistré pour le moment.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Restaurant</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Broadcasts</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Messages</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Coût estimé</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Dernier envoi</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Part</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.byRestaurant.map((r) => {
                  const pct = maxCost > 0 ? (r.costUsd / maxCost) * 100 : 0;
                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{r.name}</p>
                        {r.city && <p className="text-xs text-muted-foreground">{r.city}</p>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.broadcastCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.totalMessages.toLocaleString("fr-CH")}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold tabular-nums">{fmtUsd(r.costUsd)}</span>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {fmtDate(r.lastBroadcastAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-[var(--color-just-tag)]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {Math.round(pct)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t bg-muted/40">
                <tr>
                  <td className="px-4 py-3 font-semibold">Total</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{data.totalBroadcasts}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {data.allTimeMessages.toLocaleString("fr-CH")}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">{fmtUsd(data.allTimeCostUsd)}</td>
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
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5" />
            Historique mensuel
          </h2>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mois</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Broadcasts</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Messages</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Coût estimé</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.byMonth.map((m, i) => (
                  <tr key={m.month} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {fmtMonth(m.month)}
                      {i === 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          en cours
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.broadcasts}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.messages.toLocaleString("fr-CH")}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{fmtUsd(m.costUsd)}</td>
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
