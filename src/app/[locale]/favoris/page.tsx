import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FavorisClient from "./FavorisClient";

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta" });

  const title = t("favorisTitle");
  const description = t("favorisDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/favoris`,
      languages: {
        fr: "/fr/favoris",
        de: "/de/favoris",
        en: "/en/favoris",
        pt: "/pt/favoris",
        es: "/es/favoris",
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/favoris`,
      type: "website",
    },
  };
}

export default function FavorisPage() {
  return <FavorisClient />;
}
