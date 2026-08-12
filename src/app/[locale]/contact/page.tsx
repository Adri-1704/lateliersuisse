import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactClient from "./ContactClient";

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta" });

  const title = t("contactTitle");
  const description = t("contactDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        fr: "/fr/contact",
        de: "/de/contact",
        en: "/en/contact",
        pt: "/pt/contact",
        es: "/es/contact",
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/contact`,
      type: "website",
    },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
