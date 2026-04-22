import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="rounded-xl border border-dashed p-8 text-center">
        <Sparkles className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900">
          Aucun restaurant associe
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Reclamez ou creez d&apos;abord votre restaurant pour gerer vos Happy Hours.
        </p>
      </div>
    );
  }

  const { data: happyHours } = await getMerchantHappyHours(restaurant.id);
  const list = happyHours || [];

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const active = list.filter(
    (h) => new Date(h.starts_at).getTime() <= now && new Date(h.ends_at).getTime() > now,
  );
  const upcoming = list.filter((h) => new Date(h.starts_at).getTime() > now);
  const past = list.filter((h) => new Date(h.ends_at).getTime() <= now);

  const basePath = `/${locale}/espace-client/happy-hours`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Happy Hours</h1>
          <p className="text-muted-foreground">
            Creez des offres flash pour remplir vos creneaux creux.
          </p>
        </div>
        <Link href={`${basePath}/new`}>
          <Button className="bg-rose-500 hover:bg-rose-600">
            <Plus className="mr-2 h-4 w-4" />
            Creer une Happy Hour
          </Button>
        </Link>
      </div>

      {list.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="text-base font-semibold">Aucune Happy Hour</h3>
          <p className="mt-1 text-sm text-gray-500">
            Lancez votre premiere offre flash pour remplir vos creneaux creux
            (mardi midi, mercredi soir, etc.).
          </p>
          <Link href={`${basePath}/new`}>
            <Button className="mt-4 bg-rose-500 hover:bg-rose-600">
              <Plus className="mr-2 h-4 w-4" />
              Creer ma premiere Happy Hour
            </Button>
          </Link>
        </div>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-rose-600 mb-3">
            En cours
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((hh) => (
              <HappyHourListCard key={hh.id} hh={hh} locale={locale} basePath={basePath} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-3">
            A venir
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((hh) => (
              <HappyHourListCard key={hh.id} hh={hh} locale={locale} basePath={basePath} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-3">
            Passees
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {past.slice(0, 10).map((hh) => (
              <HappyHourListCard
                key={hh.id}
                hh={hh}
                locale={locale}
                basePath={basePath}
                dimmed
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
