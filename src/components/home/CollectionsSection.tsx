"use client";

import Link from "next/link";
import Image from "next/image";
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
              {locale === "de" ? "Unsere Kollektionen" : locale === "en" ? "Our collections" : locale === "pt" ? "Nossas coleções" : locale === "es" ? "Nuestras colecciones" : "Nos collections"}
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
                className="group relative overflow-hidden rounded-xl"
              >
                <div className="relative h-48">
                  <Image
                    src={collection.coverImage}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="text-2xl">{collection.icon}</span>
                    <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
                    <p className="mt-0.5 text-sm text-white/80 line-clamp-1">{desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
