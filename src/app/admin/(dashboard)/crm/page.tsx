import Link from "next/link";
import { getProspects, getPipelineStats, updateProspectStatus } from "@/actions/prospects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Nouveau", color: "bg-blue-100 text-blue-800" },
  contacted: { label: "Contacté", color: "bg-yellow-100 text-yellow-800" },
  replied: { label: "A répondu", color: "bg-green-100 text-green-800" },
  meeting: { label: "RDV prévu", color: "bg-purple-100 text-purple-800" },
  trial: { label: "En essai", color: "bg-cyan-100 text-cyan-800" },
  paying: { label: "Payant", color: "bg-emerald-100 text-emerald-800" },
  lost: { label: "Perdu", color: "bg-gray-100 text-gray-600" },
};

const PRIORITY_ICONS: Record<string, string> = {
  hot: "🔥",
  normal: "",
  low: "",
};

export default async function CRMPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const prospects = await getProspects({
    status: sp.status || undefined,
    type: sp.type || undefined,
  });
  const stats = await getPipelineStats();

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const todayFollowUps = prospects.filter(
    (p) => p.next_follow_up_at && new Date(p.next_follow_up_at) <= today && p.status !== "paying" && p.status !== "lost"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM — Victor</h1>
          <p className="mt-1 text-gray-600">Pipeline de prospection. Email quotidien à 7h.</p>
        </div>
        <Link href="/admin/crm/new">
          <Button className="gap-2 bg-[var(--color-just-tag)] hover:opacity-90">
            <Plus className="h-4 w-4" /> Ajouter un prospect
          </Button>
        </Link>
      </div>

      {/* Pipeline KPIs */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/crm" className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${!sp.status ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          Tous ({Object.values(stats).reduce((s, n) => s + n, 0)})
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
          <Link
            key={key}
            href={`/admin/crm?status=${key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${sp.status === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {label} ({stats[key] || 0})
          </Link>
        ))}
      </div>

      {/* Today's follow-ups */}
      {todayFollowUps.length > 0 && (
        <Card className="border-[var(--color-just-tag)] border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-[var(--color-just-tag)]">
              🔔 À relancer aujourd&apos;hui ({todayFollowUps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayFollowUps.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
                  <div>
                    <span className="font-medium text-gray-900">{PRIORITY_ICONS[p.priority]} {p.name}</span>
                    <span className="ml-2 text-sm text-gray-500">{p.follow_up_action || "relance"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="rounded-md bg-white p-1.5 text-gray-600 hover:text-[var(--color-just-tag)]">
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    {p.email && (
                      <a href={`mailto:${p.email}`} className="rounded-md bg-white p-1.5 text-gray-600 hover:text-[var(--color-just-tag)]">
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    <Link href={`/admin/crm/${p.id}`} className="rounded-md bg-white px-2 py-1 text-xs font-medium hover:bg-gray-100">
                      Voir <ArrowRight className="ml-1 inline h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prospects table */}
      <Card>
        <CardHeader>
          <CardTitle>{prospects.length} prospects</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {prospects.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <p>Aucun prospect. Ajoute ton premier contact.</p>
              <Link href="/admin/crm/new">
                <Button className="mt-4 gap-2 bg-[var(--color-just-tag)]">
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Prospect</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Prochaine action</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.map((p) => {
                    const st = STATUS_LABELS[p.status] || { label: p.status, color: "bg-gray-100 text-gray-600" };
                    const isOverdue = p.next_follow_up_at && new Date(p.next_follow_up_at) <= today && p.status !== "paying" && p.status !== "lost";
                    return (
                      <tr key={p.id} className={`border-b last:border-b-0 hover:bg-gray-50 ${isOverdue ? "bg-red-50/50" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{PRIORITY_ICONS[p.priority]} {p.name}</div>
                          <div className="text-xs text-gray-500">{[p.city, p.canton].filter(Boolean).join(", ")}</div>
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-600">{p.type}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${st.color} border-0`}>{st.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {p.next_follow_up_at ? (
                            <div>
                              <div className={`text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
                                {new Date(p.next_follow_up_at).toLocaleDateString("fr-CH")}
                                {isOverdue && " ⚠️"}
                              </div>
                              <div className="text-xs text-gray-500">{p.follow_up_action || "—"}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {p.phone && (
                              <a href={`tel:${p.phone}`} className="text-gray-400 hover:text-[var(--color-just-tag)]">
                                <Phone className="h-4 w-4" />
                              </a>
                            )}
                            {p.email && (
                              <a href={`mailto:${p.email}`} className="text-gray-400 hover:text-[var(--color-just-tag)]">
                                <Mail className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/crm/${p.id}`}
                            className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                          >
                            Modifier
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
