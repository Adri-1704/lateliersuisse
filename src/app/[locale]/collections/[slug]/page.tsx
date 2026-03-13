import { redirect } from "next/navigation";
import { collections } from "@/data/collections";
import { getLocalizedName, getLocalizedDescription } from "@/lib/locale-helpers";

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
