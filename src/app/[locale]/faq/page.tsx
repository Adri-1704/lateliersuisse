import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FAQClient from "./FAQClient";

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta" });

  const title = t("faqTitle");
  const description = t("faqDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/faq`,
      languages: {
        fr: "/fr/faq",
        de: "/de/faq",
        en: "/en/faq",
        pt: "/pt/faq",
        es: "/es/faq",
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/faq`,
      type: "website",
    },
  };
}

export default function FAQPage() {
  return <FAQClient />;
}
