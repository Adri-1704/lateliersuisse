import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

interface ClaimBannerProps {
  restaurantName: string;
  restaurantSlug: string;
  locale: string;
}

export function ClaimBanner({ restaurantName, restaurantSlug, locale }: ClaimBannerProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="rounded-xl border border-[var(--color-just-tag)]/20 bg-gradient-to-r from-[var(--color-just-tag-light)] to-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-just-tag)]/10">
            <ShieldCheck className="h-5 w-5 text-[var(--color-just-tag)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm sm:text-base">
              Vous êtes le propriétaire de {restaurantName} ?
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Revendiquez votre fiche gratuitement pour la personnaliser, ajouter vos photos et gérer vos avis.
            </p>
          </div>
          <Link
            href={`/${locale}/partenaire-inscription?restaurant=${restaurantSlug}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-just-tag)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-just-tag-dark)] shrink-0"
          >
            Revendiquer cette fiche
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
