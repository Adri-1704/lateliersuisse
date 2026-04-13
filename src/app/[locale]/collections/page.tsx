import Link from "next/link";
import Image from "next/image";
import { collections, type Collection } from "@/data/collections";
import { createAdminClient } from "@/lib/supabase/server";

async function getCollectionCount(collection: Collection): Promise<number> {
  const supabase = createAdminClient();
  let query = supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);
  if (collection.filterFeature) {
    query = query.contains("features", [collection.filterFeature]);
  }
  if (collection.filterCuisine) {
    query = query.eq("cuisine_type", collection.filterCuisine);
  }
  const { count } = await query;
  return count ?? 0;
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Compte le nombre de restaurants par collection, filtre les vides
  const counts = await Promise.all(collections.map(getCollectionCount));
  const visible = collections
    .map((c, i) => ({ collection: c, count: counts[i] }))
    .filter(({ count }) => count > 0);

  const restaurantsLabel = (n: number) => {
    if (locale === "de") return n === 1 ? "1 Restaurant" : `${n} Restaurants`;
    if (locale === "en") return n === 1 ? "1 restaurant" : `${n} restaurants`;
    if (locale === "pt") return n === 1 ? "1 restaurante" : `${n} restaurantes`;
    if (locale === "es") return n === 1 ? "1 restaurante" : `${n} restaurantes`;
    return n === 1 ? "1 restaurant" : `${n} restaurants`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">
        {locale === "de" ? "Ambianzen" : locale === "en" ? "Ambiances" : locale === "pt" ? "Ambientes" : locale === "es" ? "Ambientes" : "Ambiances"}
      </h1>
      <p className="mt-2 text-gray-600">
        {locale === "de" ? "Entdecken Sie unsere kuratierten Restaurantauswahlen" : locale === "en" ? "Discover our curated restaurant selections" : locale === "pt" ? "Descubra as nossas seleções de restaurantes" : locale === "es" ? "Descubra nuestras selecciones de restaurantes" : "Decouvrez nos selections thematiques de restaurants"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ collection, count }) => {
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
                  <p className="mt-0.5 text-xs font-medium text-white/80">{restaurantsLabel(count)}</p>
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
