import { createAdminClient } from "@/lib/supabase/server";
import { Users, TrendingUp, DollarSign, Link2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const COMMISSION_RATE = 0.10;

interface AffiliateStats {
  ref: string;
  parrainName: string | null;
  parrainEmail: string | null;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  commissionDue: number;
  merchants: { name: string; email: string; plan: string; status: string; date: string }[];
}

async function getAffiliateStats(): Promise<{
  affiliates: AffiliateStats[];
  totals: { subscriptions: number; revenue: number; commission: number };
}> {
  const supabase = createAdminClient();

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("affiliate_ref, plan_type, status, created_at, merchant_id, is_early_bird")
    .not("affiliate_ref", "is", null) as {
      data: { affiliate_ref: string; plan_type: string; status: string; created_at: string; merchant_id: string; is_early_bird: boolean }[] | null;
    };

  if (!subs || subs.length === 0) {
    return { affiliates: [], totals: { subscriptions: 0, revenue: 0, commission: 0 } };
  }

  const merchantIds = [...new Set(subs.map((s) => s.merchant_id))];
  const { data: merchants } = await supabase
    .from("merchants")
    .select("id, name, email")
    .in("id", merchantIds) as { data: { id: string; name: string; email: string }[] | null };

  const merchantMap = new Map((merchants || []).map((m) => [m.id, m]));

  const uniqueRefs = [...new Set(subs.map((s) => s.affiliate_ref))];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: parrains } = await (supabase.from("merchants") as any)
    .select("ref_code, name, email")
    .in("ref_code", uniqueRefs) as { data: { ref_code: string; name: string; email: string }[] | null };

  const parrainMap = new Map(
    (parrains || []).map((p) => [p.ref_code, { name: p.name, email: p.email }])
  );

  function getPrice(plan: string, isEarlyBird: boolean): number {
    if (plan === "lifetime") return 1495;
    if (plan === "annual") return isEarlyBird ? 299 : 499;
    if (plan === "semiannual") return isEarlyBird ? 159 : 269;
    return isEarlyBird ? 29.95 : 49.95;
  }

  const affiliateMap = new Map<string, AffiliateStats>();

  for (const sub of subs) {
    const ref = sub.affiliate_ref;
    if (!affiliateMap.has(ref)) {
      const parrain = parrainMap.get(ref);
      affiliateMap.set(ref, {
        ref,
        parrainName: parrain?.name || null,
        parrainEmail: parrain?.email || null,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        commissionDue: 0,
        merchants: [],
      });
    }
    const aff = affiliateMap.get(ref)!;
    const price = getPrice(sub.plan_type, sub.is_early_bird);
    const merchant = merchantMap.get(sub.merchant_id);

    aff.totalSubscriptions++;
    if (sub.status === "active" || sub.status === "trialing") {
      aff.activeSubscriptions++;
      aff.totalRevenue += price;
      aff.commissionDue += price * COMMISSION_RATE;
    }
    aff.merchants.push({
      name: merchant?.name || "Inconnu",
      email: merchant?.email || "",
      plan: sub.plan_type,
      status: sub.status,
      date: new Date(sub.created_at).toLocaleDateString("fr-CH"),
    });
  }

  const affiliates = Array.from(affiliateMap.values()).sort(
    (a, b) => b.activeSubscriptions - a.activeSubscriptions
  );

  const totals = {
    subscriptions: affiliates.reduce((s, a) => s + a.activeSubscriptions, 0),
    revenue: affiliates.reduce((s, a) => s + a.totalRevenue, 0),
    commission: affiliates.reduce((s, a) => s + a.commissionDue, 0),
  };

  return { affiliates, totals };
}

export default async function AffiliationsAdminPage() {
  const { affiliates, totals } = await getAffiliateStats();
  const noData = affiliates.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Link2 className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Affiliations</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Suivi des commissions affiliés via{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">?ref=xxx</code>
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: "Abonnements via affiliés", value: totals.subscriptions, icon: <Users className="h-5 w-5 text-indigo-600" /> },
          { title: "Revenu généré", value: `${totals.revenue.toFixed(2)} CHF`, icon: <TrendingUp className="h-5 w-5 text-indigo-600" /> },
          { title: "Commissions dues (10%)", value: `${totals.commission.toFixed(2)} CHF`, icon: <DollarSign className="h-5 w-5 text-indigo-600" />, highlight: true },
        ].map((kpi) => (
          <div key={kpi.title} className="rounded-2xl border border-[#eaecf0] bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                {kpi.icon}
              </div>
              <p className="text-sm text-gray-500">{kpi.title}</p>
            </div>
            <p className={`text-3xl font-bold ${kpi.highlight ? "text-indigo-600" : "text-gray-900"}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {noData ? (
        <div className="rounded-2xl border border-[#eaecf0] bg-white py-12 text-center">
          <Link2 className="mx-auto mb-4 h-10 w-10 text-gray-200" />
          <h3 className="text-lg font-bold text-gray-900">Aucun abonnement via affilié pour l&apos;instant</h3>
          <p className="mt-2 text-sm text-gray-400">
            Quand un restaurateur s&apos;abonnera via un lien{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">?ref=xxx</code>, il apparaîtra ici automatiquement.
          </p>
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-[#eaecf0] bg-[#f8fafc] p-4 text-left text-sm">
            <p className="font-semibold text-gray-700">Comment ça marche :</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-gray-500">
              <li>Tu donnes un lien à un influenceur : <code className="rounded bg-gray-100 px-1 text-xs">just-tag.app/fr/pour-restaurateurs?ref=marie</code></li>
              <li>Un restaurateur clique → cookie <code className="rounded bg-gray-100 px-1 text-xs">jt_ref=marie</code> stocké 30 jours</li>
              <li>Le restaurateur s&apos;inscrit et paie → le code est attaché à l&apos;abonnement</li>
              <li>Tu vois ici quel affilié a amené quel client et combien tu lui dois</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {affiliates.map((aff) => (
            <div key={aff.ref} className="rounded-2xl border border-[#eaecf0] bg-white overflow-hidden">
              {/* Affiliate header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaecf0]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {(aff.parrainName || aff.ref).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {aff.parrainName || aff.ref}
                      {aff.parrainName && (
                        <span className="ml-2 text-xs font-normal text-gray-400">(code {aff.ref})</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {aff.parrainEmail ? `${aff.parrainEmail} · ` : ""}
                      just-tag.app/fr/pour-restaurateurs?ref={aff.ref}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{aff.commissionDue.toFixed(2)} CHF</p>
                  <p className="text-xs text-gray-400">commission due</p>
                </div>
              </div>

              {/* Affiliate summary */}
              <div className="flex gap-6 px-6 py-3 text-sm border-b border-[#f0f2f5] bg-[#f8fafc]">
                <div>
                  <span className="text-gray-500">Abonnements actifs :</span>{" "}
                  <span className="font-semibold text-gray-900">{aff.activeSubscriptions}</span>
                </div>
                <div>
                  <span className="text-gray-500">Revenu généré :</span>{" "}
                  <span className="font-semibold text-gray-900">{aff.totalRevenue.toFixed(2)} CHF</span>
                </div>
              </div>

              {/* Filleuls table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                    <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Restaurant</th>
                    <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Plan</th>
                    <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Statut</th>
                    <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f2f5]">
                  {aff.merchants.map((m, i) => (
                    <tr key={i} className="hover:bg-[#fafbfc] transition-colors">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{m.email}</td>
                      <td className="px-4 py-2.5 capitalize text-gray-700">{m.plan}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={
                            m.status === "active"
                              ? { background: "#f0fdf4", color: "#16a34a" }
                              : m.status === "trialing"
                              ? { background: "#eff6ff", color: "#2563eb" }
                              : { background: "#f3f4f6", color: "#374151" }
                          }
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{m.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
