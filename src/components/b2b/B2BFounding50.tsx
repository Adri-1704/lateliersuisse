"use client";

import { Sparkles, Crown, Gift, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface B2BFounding50Props {
  spotsRemaining: number;
}

const FOUNDING_LIMIT = 50;

export function B2BFounding50({ spotsRemaining }: B2BFounding50Props) {
  const params = useParams();
  const locale = (params.locale as string) || "fr";

  const soldCount = 100 - spotsRemaining;
  const foundingRemaining = Math.max(0, FOUNDING_LIMIT - soldCount);

  // Hide section if the Founding 50 is full
  if (foundingRemaining <= 0) return null;

  const progressPercent = Math.min(100, (soldCount / FOUNDING_LIMIT) * 100);

  return (
    <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-amber-200 sm:p-12">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white shadow-md">
              <Crown className="h-4 w-4" />
              Offre Founding 50
            </div>
          </div>

          {/* Heading */}
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Devenez l&apos;un des <span className="text-[var(--color-just-tag)]">50 restaurants fondateurs</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">
            Un statut à vie, des avantages exclusifs réservés aux tout premiers partenaires qui
            nous font confiance.
          </p>

          {/* Progress bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
              <span>{soldCount} sur 50 fondateurs</span>
              <span className="font-bold text-orange-600">
                Plus que {foundingRemaining} places
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Bonus */}
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-2xl bg-amber-50 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Gift className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="mt-3 font-bold text-gray-900">100 tote bags offerts</h3>
              <p className="mt-1 text-sm text-gray-600">
                Pour vos clients, logo Just-Tag + le vôtre
              </p>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-amber-50 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Crown className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="mt-3 font-bold text-gray-900">Logo à vie</h3>
              <p className="mt-1 text-sm text-gray-600">
                Sur notre page &quot;Nos fondateurs&quot; en permanence
              </p>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-amber-50 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Users className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="mt-3 font-bold text-gray-900">Onboarding VIP</h3>
              <p className="mt-1 text-sm text-gray-600">
                Je remplis votre fiche moi-même en 15 min (visio)
              </p>
            </div>
          </div>

          {/* Price reminder */}
          <div className="mt-10 rounded-2xl bg-gray-900 p-6 text-center text-white">
            <p className="text-sm uppercase tracking-widest text-gray-400">
              Tarif verrouillé à vie
            </p>
            <div className="mt-2 flex items-baseline justify-center gap-3">
              <span className="text-5xl font-bold">24.90</span>
              <span className="text-gray-400">
                <span className="line-through">41.60</span> CHF/mois
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-300">
              Économie de 200 CHF/an · Plan annuel Early Bird
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8 flex justify-center">
            <Link
              href={`/${locale}/partenaire-inscription?plan=annual_early&founding=1`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              <Sparkles className="h-5 w-5" />
              Devenir l&apos;un des 50 fondateurs
            </Link>
          </div>
          <p className="mt-3 text-center text-xs text-gray-500">
            14 jours d&apos;essai gratuit · Sans carte bancaire · Annulation en 1 clic
          </p>
        </div>
      </div>
    </section>
  );
}
