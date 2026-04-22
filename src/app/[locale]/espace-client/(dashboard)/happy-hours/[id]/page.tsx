import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Eye, MousePointerClick } from "lucide-react";
import { getMerchantSession } from "@/actions/merchant/auth";
import { getHappyHourById } from "@/actions/happy-hours";
import { HappyHourForm } from "@/components/merchant/HappyHourForm";
import { HappyHourQrCode } from "@/components/merchant/HappyHourQrCode";

export const dynamic = "force-dynamic";

export default async function EditHappyHourPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await getMerchantSession();
  const restaurant = session?.restaurant;

  if (!restaurant) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-gray-600">
          Aucun restaurant associe a votre compte.
        </p>
      </div>
    );
  }

  const { success, data: hh } = await getHappyHourById(id);
  if (!success || !hh) notFound();

  const basePath = `/${locale}/espace-client/happy-hours`;
  const publicUrl = `/${locale}/restaurants/${restaurant.slug}?utm_source=qr&utm_medium=table&utm_campaign=hh_${hh.id}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={basePath}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux Happy Hours
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Modifier la Happy Hour</h1>
          <p className="text-muted-foreground">{hh.title}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Eye className="h-4 w-4" />
            Vues
          </div>
          <div className="mt-1 text-2xl font-bold">{hh.views_count}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MousePointerClick className="h-4 w-4" />
            Clics
          </div>
          <div className="mt-1 text-2xl font-bold">{hh.clicks_count}</div>
        </div>
      </div>

      <HappyHourQrCode publicUrl={publicUrl} title={hh.title} />

      <HappyHourForm
        restaurantId={restaurant.id}
        existing={hh}
        basePath={basePath}
      />
    </div>
  );
}
