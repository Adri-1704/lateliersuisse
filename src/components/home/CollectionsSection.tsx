"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { collections } from "@/data/collections";

export function CollectionsSection() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {locale === "de" ? "Unsere Ambianzen" : locale === "en" ? "Our ambiances" : locale === "pt" ? "Nossos ambientes" : locale === "es" ? "Nuestros ambientes" : "Nos ambiances"}
            </h2>
            <p className="mt-2 text-gray-600">
              {locale === "de" ? "Entdecken Sie unsere kuratierten Auswahlen" : locale === "en" ? "Discover our curated selections" : locale === "pt" ? "Descubra as nossas seleções" : locale === "es" ? "Descubra nuestras selecciones" : "Decouvrez nos selections thematiques"}
            </p>
          </div>
          <Link
            href={`/${locale}/collections`}
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--color-just-tag)] hover:underline"
          >
            {locale === "de" ? "Alle sehen" : locale === "en" ? "See all" : locale === "pt" ? "Ver todas" : locale === "es" ? "Ver todas" : "Voir toutes"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.slice(0, 6).map((collection) => {
            const title = locale === "de" ? collection.titleDe : locale === "en" ? collection.titleEn : locale === "pt" ? collection.titlePt : locale === "es" ? collection.titleEs : collection.titleFr;
            const desc = locale === "de" ? collection.descriptionDe : locale === "en" ? collection.descriptionEn : locale === "pt" ? collection.descriptionPt : locale === "es" ? collection.descriptionEs : collection.descriptionFr;
            return (
              <Link
                key={collection.slug}
                href={`/${locale}/collections/${collection.slug}`}
                className="group flex flex-col rounded-xl border bg-white p-5 transition-all hover:shadow-md hover:-translate-y-1"
              >
                <span className="text-4xl leading-none" aria-hidden="true">{collection.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
