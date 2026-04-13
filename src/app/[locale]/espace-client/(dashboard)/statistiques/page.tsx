import { getMerchantSession } from "@/actions/merchant/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, Calendar, Globe } from "lucide-react";

interface ViewRecord {
  viewed_at: string;
  source: string | null;
}

async function getRestaurantViews(restaurantId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurant_views")
    .select("viewed_at, source")
    .eq("restaurant_id", restaurantId)
    .order("viewed_at", { ascending: false })
    .limit(10000) as { data: ViewRecord[] | null; error: unknown };

  if (error || !data) return [];
  return data;
}

export default async function StatistiquesPage() {
  const session = await getMerchantSession();
  const restaurant = session?.restaurant;

  if (!restaurant) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">
          Vous devez d&apos;abord créer ou lier votre fiche restaurant pour voir les statistiques.
        </p>
      </div>
    );
  }

  const views = await getRestaurantViews(restaurant.id);

  // Calculate stats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const last7Days = new Date(today.getTime() - 7 * 86400000);
  const last30Days = new Date(today.getTime() - 30 * 86400000);

  const todayViews = views.filter(v => new Date(v.viewed_at) >= today).length;
  const yesterdayViews = views.filter(v => {
    const d = new Date(v.viewed_at);
    return d >= yesterday && d < today;
  }).length;
  const last7DaysViews = views.filter(v => new Date(v.viewed_at) >= last7Days).length;
  const last30DaysViews = views.filter(v => new Date(v.viewed_at) >= last30Days).length;
  const totalViews = views.length;

  // Source breakdown
  const sources: Record<string, number> = {};
  views.forEach(v => {
    const src = v.source || "direct";
    sources[src] = (sources[src] || 0) + 1;
  });
  const topSources = Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Daily views for last 30 days (chart data)
  const dailyViews: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    dailyViews[key] = 0;
  }
  views.forEach(v => {
    const key = new Date(v.viewed_at).toISOString().slice(0, 10);
    if (key in dailyViews) dailyViews[key]++;
  });
  const maxDaily = Math.max(...Object.values(dailyViews), 1);
  const sortedDays = Object.entries(dailyViews).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiques de visites</h1>
        <p className="text-muted-foreground">
          Suivez le nombre de personnes qui consultent votre fiche restaurant
        </p>
      </div>

      {/* Key stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aujourd&apos;hui</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayViews}</div>
            <p className="text-xs text-muted-foreground">
              {todayViews >= yesterdayViews ? "↗" : "↘"} hier: {yesterdayViews}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">7 derniers jours</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last7DaysViews}</div>
            <p className="text-xs text-muted-foreground">vues cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">30 derniers jours</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last30DaysViews}</div>
            <p className="text-xs text-muted-foreground">vues ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Globe className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">vues depuis le lancement</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vues des 30 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          {totalViews === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune visite enregistrée pour le moment.
            </p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {sortedDays.map(([date, count]) => {
                const height = (count / maxDaily) * 100;
                const dayLabel = new Date(date).toLocaleDateString("fr-CH", { day: "numeric", month: "short" });
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[var(--color-just-tag)]/20 rounded-t hover:bg-[var(--color-just-tag)] transition-colors min-h-[2px]"
                      style={{ height: `${height}%` }}
                      title={`${dayLabel}: ${count} vue${count > 1 ? "s" : ""}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top sources */}
      {topSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sources de trafic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSources.map(([source, count]) => {
                const pct = Math.round((count / totalViews) * 100);
                return (
                  <div key={source} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-32 truncate">{source}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-just-tag)] flex items-center justify-end px-2 text-xs text-white font-semibold"
                        style={{ width: `${pct}%`, minWidth: pct > 0 ? "30px" : "0" }}
                      >
                        {count}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
