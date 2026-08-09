import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import WhatsUpClient from "./WhatsUpClient";

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta" });

  const title = t("whatsUpTitle");
  const description = t("whatsUpDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/whats-up`,
      languages: {
        fr: "/fr/whats-up",
        de: "/de/whats-up",
        en: "/en/whats-up",
        pt: "/pt/whats-up",
        es: "/es/whats-up",
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/whats-up`,
      type: "website",
    },
  };
}

export default function WhatsUpPage() {
  return <WhatsUpClient />;
}
