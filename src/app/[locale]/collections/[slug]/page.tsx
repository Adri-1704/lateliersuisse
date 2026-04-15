import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { collections } from "@/data/collections";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

function getCollectionTitle(
  collection: (typeof collections)[number],
  locale: string
): string {
  switch (locale) {
    case "de": return collection.titleDe;
    case "en": return collection.titleEn;
    case "pt": return collection.titlePt;
    case "es": return collection.titleEs;
    default: return collection.titleFr;
  }
}

function getCollectionDescription(
  collection: (typeof collections)[number],
  locale: string
): string {
  switch (locale) {
    case "de": return collection.descriptionDe;
    case "en": return collection.descriptionEn;
    case "pt": return collection.descriptionPt;
    case "es": return collection.descriptionEs;
    default: return collection.descriptionFr;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) return {};

  const title = getCollectionTitle(collection, locale);
  const description = getCollectionDescription(collection, locale);

  return {
    title: `${title} — Just-Tag`,
    description,
    alternates: {
      canonical: `/${locale}/collections/${slug}`,
      languages: {
        fr: `/fr/collections/${slug}`,
        de: `/de/collections/${slug}`,
        en: `/en/collections/${slug}`,
        pt: `/pt/collections/${slug}`,
        es: `/es/collections/${slug}`,
      },
    },
    openGraph: {
      title: `${title} — Just-Tag`,
      description,
      url: `${baseUrl}/${locale}/collections/${slug}`,
      type: "website",
      images: collection.coverImage ? [{ url: collection.coverImage }] : undefined,
    },
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    redirect(`/${locale}/collections`);
  }

  // Redirect to restaurants page with the appropriate filter
  const searchParams = new URLSearchParams();
  if (collection.filterFeature) {
    searchParams.set("features", collection.filterFeature);
  }
  if (collection.filterCuisine) {
    searchParams.set("cuisine", collection.filterCuisine);
  }

  redirect(`/${locale}/restaurants?${searchParams.toString()}`);
}
