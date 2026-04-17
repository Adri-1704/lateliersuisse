import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Link2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const COMMISSION_RATE = 0.10; // 10%

interface AffiliateStats {
  ref: string;
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

  // Get merchant details
  const merchantIds = [...new Set(subs.map((s) => s.merchant_id))];
  const { data: merchants } = await supabase
    .from("merchants")
    .select("id, name, email")
    .in("id", merchantIds) as { data: { id: string; name: string; email: string }[] | null };

  const merchantMap = new Map((merchants || []).map((m) => [m.id, m]));

  // Price mapping
  function getPrice(plan: string, isEarlyBird: boolean): number {
    if (plan === "lifetime") return 1495;
    if (plan === "annual") return isEarlyBird ? 299 : 499;
    if (plan === "semiannual") return isEarlyBird ? 159 : 269;
    return isEarlyBird ? 29.95 : 49.95; // monthly
  }

  // Group by affiliate
  const affiliateMap = new Map<string, AffiliateStats>();

  for (const sub of subs) {
    const ref = sub.affiliate_ref;
    if (!affiliateMap.has(ref)) {
      affiliateMap.set(ref, {
        ref,
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Affiliations</h1>
        <p className="mt-1 text-gray-600">
          Suivi des commissions affiliés. Chaque lien <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">?ref=xxx</code> est tracké automatiquement.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Users className="h-4 w-4" /> Abonnements via affiliés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{totals.subscriptions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <TrendingUp className="h-4 w-4" /> Revenu généré
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{totals.revenue.toFixed(2)} CHF</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <DollarSign className="h-4 w-4" /> Commissions dues (10%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[var(--color-just-tag)]">{totals.commission.toFixed(2)} CHF</p>
          </CardContent>
        </Card>
      </div>

      {noData ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Link2 className="mx-auto mb-4 h-10 w-10 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900">Aucun abonnement via affilié pour l&apos;instant</h3>
            <p className="mt-2 text-sm text-gray-500">
              Quand un restaurateur s&apos;abonnera via un lien <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">?ref=xxx</code>, il apparaîtra ici automatiquement.
            </p>
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left text-sm">
              <p className="font-semibold text-gray-700">Comment ça marche :</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-gray-600">
                <li>Tu donnes un lien personnalisé à un influenceur : <code className="rounded bg-gray-100 px-1 text-xs">just-tag.app/fr/pour-restaurateurs?ref=marie</code></li>
                <li>L&apos;influenceur partage le lien à sa communauté</li>
                <li>Un restaurateur clique, un cookie <code className="rounded bg-gray-100 px-1 text-xs">jt_ref=marie</code> est stocké 30 jours</li>
                <li>Le restaurateur s&apos;inscrit et paie → le code &ldquo;marie&rdquo; est attaché à l&apos;abonnement</li>
                <li>Tu vois ici quel affilié a amené quel client et combien tu lui dois</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {affiliates.map((aff) => (
            <Card key={aff.ref}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-just-tag)]/10 font-bold text-[var(--color-just-tag)]">
                      {aff.ref.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{aff.ref}</p>
                      <p className="text-xs text-gray-500">
                        Lien : just-tag.app/fr/pour-restaurateurs?ref={aff.ref}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[var(--color-just-tag)]">{aff.commissionDue.toFixed(2)} CHF</p>
                    <p className="text-xs text-gray-500">commission due</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Abonnements actifs :</span>{" "}
                    <span className="font-semibold">{aff.activeSubscriptions}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenu généré :</span>{" "}
                    <span className="font-semibold">{aff.totalRevenue.toFixed(2)} CHF</span>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-600">
                    <tr>
                      <th className="px-3 py-2">Restaurant</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Plan</th>
                      <th className="px-3 py-2">Statut</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aff.merchants.map((m, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="px-3 py-2 font-medium">{m.name}</td>
                        <td className="px-3 py-2 text-gray-600">{m.email}</td>
                        <td className="px-3 py-2 capitalize">{m.plan}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            m.status === "active" ? "bg-green-100 text-green-800"
                              : m.status === "trialing" ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600">{m.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
