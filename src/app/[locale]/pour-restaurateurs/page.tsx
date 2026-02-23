import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { B2BHero } from "@/components/b2b/B2BHero";
import { B2BTrustStats } from "@/components/b2b/B2BTrustStats";
import { B2BSwissAdvantage } from "@/components/b2b/B2BSwissAdvantage";
import { B2BAdvantages } from "@/components/b2b/B2BAdvantages";
import { B2BHowItWorks } from "@/components/b2b/B2BHowItWorks";
import { B2BTestimonials } from "@/components/b2b/B2BTestimonials";
import { B2BPricing } from "@/components/b2b/B2BPricing";
import { B2BContactForm } from "@/components/b2b/B2BContactForm";
import { B2BFAQ } from "@/components/b2b/B2BFAQ";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "b2b" });

  const titles: Record<string, string> = {
    fr: "Pour les restaurateurs - Developpez votre restaurant",
    de: "Fuer Restaurantbesitzer - Entwickeln Sie Ihr Restaurant",
    en: "For restaurant owners - Grow your restaurant",
  };

  const descriptions: Record<string, string> = {
    fr: "Rejoignez Just-Tag, la plateforme de reference pour les restaurants en Suisse. Visibilite, avis clients, outils marketing. A partir de CHF 49/mois.",
    de: "Treten Sie Just-Tag bei, der fuehrenden Plattform fuer Restaurants in der Schweiz. Sichtbarkeit, Kundenbewertungen, Marketing-Tools. Ab CHF 49/Monat.",
    en: "Join Just-Tag, the leading platform for restaurants in Switzerland. Visibility, customer reviews, marketing tools. From CHF 49/month.",
  };

  return {
    title: titles[locale] || titles.fr,
    description: descriptions[locale] || descriptions.fr,
    alternates: {
      canonical: `/${locale}/pour-restaurateurs`,
      languages: {
        fr: "/fr/pour-restaurateurs",
        de: "/de/pour-restaurateurs",
        en: "/en/pour-restaurateurs",
      },
    },
    openGraph: {
      title: titles[locale] || titles.fr,
      description: descriptions[locale] || descriptions.fr,
      url: `${baseUrl}/${locale}/pour-restaurateurs`,
      type: "website",
    },
  };
}

export default async function PourRestaurateursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "b2b.faq" });

  // FAQPage structured data (Schema.org)
  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqKeys.map((key) => ({
      "@type": "Question",
      name: t(`${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`${key}.answer`),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <B2BHero />
      <B2BTrustStats />
      <B2BSwissAdvantage />
      <B2BAdvantages />
      <B2BHowItWorks />
      <B2BTestimonials />
      <B2BPricing />
      <B2BContactForm />
      <B2BFAQ />
    </>
  );
}
