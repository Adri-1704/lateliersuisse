import { getSaaSMetrics } from "@/actions/admin/stats";
import { EARLY_BIRD_LIMIT } from "@/lib/stripe";
import {
  TrendingUp,
  DollarSign,
  Users,
  UserPlus,
  UserMinus,
  BarChart3,
  Target,
  UtensilsCrossed,
  ShieldCheck,
  Zap,
  Clock,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

function formatCHF(amount: number): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatPercent(value: number): string {
  if (!isFinite(value)) return "0%";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-medium text-emerald-600">
        <ArrowUpRight className="h-3.5 w-3.5" />
        {formatPercent(value)}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-medium text-red-600">
        <ArrowDownRight className="h-3.5 w-3.5" />
        {formatPercent(value)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-sm font-medium text-gray-400">
      <Minus className="h-3.5 w-3.5" />
      0%
    </span>
  );
}

function ProgressBar({
  value,
  max,
  color = "bg-indigo-500",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-gray-100">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function KpiCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      {children}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

export default async function StatsPage() {
  const m = await getSaaSMetrics();

  const planLabels: Record<string, string> = {
    monthly: "Mensuel",
    semiannual: "Semestriel",
    annual: "Annuel",
    lifetime: "Lifetime",
  };

  const totalByPlan =
    m.subscribersByPlan.monthly +
    m.subscribersByPlan.semiannual +
    m.subscribersByPlan.annual +
    m.subscribersByPlan.lifetime;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Statistiques SaaS</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          Tableau de bord en temps réel — Just-Tag.app
        </p>
      </div>

      {/* KPIs principaux */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="MRR" icon={<DollarSign className="h-4 w-4" />}>
          <p className="text-3xl font-bold text-gray-900">{formatCHF(m.mrr)}</p>
          <div className="mt-1 flex items-center gap-2">
            <TrendIndicator value={m.mom} />
            <span className="text-xs text-gray-400">vs mois préc.</span>
          </div>
        </KpiCard>

        <KpiCard title="ARR" icon={<TrendingUp className="h-4 w-4" />}>
          <p className="text-3xl font-bold text-gray-900">{formatCHF(m.arr)}</p>
          <p className="mt-1 text-xs text-gray-400">MRR × 12</p>
        </KpiCard>

        <KpiCard title="Abonnés actifs" icon={<Users className="h-4 w-4" />}>
          <p className="text-3xl font-bold text-gray-900">{m.activeSubscribers}</p>
          <p className="mt-1 text-xs text-gray-400">dont {m.trialingSubscribers} en trial</p>
        </KpiCard>

        <KpiCard title="Churn rate" icon={<UserMinus className="h-4 w-4" />}>
          <p
            className={`text-3xl font-bold ${
              m.churnRate > 5
                ? "text-red-600"
                : m.churnRate > 0
                ? "text-amber-600"
                : "text-emerald-600"
            }`}
          >
            {m.churnRate}%
          </p>
          <p className="mt-1 text-xs text-gray-400">ce mois</p>
        </KpiCard>

        <KpiCard title="Places Early Bird" icon={<Zap className="h-4 w-4 text-amber-500" />}>
          <p className="text-3xl font-bold text-gray-900">
            {m.earlyBirdSpotsRemaining}
            <span className="text-lg font-normal text-gray-400">/{EARLY_BIRD_LIMIT}</span>
          </p>
          <div className="mt-2">
            <ProgressBar
              value={EARLY_BIRD_LIMIT - m.earlyBirdSpotsRemaining}
              max={EARLY_BIRD_LIMIT}
              color="bg-amber-500"
            />
          </div>
        </KpiCard>
      </div>

      {/* Croissance & Conversion */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Revenue total estimé" icon={<DollarSign className="h-4 w-4 text-emerald-600" />}>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(m.revenueTotalEstime)}</p>
          <p className="mt-1 text-xs text-gray-400">ARR + Lifetime</p>
        </KpiCard>

        <KpiCard title="Revenue Lifetime" icon={<Award className="h-4 w-4" />}>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(m.revenueLifetime)}</p>
          <p className="mt-1 text-xs text-gray-400">
            {m.subscribersByPlan.lifetime} abonné{m.subscribersByPlan.lifetime !== 1 ? "s" : ""} lifetime
          </p>
        </KpiCard>

        <KpiCard title="Nouveaux ce mois" icon={<UserPlus className="h-4 w-4" />}>
          <p className="text-2xl font-bold text-gray-900">{m.newSubscribersThisMonth}</p>
          <p className="mt-1 text-xs text-gray-400">vs {m.newSubscribersPrevMonth} mois préc.</p>
        </KpiCard>

        <KpiCard title="Conversion trial → payant" icon={<Target className="h-4 w-4" />}>
          <p
            className={`text-2xl font-bold ${
              m.trialConversionRate >= 50
                ? "text-emerald-600"
                : m.trialConversionRate > 0
                ? "text-amber-600"
                : "text-gray-900"
            }`}
          >
            {m.trialConversionRate}%
          </p>
          <p className="mt-1 text-xs text-gray-400">{m.trialingSubscribers} en trial actuellement</p>
        </KpiCard>
      </div>

      {/* Répartition */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Répartition par plan" icon={<BarChart3 className="h-4 w-4 text-indigo-500" />}>
          <div className="space-y-3">
            {(Object.entries(m.subscribersByPlan) as [string, number][]).map(([plan, count]) => (
              <div key={plan} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{planLabels[plan] || plan}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
                <ProgressBar value={count} max={totalByPlan || 1} />
              </div>
            ))}
            {totalByPlan === 0 && (
              <p className="text-sm text-gray-400">Aucun abonné pour le moment</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Early Bird vs Standard" icon={<Zap className="h-4 w-4 text-amber-500" />}>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Early Bird
                </span>
                <span className="font-semibold text-gray-900">{m.earlyBirdCount}</span>
              </div>
              <ProgressBar
                value={m.earlyBirdCount}
                max={m.earlyBirdCount + m.standardCount || 1}
                color="bg-amber-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  Standard
                </span>
                <span className="font-semibold text-gray-900">{m.standardCount}</span>
              </div>
              <ProgressBar value={m.standardCount} max={m.earlyBirdCount + m.standardCount || 1} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Abonnés par canton" icon={<Users className="h-4 w-4 text-indigo-500" />}>
          {m.subscribersByCanton.length > 0 ? (
            <div className="space-y-2">
              {m.subscribersByCanton.map((c) => (
                <div key={c.canton} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{c.canton}</span>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: "#eef2ff", color: "#4f46e5" }}
                  >
                    {c.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucune donnée canton disponible</p>
          )}
        </SectionCard>
      </div>

      {/* Clients & Claims */}
      <div>
        <h2 className="mb-4 text-base font-bold text-gray-900">Clients & Revendications</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total commerçants" icon={<Users className="h-4 w-4" />}>
            <p className="text-2xl font-bold text-gray-900">{m.totalMerchants}</p>
          </KpiCard>

          <KpiCard title="Demandes de claim" icon={<ShieldCheck className="h-4 w-4" />}>
            <p className="text-2xl font-bold text-gray-900">{m.totalClaimRequests}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                {m.claimsApproved} approuvé{m.claimsApproved !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#f3f4f6", color: "#374151" }}>
                {m.claimsPending} en attente
              </span>
              {m.claimsRejected > 0 && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#fef2f2", color: "#dc2626" }}>
                  {m.claimsRejected} rejeté{m.claimsRejected !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </KpiCard>

          <KpiCard title="Conversion claim → abonné" icon={<Target className="h-4 w-4" />}>
            <p
              className={`text-2xl font-bold ${
                m.claimToSubscriberRate >= 50
                  ? "text-emerald-600"
                  : m.claimToSubscriberRate > 0
                  ? "text-amber-600"
                  : "text-gray-900"
              }`}
            >
              {m.claimToSubscriberRate}%
            </p>
            <p className="mt-1 text-xs text-gray-400">claims approuvés avec abonnement actif</p>
          </KpiCard>

          <KpiCard title="En trial" icon={<Clock className="h-4 w-4" />}>
            <p className="text-2xl font-bold text-gray-900">{m.trialingSubscribers}</p>
            <p className="mt-1 text-xs text-gray-400">14 jours d&apos;essai</p>
          </KpiCard>
        </div>
      </div>

      {/* Opérationnel */}
      <div>
        <h2 className="mb-4 text-base font-bold text-gray-900">Indicateurs opérationnels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Restaurants publiés" icon={<UtensilsCrossed className="h-4 w-4" />}>
            <p className="text-2xl font-bold text-gray-900">{m.totalPublishedRestaurants}</p>
          </KpiCard>

          <KpiCard title="Restaurants revendiqués" icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}>
            <p className="text-2xl font-bold text-gray-900">{m.claimedRestaurants}</p>
          </KpiCard>

          <KpiCard title="Taux de revendication" icon={<BarChart3 className="h-4 w-4" />}>
            <p className="text-2xl font-bold text-gray-900">{m.claimRate}%</p>
            <div className="mt-2">
              <ProgressBar value={m.claimedRestaurants} max={m.totalPublishedRestaurants || 1} />
            </div>
          </KpiCard>

          <KpiCard title="Ratio revendiqué / total" icon={<UtensilsCrossed className="h-4 w-4" />}>
            <p className="text-2xl font-bold text-gray-900">
              {m.claimedRestaurants}
              <span className="text-lg font-normal text-gray-400">/{m.totalPublishedRestaurants}</span>
            </p>
          </KpiCard>
        </div>
      </div>
    </div>
  );
}
