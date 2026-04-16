import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExternalLink, Eye, TrendingUp, ArrowUpDown } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SearchParams {
  q?: string;
  sort?: string;
  period?: string;
  page?: string;
  canton?: string;
}

interface RestaurantRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  canton: string;
  viewsTotal: number;
  viewsMonth: number;
  viewsWeek: number;
  viewsToday: number;
  isPublished: boolean;
}

async function loadRestaurantTraffic(
  query: string,
  sort: string,
  canton: string | undefined,
  page: number,
  pageSize = 50
): Promise<{ rows: RestaurantRow[]; totalCount: number; grandTotals: { today: number; week: number; month: number; all: number } }> {
  const supabase = createAdminClient();

  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const viewSort = sort === "views_month" || sort === "views_week" || sort === "views_today" || sort === "views_all";

  // Grand totals
  const [{ count: totalToday }, { count: totalWeek }, { count: totalMonth }, { count: totalAll }] = await Promise.all([
    supabase.from("page_views").select("id", { count: "exact", head: true }).gte("viewed_at", today.toISOString()).not("restaurant_id", "is", null),
    supabase.from("page_views").select("id", { count: "exact", head: true }).gte("viewed_at", weekAgo.toISOString()).not("restaurant_id", "is", null),
    supabase.from("page_views").select("id", { count: "exact", head: true }).gte("viewed_at", monthAgo.toISOString()).not("restaurant_id", "is", null),
    supabase.from("page_views").select("id", { count: "exact", head: true }).not("restaurant_id", "is", null),
  ]);

  if (viewSort) {
    // Strategy: get ALL page_views with restaurant_id, count per restaurant, sort, then fetch restaurant details
    const { data: allViews } = await supabase
      .from("page_views")
      .select("restaurant_id, viewed_at")
      .not("restaurant_id", "is", null)
      .limit(50000) as { data: { restaurant_id: string; viewed_at: string }[] | null };

    // Count views per restaurant by period
    const viewMap = new Map<string, { today: number; week: number; month: number; all: number }>();
    for (const v of allViews || []) {
      let stats = viewMap.get(v.restaurant_id);
      if (!stats) { stats = { today: 0, week: 0, month: 0, all: 0 }; viewMap.set(v.restaurant_id, stats); }
      const vDate = new Date(v.viewed_at);
      stats.all++;
      if (vDate >= monthAgo) stats.month++;
      if (vDate >= weekAgo) stats.week++;
      if (vDate >= today) stats.today++;
    }

    // Sort restaurant IDs by the requested period
    const sortKey = sort === "views_month" ? "month" : sort === "views_week" ? "week" : sort === "views_today" ? "today" : "all";
    const sorted = Array.from(viewMap.entries())
      .sort(([, a], [, b]) => b[sortKey] - a[sortKey]);

    // Paginate the sorted list
    const from = (page - 1) * pageSize;
    const pageIds = sorted.slice(from, from + pageSize).map(([id]) => id);

    // Fetch restaurant details for this page
    let rows: RestaurantRow[] = [];
    if (pageIds.length > 0) {
      const { data: restos } = await supabase
        .from("restaurants")
        .select("id, slug, name_fr, city, canton, is_published")
        .in("id", pageIds) as { data: { id: string; slug: string; name_fr: string; city: string; canton: string; is_published: boolean }[] | null };

      // Apply optional filters (query, canton) and merge with views
      const restoMap = new Map((restos || []).map((r) => [r.id, r]));
      rows = pageIds
        .filter((id) => restoMap.has(id))
        .map((id) => {
          const r = restoMap.get(id)!;
          const s = viewMap.get(id) || { today: 0, week: 0, month: 0, all: 0 };
          return {
            id: r.id, slug: r.slug, name: r.name_fr, city: r.city || "", canton: r.canton || "",
            viewsTotal: s.all, viewsMonth: s.month, viewsWeek: s.week, viewsToday: s.today, isPublished: r.is_published,
          };
        })
        .filter((r) => {
          if (canton && r.canton !== canton) return false;
          if (query) {
            const q = query.toLowerCase();
            return r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q);
          }
          return true;
        });
    }

    // Total count = restaurants with views (for pagination)
    const filteredTotal = query || canton
      ? rows.length // approximate when filtered
      : sorted.length;

    return { rows, totalCount: filteredTotal, grandTotals: { today: totalToday ?? 0, week: totalWeek ?? 0, month: totalMonth ?? 0, all: totalAll ?? 0 } };

  } else {
    // Name sort: simple DB pagination
    let restaurantQuery = supabase
      .from("restaurants")
      .select("id, slug, name_fr, city, canton, is_published", { count: "exact" });

    if (query && query.trim().length > 0) {
      const term = query.trim();
      restaurantQuery = restaurantQuery.or(`name_fr.ilike.%${term}%,city.ilike.%${term}%,slug.ilike.%${term}%`);
    }
    if (canton) restaurantQuery = restaurantQuery.eq("canton", canton);

    restaurantQuery = restaurantQuery.order("name_fr", { ascending: true });
    const offset = (page - 1) * pageSize;
    restaurantQuery = restaurantQuery.range(offset, offset + pageSize - 1);

    const { data: restaurants, count } = await restaurantQuery as {
      data: { id: string; slug: string; name_fr: string; city: string; canton: string; is_published: boolean }[] | null;
      count: number | null;
    };

    if (!restaurants) return { rows: [], totalCount: 0, grandTotals: { today: totalToday ?? 0, week: totalWeek ?? 0, month: totalMonth ?? 0, all: totalAll ?? 0 } };

    // Fetch views for these restaurants
    const ids = restaurants.map((r) => r.id);
    const { data: viewsRaw } = await supabase
      .from("page_views")
      .select("restaurant_id, viewed_at")
      .in("restaurant_id", ids) as { data: { restaurant_id: string; viewed_at: string }[] | null };

    const viewMap = new Map<string, { today: number; week: number; month: number; all: number }>();
    for (const id of ids) viewMap.set(id, { today: 0, week: 0, month: 0, all: 0 });
    for (const v of viewsRaw || []) {
      const stats = viewMap.get(v.restaurant_id);
      if (!stats) continue;
      const vDate = new Date(v.viewed_at);
      stats.all++;
      if (vDate >= monthAgo) stats.month++;
      if (vDate >= weekAgo) stats.week++;
      if (vDate >= today) stats.today++;
    }

    const rows = restaurants.map((r) => {
      const s = viewMap.get(r.id) || { today: 0, week: 0, month: 0, all: 0 };
      return {
        id: r.id, slug: r.slug, name: r.name_fr, city: r.city || "", canton: r.canton || "",
        viewsTotal: s.all, viewsMonth: s.month, viewsWeek: s.week, viewsToday: s.today, isPublished: r.is_published,
      };
    });

    return { rows, totalCount: count ?? 0, grandTotals: { today: totalToday ?? 0, week: totalWeek ?? 0, month: totalMonth ?? 0, all: totalAll ?? 0 } };
  }
}

export default async function RestaurantsTrafficPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const query = sp.q || "";
  const sort = sp.sort || "views_month";
  const canton = sp.canton || "";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const pageSize = 50;

  const { rows, totalCount, grandTotals } = await loadRestaurantTraffic(query, sort, canton || undefined, page, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const cantons = [
    { value: "", label: "Tous" },
    { value: "geneve", label: "Genève" },
    { value: "vaud", label: "Vaud" },
    { value: "valais", label: "Valais" },
    { value: "fribourg", label: "Fribourg" },
    { value: "neuchatel", label: "Neuchâtel" },
    { value: "jura", label: "Jura" },
    { value: "berne", label: "Berne" },
  ];

  const sortOptions = [
    { value: "views_month", label: "Vues 30j ↓" },
    { value: "views_week", label: "Vues 7j ↓" },
    { value: "views_today", label: "Vues aujourd'hui ↓" },
    { value: "views_all", label: "Total ↓" },
    { value: "name", label: "Nom A-Z" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trafic par restaurant</h1>
          <p className="mt-1 text-gray-600">
            Vues de chaque fiche restaurant. Idéal pour la prospection : &ldquo;ton resto a eu X vues&rdquo;.
          </p>
        </div>
        <Link
          href="/admin/traffic"
          className="text-sm font-medium text-[var(--color-just-tag)] hover:underline"
        >
          ← Vue d&apos;ensemble
        </Link>
      </div>

      {/* Grand totals */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <Eye className="h-4 w-4" /> Aujourd&apos;hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{grandTotals.today.toLocaleString("fr-CH")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <Eye className="h-4 w-4" /> 7 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{grandTotals.week.toLocaleString("fr-CH")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <TrendingUp className="h-4 w-4" /> 30 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--color-just-tag)]">{grandTotals.month.toLocaleString("fr-CH")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <ArrowUpDown className="h-4 w-4" /> Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{grandTotals.all.toLocaleString("fr-CH")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form method="GET" className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Recherche</label>
              <Input
                name="q"
                defaultValue={query}
                placeholder="Nom, ville ou slug..."
                className="bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Canton</label>
              <select
                name="canton"
                defaultValue={canton}
                data-autosubmit
                className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              >
                {cantons.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Tri</label>
              <select
                name="sort"
                defaultValue={sort}
                data-autosubmit
                className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-md bg-[var(--color-just-tag)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Filtrer
              </button>
              <span className="text-xs text-gray-400">Le tri et le canton s&apos;appliquent automatiquement.</span>
            </div>
            <script dangerouslySetInnerHTML={{ __html: `document.querySelectorAll('[data-autosubmit]').forEach(function(s){s.addEventListener('change',function(){s.form.submit()})})` }} />
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {totalCount.toLocaleString("fr-CH")} restaurants
            {query ? ` pour &ldquo;${query}&rdquo;` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Restaurant</th>
                  <th className="px-4 py-3">Canton</th>
                  <th className="px-4 py-3 text-right">Aujourd&apos;hui</th>
                  <th className="px-4 py-3 text-right">7j</th>
                  <th className="px-4 py-3 text-right">30j</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Lien</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Aucun restaurant trouvé.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-500">
                          {r.city} {!r.isPublished && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">brouillon</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{r.canton}</td>
                      <td className="px-4 py-3 text-right font-mono">{r.viewsToday || "—"}</td>
                      <td className="px-4 py-3 text-right font-mono">{r.viewsWeek || "—"}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                        {r.viewsMonth || "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-[var(--color-just-tag)]">
                        {r.viewsTotal || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/fr/restaurants/${r.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[var(--color-just-tag)]"
                        >
                          <ExternalLink className="h-3 w-3" /> Voir
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page} / {totalPages} · {totalCount.toLocaleString("fr-CH")} restaurants
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?q=${encodeURIComponent(query)}&sort=${sort}&canton=${canton}&page=${page - 1}`}
                className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                ← Précédent
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`?q=${encodeURIComponent(query)}&sort=${sort}&canton=${canton}&page=${page + 1}`}
                className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Suivant →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        <p>
          <strong>💡 Usage prospection B2B :</strong> trie par &ldquo;Vues 30j ↓&rdquo;, prends les 10 premiers restos non-inscrits,
          appelle-les avec l&apos;argument &ldquo;votre fiche a été consultée X fois ce mois&rdquo;.
        </p>
      </div>
    </div>
  );
}
