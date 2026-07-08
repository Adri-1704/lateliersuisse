import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { getMerchantSession } from "@/actions/merchant/auth";
import { getMerchantHappyHours } from "@/actions/happy-hours";
import { HappyHourListCard } from "@/components/merchant/HappyHourListCard";

export const dynamic = "force-dynamic";

export default async function MerchantHappyHoursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getMerchantSession();
  const restaurant = session?.restaurant;

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center bg-white" style={{ border: "1.5px solid #eaecf0" }}>
        <span className="text-5xl">🍹</span>
        <h2 className="mt-4 text-lg font-bold text-gray-800">Aucun restaurant associé</h2>
        <p className="mt-2 text-sm text-gray-400 max-w-xs">
          Réclamez ou créez d&apos;abord votre restaurant pour gérer vos Happy Hours.
        </p>
      </div>
    );
  }

  const { data: happyHours } = await getMerchantHappyHours(restaurant.id);
  const list = happyHours || [];

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const active = list.filter((h) => new Date(h.starts_at).getTime() <= now && new Date(h.ends_at).getTime() > now);
  const upcoming = list.filter((h) => new Date(h.starts_at).getTime() > now);
  const past = list.filter((h) => new Date(h.ends_at).getTime() <= now);

  const basePath = `/${locale}/espace-client/happy-hours`;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Happy Hours</h1>
            <p className="text-[13px] text-gray-400">Créez des offres flash pour remplir vos créneaux creux.</p>
          </div>
        </div>
        <Link
          href={`${basePath}/new`}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
        >
          <Plus className="h-4 w-4" />
          Créer une Happy Hour
        </Link>
      </div>

      {list.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center bg-white" style={{ border: "2px dashed #fed7aa" }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}>
            <Sparkles className="h-7 w-7" style={{ color: "#f97316" }} />
          </div>
          <h3 className="text-base font-bold text-gray-800">Aucune Happy Hour</h3>
          <p className="mt-1 text-sm text-gray-400 max-w-sm">
            Lancez votre première offre flash pour remplir vos créneaux creux (mardi midi, mercredi soir, etc.).
          </p>
          <Link
            href={`${basePath}/new`}
            className="mt-5 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
          >
            <Plus className="h-4 w-4" />
            Créer ma première Happy Hour
          </Link>
        </div>
      )}

      {active.length > 0 && (
        <section>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#f97316" }}>
            🟢 En cours
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((hh) => (
              <HappyHourListCard key={hh.id} hh={hh} locale={locale} basePath={basePath} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            🕐 À venir
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((hh) => (
              <HappyHourListCard key={hh.id} hh={hh} locale={locale} basePath={basePath} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Passées
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {past.slice(0, 10).map((hh) => (
              <HappyHourListCard key={hh.id} hh={hh} locale={locale} basePath={basePath} dimmed />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
