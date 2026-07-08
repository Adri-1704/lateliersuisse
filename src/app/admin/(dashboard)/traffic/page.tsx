import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { TrafficCharts } from "./TrafficCharts";
import { Users, Eye, TrendingUp, Globe, Activity, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getTrafficStats() {
  const supabase = createAdminClient();

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { count: totalAll } = await supabase
    .from("page_views")
    .select("id", { count: "exact", head: true });

  const { count: totalToday } = await supabase
    .from("page_views")
    .select("id", { count: "exact", head: true })
    .gte("viewed_at", today.toISOString());

  const { count: totalWeek } = await supabase
    .from("page_views")
    .select("id", { count: "exact", head: true })
    .gte("viewed_at", weekAgo.toISOString());

  const { count: totalMonth } = await supabase
    .from("page_views")
    .select("id", { count: "exact", head: true })
    .gte("viewed_at", monthAgo.toISOString());

  const { data: uniqueSessions } = await supabase
    .from("page_views")
    .select("session_id")
    .gte("viewed_at", monthAgo.toISOString())
    .not("session_id", "is", null);
  const uniqueVisitorsMonth = new Set(
    (uniqueSessions as { session_id: string }[] | null)?.map((r) => r.session_id) || []
  ).size;

  const { data: dailyRaw } = await supabase
    .from("page_views")
    .select("viewed_at")
    .gte("viewed_at", monthAgo.toISOString())
    .order("viewed_at", { ascending: true });

  const dailyCounts: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyCounts[key] = 0;
  }
  for (const row of (dailyRaw as { viewed_at: string }[] | null) || []) {
    const key = row.viewed_at.slice(0, 10);
    if (key in dailyCounts) dailyCounts[key]++;
  }
  const dailyChart = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const { data: topPagesRaw } = await supabase
    .from("page_views")
    .select("path")
    .gte("viewed_at", monthAgo.toISOString())
    .limit(5000);
  const pathCounts: Record<string, number> = {};
  for (const row of (topPagesRaw as { path: string }[] | null) || []) {
    pathCounts[row.path] = (pathCounts[row.path] || 0) + 1;
  }
  const topPages = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  const { data: typesRaw } = await supabase
    .from("page_views")
    .select("page_type")
    .gte("viewed_at", monthAgo.toISOString());
  const typeCounts: Record<string, number> = {};
  for (const row of (typesRaw as { page_type: string | null }[] | null) || []) {
    const t = row.page_type || "other";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }
  const pageTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({ type, count }));

  const { data: localesRaw } = await supabase
    .from("page_views")
    .select("locale")
    .gte("viewed_at", monthAgo.toISOString())
    .not("locale", "is", null);
  const localeCounts: Record<string, number> = {};
  for (const row of (localesRaw as { locale: string }[] | null) || []) {
    localeCounts[row.locale] = (localeCounts[row.locale] || 0) + 1;
  }
  const locales = Object.entries(localeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([locale, count]) => ({ locale, count }));

  const { data: countriesRaw } = await supabase
    .from("page_views")
    .select("country")
    .gte("viewed_at", monthAgo.toISOString())
    .not("country", "is", null);
  const countryCounts: Record<string, number> = {};
  for (const row of (countriesRaw as { country: string }[] | null) || []) {
    countryCounts[row.country] = (countryCounts[row.country] || 0) + 1;
  }
  const countries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  const { data: restaurantsRaw } = await supabase
    .from("page_views")
    .select("restaurant_id")
    .gte("viewed_at", monthAgo.toISOString())
    .not("restaurant_id", "is", null);
  const restaurantCounts: Record<string, number> = {};
  for (const row of (restaurantsRaw as { restaurant_id: string }[] | null) || []) {
    restaurantCounts[row.restaurant_id] = (restaurantCounts[row.restaurant_id] || 0) + 1;
  }
  const topRestaurantIds = Object.entries(restaurantCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  let topRestaurants: { id: string; name: string; city: string; count: number }[] = [];
  if (topRestaurantIds.length > 0) {
    const { data: restInfo } = await supabase
      .from("restaurants")
      .select("id, name_fr, city")
      .in("id", topRestaurantIds.map(([id]) => id));
    const infoMap = new Map(
      (restInfo as { id: string; name_fr: string; city: string }[] | null)?.map((r) => [r.id, r]) || []
    );
    topRestaurants = topRestaurantIds.map(([id, count]) => {
      const info = infoMap.get(id);
      return { id, name: info?.name_fr || "Restaurant inconnu", city: info?.city || "", count };
    });
  }

  return {
    totalAll: totalAll ?? 0,
    totalToday: totalToday ?? 0,
    totalWeek: totalWeek ?? 0,
    totalMonth: totalMonth ?? 0,
    uniqueVisitorsMonth,
    dailyChart,
    topPages,
    pageTypes,
    locales,
    countries,
    topRestaurants,
  };
}

export default async function TrafficPage() {
  const stats = await getTrafficStats();
  const noData = stats.totalAll === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Trafic du site</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          Statistiques de visite · Vercel Analytics disponible aussi dans le dashboard Vercel.
        </p>
      </div>

      {noData && (
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center">
          <Activity className="mx-auto mb-2 h-8 w-8 text-amber-500" />
          <h3 className="font-semibold text-amber-900">Aucune donnée pour l&apos;instant</h3>
          <p className="mt-1 text-sm text-amber-800">
            Le tracking vient d&apos;être activé. Les premières visites apparaîtront ici dès que
            des utilisateurs naviguent sur le site.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Vues aujourd'hui", value: stats.totalToday, icon: <Eye className="h-5 w-5 text-indigo-600" />, color: "indigo" },
          { label: "Vues 7 jours", value: stats.totalWeek, icon: <TrendingUp className="h-5 w-5 text-indigo-600" />, color: "indigo" },
          { label: "Vues 30 jours", value: stats.totalMonth, icon: <Activity className="h-5 w-5 text-indigo-600" />, color: "indigo" },
          { label: "Visiteurs uniques 30j", value: stats.uniqueVisitorsMonth, icon: <Users className="h-5 w-5 text-emerald-600" />, color: "emerald" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-[#eaecf0] bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                {kpi.icon}
              </div>
              <p className="text-sm text-gray-500">{kpi.label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {kpi.value.toLocaleString("fr-CH")}
            </p>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Vues par jour (30 derniers jours)</h2>
        <TrafficCharts dailyChart={stats.dailyChart} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top pages */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Pages les plus consultées (30j)</h2>
          {stats.topPages.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune donnée.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topPages.map((p) => (
                <li
                  key={p.path}
                  className="flex items-center justify-between rounded-lg bg-[#f8fafc] px-3 py-2 text-sm"
                >
                  <code className="truncate text-xs text-gray-700">{p.path}</code>
                  <span className="ml-3 font-semibold text-gray-900">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top restaurants */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Top 10 restaurants (30j)</h2>
            <Link
              href="/admin/traffic/restaurants"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
            >
              Voir tous <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {stats.topRestaurants.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucune vue restaurant encore. Utile pour la prospection B2B.
            </p>
          ) : (
            <ul className="space-y-2">
              {stats.topRestaurants.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg bg-[#f8fafc] px-3 py-2 text-sm"
                >
                  <div className="truncate">
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-400">{r.city}</div>
                  </div>
                  <span className="ml-3 font-semibold text-indigo-600">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Page types */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Types de pages (30j)</h2>
          {stats.pageTypes.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune donnée.</p>
          ) : (
            <ul className="space-y-2">
              {stats.pageTypes.map((t) => (
                <li key={t.type} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-gray-700">{t.type}</span>
                  <span className="font-semibold text-gray-900">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Locales */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Langues (30j)</h2>
          {stats.locales.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune donnée.</p>
          ) : (
            <ul className="space-y-2">
              {stats.locales.map((l) => (
                <li key={l.locale} className="flex items-center justify-between text-sm">
                  <span className="uppercase text-gray-700">{l.locale}</span>
                  <span className="font-semibold text-gray-900">{l.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Countries */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
            <Globe className="h-4 w-4" /> Pays (30j)
          </h2>
          {stats.countries.length === 0 ? (
            <p className="text-sm text-gray-400">Données pays disponibles uniquement sur Vercel prod.</p>
          ) : (
            <ul className="space-y-2">
              {stats.countries.map((c) => (
                <li key={c.country} className="flex items-center justify-between text-sm">
                  <span className="uppercase text-gray-700">{c.country}</span>
                  <span className="font-semibold text-gray-900">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#eaecf0] bg-[#f8fafc] p-4 text-sm text-gray-600">
        <p>
          <strong>Pour ton pitch investisseur :</strong> ces données sont privées.
          Prends un screenshot pour l&apos;attacher à tes emails ou présentations.
        </p>
        <p className="mt-2">
          <strong>Dashboard externe :</strong> Vercel Analytics disponible sur{" "}
          <a
            href="https://vercel.com/lateliersuissech-6461s-projects/lateliersuisse/analytics"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 underline"
          >
            vercel.com
          </a>{" "}
          (real-time + sources de trafic détaillées).
        </p>
      </div>
    </div>
  );
}
