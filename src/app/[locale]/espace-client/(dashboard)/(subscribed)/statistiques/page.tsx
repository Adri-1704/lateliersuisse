import { getMerchantSession } from "@/actions/merchant/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { Eye, TrendingUp, Calendar, Globe, BarChart3 } from "lucide-react";

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

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct",
  google: "Google",
  instagram: "Instagram",
  facebook: "Facebook",
  qr: "QR Code",
};

export default async function StatistiquesPage() {
  const session = await getMerchantSession();
  const restaurant = session?.restaurant;

  if (!restaurant) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Statistiques</h1>
        <p className="text-gray-500">Vous devez d&apos;abord créer votre fiche restaurant.</p>
      </div>
    );
  }

  const views = await getRestaurantViews(restaurant.id);

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

  const sources: Record<string, number> = {};
  views.forEach(v => {
    const src = v.source || "direct";
    sources[src] = (sources[src] || 0) + 1;
  });
  const topSources = Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const dailyViews: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    dailyViews[d.toISOString().slice(0, 10)] = 0;
  }
  views.forEach(v => {
    const key = new Date(v.viewed_at).toISOString().slice(0, 10);
    if (key in dailyViews) dailyViews[key]++;
  });
  const maxDaily = Math.max(...Object.values(dailyViews), 1);
  const sortedDays = Object.entries(dailyViews).sort((a, b) => a[0].localeCompare(b[0]));
  const trend = todayViews >= yesterdayViews ? "↗" : "↘";

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)" }}>
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Statistiques</h1>
          <p className="text-[13px] text-gray-400">Vues de votre fiche {restaurant.name_fr}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aujourd'hui"
          value={todayViews}
          sub={`${trend} hier : ${yesterdayViews}`}
          icon={<Eye className="h-5 w-5" style={{ color: "#3b82f6" }} />}
          gradient="linear-gradient(135deg, #eff6ff, #dbeafe)"
          color="#3b82f6"
        />
        <StatCard
          label="7 derniers jours"
          value={last7DaysViews}
          sub="cette semaine"
          icon={<TrendingUp className="h-5 w-5" style={{ color: "#10b981" }} />}
          gradient="linear-gradient(135deg, #f0fdf4, #dcfce7)"
          color="#10b981"
        />
        <StatCard
          label="30 derniers jours"
          value={last30DaysViews}
          sub="ce mois-ci"
          icon={<Calendar className="h-5 w-5" style={{ color: "#f97316" }} />}
          gradient="linear-gradient(135deg, #fff7ed, #ffedd5)"
          color="#f97316"
        />
        <StatCard
          label="Total"
          value={totalViews}
          sub="depuis le lancement"
          icon={<Globe className="h-5 w-5" style={{ color: "#8b5cf6" }} />}
          gradient="linear-gradient(135deg, #f5f3ff, #ede9fe)"
          color="#8b5cf6"
        />
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Vues des 30 derniers jours</h2>
          {totalViews > 0 && (
            <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: "#eff6ff", color: "#3b82f6" }}>
              {last30DaysViews} vues
            </span>
          )}
        </div>

        {totalViews === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl">📊</span>
            <p className="mt-4 font-semibold text-gray-700">Aucune visite encore</p>
            <p className="mt-1 text-sm text-gray-400">Les vues apparaîtront ici dès que des clients consulteront votre fiche</p>
          </div>
        ) : (
          <div className="flex items-end gap-[3px]" style={{ height: 160 }}>
            {sortedDays.map(([date, count]) => {
              const heightPct = (count / maxDaily) * 100;
              const isToday = date === today.toISOString().slice(0, 10);
              const label = new Date(date).toLocaleDateString("fr-CH", { day: "numeric", month: "short" });
              return (
                <div key={date} className="group relative flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max(heightPct, count > 0 ? 4 : 1)}%`,
                      background: isToday
                        ? "linear-gradient(180deg, #3b82f6, #60a5fa)"
                        : count > 0
                        ? "linear-gradient(180deg, #93c5fd, #bfdbfe)"
                        : "#f1f5f9",
                      minHeight: 2,
                    }}
                    title={`${label} : ${count} vue${count !== 1 ? "s" : ""}`}
                  />
                  {/* Tooltip on hover */}
                  {count > 0 && (
                    <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-lg px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block" style={{ background: "#1e293b", whiteSpace: "nowrap" }}>
                      {count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sources */}
      {topSources.length > 0 && (
        <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
          <h2 className="mb-4 font-bold text-gray-900">Sources de trafic</h2>
          <div className="space-y-3">
            {topSources.map(([source, count], i) => {
              const pct = Math.round((count / totalViews) * 100);
              const colors = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ec4899"];
              const color = colors[i % colors.length];
              return (
                <div key={source} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[13px] font-semibold text-gray-700 truncate">
                    {SOURCE_LABELS[source] || source}
                  </span>
                  <div className="relative flex-1 h-6 overflow-hidden rounded-full" style={{ background: "#f1f5f9" }}>
                    <div
                      className="absolute inset-y-0 left-0 flex items-center justify-end rounded-full pr-2 text-[11px] font-bold text-white"
                      style={{ width: `${Math.max(pct, 8)}%`, background: color, minWidth: 28 }}
                    >
                      {count}
                    </div>
                  </div>
                  <span className="w-10 shrink-0 text-right text-[12px] font-bold" style={{ color }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, icon, gradient, color }: {
  label: string; value: number; sub: string;
  icon: React.ReactNode; gradient: string; color: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: gradient, border: `1.5px solid ${color}22` }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
        {icon}
      </div>
      <p className="mt-3 text-4xl font-black tracking-tight" style={{ color: "#0f1117" }}>{value}</p>
      <p className="mt-0.5 text-[12px]" style={{ color: `${color}cc` }}>{sub}</p>
    </div>
  );
}
