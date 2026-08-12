"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * 404 pour toute route non résolue à l'intérieur d'un préfixe de locale
 * valide (/fr/..., /de/..., etc.) — ex. /fr/blog/slug-inexistant ou
 * /fr/collections/slug-inexistant.
 *
 * Rendu à l'intérieur de [locale]/layout.tsx, cette page hérite donc
 * automatiquement du <Header>/<Footer> (via PublicLayoutWrapper) et du
 * NextIntlClientProvider déjà configurés pour la locale courante — corrige
 * le 404 "nu" (sans navigation) et systématiquement en français quelle que
 * soit la locale (#40).
 *
 * `not-found.tsx` ne reçoit pas les `params` de route dans l'App Router :
 * on récupère donc la locale via `useParams()`, comme le fait déjà
 * `Header.tsx`.
 */
export default function LocaleNotFound() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const t = useTranslations("notFoundPage");

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-600">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="16" y="6" width="8" height="28" rx="1" fill="white" />
            <rect x="6" y="16" width="28" height="8" rx="1" fill="white" />
          </svg>
        </div>

        <h1 className="mb-4 text-6xl font-bold text-gray-900">{t("code")}</h1>
        <h2 className="mb-3 text-xl font-semibold text-gray-700">{t("title")}</h2>
        <p className="mb-8 leading-relaxed text-gray-500">{t("description")}</p>

        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
