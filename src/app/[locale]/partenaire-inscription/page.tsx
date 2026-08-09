import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MerchantSignupClient from "./MerchantSignupClient";

export const revalidate = 86400;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta" });

  const title = t("partenaireInscriptionTitle");
  const description = t("partenaireInscriptionDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/partenaire-inscription`,
      languages: {
        fr: "/fr/partenaire-inscription",
        de: "/de/partenaire-inscription",
        en: "/en/partenaire-inscription",
        pt: "/pt/partenaire-inscription",
        es: "/es/partenaire-inscription",
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/partenaire-inscription`,
      type: "website",
    },
  };
}

export default function MerchantSignupPage() {
  return <MerchantSignupClient />;
}
