import Link from "next/link";
import Image from "next/image";
import { collections, type Collection } from "@/data/collections";

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">
        {locale === "de" ? "Kollektionen" : locale === "en" ? "Collections" : locale === "pt" ? "Coleções" : locale === "es" ? "Colecciones" : "Collections"}
      </h1>
      <p className="mt-2 text-gray-600">
        {locale === "de" ? "Entdecken Sie unsere kuratierten Restaurantauswahlen" : locale === "en" ? "Discover our curated restaurant selections" : locale === "pt" ? "Descubra as nossas seleções de restaurantes" : locale === "es" ? "Descubra nuestras selecciones de restaurantes" : "Decouvrez nos selections thematiques de restaurants"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const title = locale === "de" ? collection.titleDe : locale === "en" ? collection.titleEn : locale === "pt" ? collection.titlePt : locale === "es" ? collection.titleEs : collection.titleFr;
          const desc = locale === "de" ? collection.descriptionDe : locale === "en" ? collection.descriptionEn : locale === "pt" ? collection.descriptionPt : locale === "es" ? collection.descriptionEs : collection.descriptionFr;
          return (
            <Link
              key={collection.slug}
              href={`/${locale}/collections/${collection.slug}`}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative h-52">
                <Image
                  src={collection.coverImage}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-3xl">{collection.icon}</span>
                  <h2 className="mt-1 text-xl font-bold text-white">{title}</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
