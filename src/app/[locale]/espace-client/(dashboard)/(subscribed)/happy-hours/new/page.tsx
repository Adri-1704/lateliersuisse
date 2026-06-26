import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getMerchantSession } from "@/actions/merchant/auth";
import { HappyHourForm } from "@/components/merchant/HappyHourForm";

export const dynamic = "force-dynamic";

export default async function NewHappyHourPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getMerchantSession();
  const restaurant = session?.restaurant;

  const basePath = `/${locale}/espace-client/happy-hours`;

  if (!restaurant) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-gray-600">
          Aucun restaurant associe a votre compte. Revendiquez ou creez votre
          restaurant avant de creer une Happy Hour.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={basePath}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux Happy Hours
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Nouvelle Happy Hour</h1>
        <p className="text-muted-foreground">
          Remplissez un creneau creux avec une offre flash.
        </p>
      </div>

      <HappyHourForm restaurantId={restaurant.id} basePath={basePath} />
    </div>
  );
}
