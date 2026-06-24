import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExternalLink, Eye, ArrowUpDown } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PeriodKey = "1d" | "7d" | "30d" | "90d" | "365d" | "all" | "custom";

interface SearchParams {
  q?: string;
  sort?: string;
  period?: string;
  from?: string;
  to?: string;
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
  viewsPeriod: number;
  isPublished: boolean;
}

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "1d", label: "24 heures" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "365d", label: "12 mois" },
  { value: "all", label: "Tout" },
  { value: "custom", label: "Personnalisé" },
];

function resolvePeriod(period: PeriodKey, from?: string, to?: string): { start: Date; end: Date; label: string } {
  const now = new Date();
  if (period === "custom") {
    const start = from ? new Date(from + "T00:00:00") : new Date(now.getTime() - 30 * 86400000);
    const end = to ? new Date(to + "T23:59:59") : now;
    return { start, end, label: `${from || "?"} → ${to || "?"}` };
  }
  if (period === "all") return { start: new Date(0), end: now, label: "Tout" };
  const days = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
  return { start: new Date(now.getTime() - days * 86400000), end: now, label: PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "" };
}

async function loadRestaurantTraffic(
  query: string,
  sort: string,
  canton: string | undefined,
  periodStart: Date,
  periodEnd: Date,
  page: number,
  pageSize = 50
): Promise<{ rows: RestaurantRow[]; totalCount: number; grandTotals: { period: number; all: number } }> {
  const supabase = createAdminClient();

  const [{ count: totalPeriod }, { count: totalAll }] = await Promise.all([
    supabase
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .gte("viewed_at", periodStart.toISOString())
      .lte("viewed_at", periodEnd.toISOString())
      .not("restaurant_id", "is", null),
    supabase
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .not("restaurant_id", "is", null),
  ]);

  const viewSort = sort === "views_period" || sort === "views_all";

  if (viewSort) {
    const { data: allViews } = await supabase
      .from("page_views")
      .select("restaurant_id, viewed_at")
      .not("restaurant_id", "is", null)
      .limit(50000) as { data: { restaurant_id: string; viewed_at: string }[] | null };

    const viewMap = new Map<string, { period: number; all: number }>();
    for (const v of allViews || []) {
      let stats = viewMap.get(v.restaurant_id);
      if (!stats) { stats = { period: 0, all: 0 }; viewMap.set(v.restaurant_id, stats); }
      const vDate = new Date(v.viewed_at);
      stats.all++;
      if (vDate >= periodStart && vDate <= periodEnd) stats.period++;
    }

    const sortKey = sort === "views_all" ? "all" : "period";
    const viewedIds = Array.from(viewMap.entries())
      .sort(([, a], [, b]) => b[sortKey] - a[sortKey])
      .map(([id]) => id);

    let countQuery = supabase.from("restaurants").select("id", { count: "exact", head: true });
    if (query) countQuery = countQuery.or(`name_fr.ilike.%${query}%,city.ilike.%${query}%,slug.ilike.%${query}%`);
    if (canton) countQuery = countQuery.eq("canton", canton);
    const { count: totalRestaurants } = await countQuery;

    const from = (page - 1) * pageSize;
    let rows: RestaurantRow[] = [];

    if (from < viewedIds.length) {
      const idsForPage = viewedIds.slice(from, from + pageSize);

      const { data: restos } = await supabase
        .from("restaurants")
        .select("id, slug, name_fr, city, canton, is_published")
        .in("id", idsForPage) as { data: { id: string; slug: string; name_fr: string; city: string; canton: string; is_published: boolean }[] | null };

      const restoMap = new Map((restos || []).map((r) => [r.id, r]));
      const viewedRows = idsForPage
        .filter((id) => restoMap.has(id))
        .map((id) => {
          const r = restoMap.get(id)!;
          const s = viewMap.get(id) || { period: 0, all: 0 };
          return {
            id: r.id, slug: r.slug, name: r.name_fr, city: r.city || "", canton: r.canton || "",
            viewsTotal: s.all, viewsPeriod: s.period, isPublished: r.is_published,
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

      rows = viewedRows;

      const remaining = pageSize - rows.length;
      if (remaining > 0) {
        let fillQuery = supabase
          .from("restaurants")
          .select("id, slug, name_fr, city, canton, is_published")
          .order("name_fr", { ascending: true })
          .limit(remaining);
        if (query) fillQuery = fillQuery.or(`name_fr.ilike.%${query}%,city.ilike.%${query}%,slug.ilike.%${query}%`);
        if (canton) fillQuery = fillQuery.eq("canton", canton);
        if (viewedIds.length > 0 && viewedIds.length <= 100) {
          fillQuery = fillQuery.not("id", "in", `(${viewedIds.join(",")})`);
        }
        const { data: fillRestos } = await fillQuery as { data: typeof restos };
        for (const r of fillRestos || []) {
          rows.push({
            id: r.id, slug: r.slug, name: r.name_fr, city: r.city || "", canton: r.canton || "",
            viewsTotal: 0, viewsPeriod: 0, isPublished: r.is_published,
          });
        }
      }
    } else {
      const zeroViewOffset = from - viewedIds.length;
      let fillQuery = supabase
        .from("restaurants")
        .select("id, slug, name_fr, city, canton, is_published")
        .order("name_fr", { ascending: true })
        .range(zeroViewOffset, zeroViewOffset + pageSize - 1);
      if (query) fillQuery = fillQuery.or(`name_fr.ilike.%${query}%,city.ilike.%${query}%,slug.ilike.%${query}%`);
      if (canton) fillQuery = fillQuery.eq("canton", canton);
      if (viewedIds.length > 0 && viewedIds.length <= 100) {
        fillQuery = fillQuery.not("id", "in", `(${viewedIds.join(",")})`);
      }
      const { data: fillRestos } = await fillQuery as { data: { id: string; slug: string; name_fr: string; city: string; canton: string; is_published: boolean }[] | null };
      rows = (fillRestos || []).map((r) => ({
        id: r.id, slug: r.slug, name: r.name_fr, city: r.city || "", canton: r.canton || "",
        viewsTotal: 0, viewsPeriod: 0, isPublished: r.is_published,
      }));
    }

    return { rows, totalCount: totalRestaurants ?? 0, grandTotals: { period: totalPeriod ?? 0, all: totalAll ?? 0 } };

  } else {
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

    if (!restaurants) return { rows: [], totalCount: 0, grandTotals: { period: totalPeriod ?? 0, all: totalAll ?? 0 } };

    const ids = restaurants.map((r) => r.id);
    const { data: viewsRaw } = await supabase
      .from("page_views")
      .select("restaurant_id, viewed_at")
      .in("restaurant_id", ids) as { data: { restaurant_id: string; viewed_at: string }[] | null };

    const viewMap = new Map<string, { period: number; all: number }>();
    for (const id of ids) viewMap.set(id, { period: 0, all: 0 });
    for (const v of viewsRaw || []) {
      const stats = viewMap.get(v.restaurant_id);
      if (!stats) continue;
      const vDate = new Date(v.viewed_at);
      stats.all++;
      if (vDate >= periodStart && vDate <= periodEnd) stats.period++;
    }

    const rows = restaurants.map((r) => {
      const s = viewMap.get(r.id) || { period: 0, all: 0 };
      return {
        id: r.id, slug: r.slug, name: r.name_fr, city: r.city || "", canton: r.canton || "",
        viewsTotal: s.all, viewsPeriod: s.period, isPublished: r.is_published,
      };
    });

    return { rows, totalCount: count ?? 0, grandTotals: { period: totalPeriod ?? 0, all: totalAll ?? 0 } };
  }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function RestaurantsTrafficPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const query = sp.q || "";
  const sort = sp.sort || "views_period";
  const canton = sp.canton || "";
  const periodKey = (sp.period || "30d") as PeriodKey;
  const fromParam = sp.from || "";
  const toParam = sp.to || "";
  const pageNum = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const pageSize = 50;

  const { start: periodStart, end: periodEnd, label: periodLabel } = resolvePeriod(periodKey, fromParam, toParam);
  const { rows, totalCount, grandTotals } = await loadRestaurantTraffic(query, sort, canton || undefined, periodStart, periodEnd, pageNum, pageSize);
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
    { value: "views_period", label: "Vues période ↓" },
    { value: "views_all", label: "Total ↓" },
    { value: "name", label: "Nom A-Z" },
  ];

  // Defaults pour les inputs date custom (30 derniers jours si rien)
  const customFromDefault = fromParam || isoDate(new Date(Date.now() - 30 * 86400000));
  const customToDefault = toParam || isoDate(new Date());

  // Préserver les params dans la pagination
  const buildPageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (query) qs.set("q", query);
    if (sort) qs.set("sort", sort);
    if (canton) qs.set("canton", canton);
    if (periodKey) qs.set("period", periodKey);
    if (periodKey === "custom") {
      if (fromParam) qs.set("from", fromParam);
      if (toParam) qs.set("to", toParam);
    }
    qs.set("page", String(p));
    return `?${qs.toString()}`;
  };

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

      {/* Grand totals : 2 cards (période + total) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <Eye className="h-4 w-4" /> Vues sur la période · {periodLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[var(--color-just-tag)]">{grandTotals.period.toLocaleString("fr-CH")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <ArrowUpDown className="h-4 w-4" /> Total (depuis le début)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{grandTotals.all.toLocaleString("fr-CH")}</p>
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
              <label className="mb-1 block text-xs font-medium text-gray-600">Période</label>
              <select
                name="period"
                defaultValue={periodKey}
                data-autosubmit
                className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
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

            {/* Date pickers : visibles uniquement si period=custom */}
            {periodKey === "custom" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Du</label>
                  <input
                    type="date"
                    name="from"
                    defaultValue={customFromDefault}
                    className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Au</label>
                  <input
                    type="date"
                    name="to"
                    defaultValue={customToDefault}
                    className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="hidden sm:col-span-2 sm:block" />
              </>
            )}

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
              <span className="text-xs text-gray-400">
                {periodKey === "custom"
                  ? "Clique sur Filtrer après avoir choisi les dates."
                  : "La période, le canton et le tri s'appliquent automatiquement."}
              </span>
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
            {query ? ` pour « ${query} »` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Restaurant</th>
                  <th className="px-4 py-3">Canton</th>
                  <th className="px-4 py-3 text-right">Vues période</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Lien</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
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
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[var(--color-just-tag)]">
                        {r.viewsPeriod || "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
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
            Page {pageNum} / {totalPages} · {totalCount.toLocaleString("fr-CH")} restaurants
          </p>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link
                href={buildPageHref(pageNum - 1)}
                className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                ← Précédent
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={buildPageHref(pageNum + 1)}
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
          <strong>💡 Usage prospection B2B :</strong> choisis la période qui parle au resto (30j ou 90j),
          trie par &ldquo;Vues période ↓&rdquo; et appelle les non-inscrits avec &ldquo;votre fiche a été consultée X fois&rdquo;.
        </p>
      </div>
    </div>
  );
}
