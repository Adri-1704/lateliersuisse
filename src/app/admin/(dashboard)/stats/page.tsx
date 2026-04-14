import { getSaaSMetrics } from "@/actions/admin/stats";
import { EARLY_BIRD_LIMIT } from "@/lib/stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
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
    <span className="inline-flex items-center gap-0.5 text-sm font-medium text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />
      0%
    </span>
  );
}

function ProgressBar({ value, max, color = "bg-[var(--color-just-tag)]" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2.5 w-full rounded-full bg-muted">
      <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
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
      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold">Statistiques SaaS</h1>
        <p className="text-muted-foreground">
          Tableau de bord en temps reel — Just-Tag.app
        </p>
      </div>

      {/* ── KPIs principaux ────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* MRR */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">MRR</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{formatCHF(m.mrr)}</p>
            <div className="mt-1 flex items-center gap-2">
              <TrendIndicator value={m.mom} />
              <span className="text-xs text-muted-foreground">vs mois prec.</span>
            </div>
          </CardContent>
        </Card>

        {/* ARR */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">ARR</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{formatCHF(m.arr)}</p>
            <p className="mt-1 text-xs text-muted-foreground">MRR x 12</p>
          </CardContent>
        </Card>

        {/* Abonnes actifs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Abonnes actifs</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{m.activeSubscribers}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              dont {m.trialingSubscribers} en trial
            </p>
          </CardContent>
        </Card>

        {/* Churn */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Churn rate</p>
              <UserMinus className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={`mt-2 text-3xl font-bold ${m.churnRate > 5 ? "text-red-600" : m.churnRate > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {m.churnRate}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">ce mois</p>
          </CardContent>
        </Card>

        {/* Early Bird */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Places Early Bird</p>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-3xl font-bold">
              {m.earlyBirdSpotsRemaining}
              <span className="text-lg font-normal text-muted-foreground">/{EARLY_BIRD_LIMIT}</span>
            </p>
            <div className="mt-2">
              <ProgressBar
                value={EARLY_BIRD_LIMIT - m.earlyBirdSpotsRemaining}
                max={EARLY_BIRD_LIMIT}
                color="bg-amber-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Ligne 2 : Croissance & Conversion ──────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue total estime */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Revenue total estime</p>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCHF(m.revenueTotalEstime)}</p>
            <p className="mt-1 text-xs text-muted-foreground">ARR + Lifetime</p>
          </CardContent>
        </Card>

        {/* Revenue Lifetime */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Revenue Lifetime</p>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCHF(m.revenueLifetime)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {m.subscribersByPlan.lifetime} abonne{m.subscribersByPlan.lifetime !== 1 ? "s" : ""} lifetime
            </p>
          </CardContent>
        </Card>

        {/* Nouveaux ce mois */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Nouveaux ce mois</p>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold">{m.newSubscribersThisMonth}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              vs {m.newSubscribersPrevMonth} mois prec.
            </p>
          </CardContent>
        </Card>

        {/* Conversion trial */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Conversion trial → payant</p>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={`mt-2 text-2xl font-bold ${m.trialConversionRate >= 50 ? "text-emerald-600" : m.trialConversionRate > 0 ? "text-amber-600" : ""}`}>
              {m.trialConversionRate}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {m.trialingSubscribers} en trial actuellement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Section Repartition ────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Par plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Repartition par plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(m.subscribersByPlan) as [string, number][]).map(
              ([plan, count]) => (
                <div key={plan} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{planLabels[plan] || plan}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <ProgressBar value={count} max={totalByPlan || 1} />
                </div>
              )
            )}
            {totalByPlan === 0 && (
              <p className="text-sm text-muted-foreground">Aucun abonne pour le moment</p>
            )}
          </CardContent>
        </Card>

        {/* Early Bird vs Standard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Early Bird vs Standard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Early Bird
                </span>
                <span className="font-medium">{m.earlyBirdCount}</span>
              </div>
              <ProgressBar
                value={m.earlyBirdCount}
                max={m.earlyBirdCount + m.standardCount || 1}
                color="bg-amber-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-just-tag)]" />
                  Standard
                </span>
                <span className="font-medium">{m.standardCount}</span>
              </div>
              <ProgressBar
                value={m.standardCount}
                max={m.earlyBirdCount + m.standardCount || 1}
              />
            </div>
            {m.earlyBirdCount + m.standardCount === 0 && (
              <p className="text-sm text-muted-foreground">Aucun abonne pour le moment</p>
            )}
          </CardContent>
        </Card>

        {/* Par canton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Abonnes par canton
            </CardTitle>
          </CardHeader>
          <CardContent>
            {m.subscribersByCanton.length > 0 ? (
              <div className="space-y-2">
                {m.subscribersByCanton.map((c) => (
                  <div key={c.canton} className="flex items-center justify-between text-sm">
                    <span>{c.canton}</span>
                    <Badge variant="secondary">{c.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune donnee canton disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Section Clients & Claims ───────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Clients & Revendications</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total commercants</p>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{m.totalMerchants}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Demandes de claim</p>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{m.totalClaimRequests}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="default" className="bg-emerald-600">
                  {m.claimsApproved} approuve{m.claimsApproved !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary">
                  {m.claimsPending} en attente
                </Badge>
                {m.claimsRejected > 0 && (
                  <Badge variant="destructive">
                    {m.claimsRejected} rejete{m.claimsRejected !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Conversion claim → abonne</p>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className={`mt-2 text-2xl font-bold ${m.claimToSubscriberRate >= 50 ? "text-emerald-600" : m.claimToSubscriberRate > 0 ? "text-amber-600" : ""}`}>
                {m.claimToSubscriberRate}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                claims approuves avec abonnement actif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">En trial</p>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{m.trialingSubscribers}</p>
              <p className="mt-1 text-xs text-muted-foreground">14 jours d&apos;essai</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Section Operationnel ───────────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Indicateurs operationnels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Restaurants publies</p>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{m.totalPublishedRestaurants}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Restaurants revendiques</p>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold">{m.claimedRestaurants}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Taux de revendication</p>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{m.claimRate}%</p>
              <div className="mt-2">
                <ProgressBar value={m.claimedRestaurants} max={m.totalPublishedRestaurants || 1} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Ratio revendique / total</p>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">
                {m.claimedRestaurants}
                <span className="text-lg font-normal text-muted-foreground">
                  /{m.totalPublishedRestaurants}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
