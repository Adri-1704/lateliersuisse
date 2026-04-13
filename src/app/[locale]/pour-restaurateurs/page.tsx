import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { getEarlyBirdSpotsRemaining } from "@/lib/subscriptions/queries";
import { B2BEarlyBirdBanner } from "@/components/b2b/B2BEarlyBirdBanner";
import { B2BHero } from "@/components/b2b/B2BHero";
import { B2BTrustStats } from "@/components/b2b/B2BTrustStats";
import { B2BProblemSolution } from "@/components/b2b/B2BProblemSolution";
import { B2BFeatures } from "@/components/b2b/B2BFeatures";
import { B2BPricing } from "@/components/b2b/B2BPricing";
import { B2BFindRestaurant } from "@/components/b2b/B2BFindRestaurant";
import { B2BFAQ } from "@/components/b2b/B2BFAQ";
import { B2BFinalCTA } from "@/components/b2b/B2BFinalCTA";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Pour les restaurateurs — Remplissez vos tables sans commission",
    de: "Fuer Restaurantbesitzer — Fuellen Sie Ihre Tische ohne Provision",
    en: "For restaurant owners — Fill your tables without commission",
    pt: "Para restauradores — Encha as suas mesas sem comissao",
    es: "Para restauradores — Llene sus mesas sin comision",
  };

  const descriptions: Record<string, string> = {
    fr: "Rejoignez Just-Tag : 500+ restaurants romands, 1 488 avis vérifiés, zéro commission. À partir de CHF 24.90/mois avec 14 jours d'essai gratuit.",
    de: "Treten Sie Just-Tag bei: 500+ Westschweizer Restaurants, 1 488 verifizierte Bewertungen, keine Provision. Ab CHF 24.90/Monat mit 14 Tagen Probezeit.",
    en: "Join Just-Tag: 500+ Western Swiss restaurants, 1,488 verified reviews, zero commission. From CHF 24.90/month with 14-day free trial.",
    pt: "Junte-se ao Just-Tag: 500+ restaurantes da Suica Romanda, 1 488 avaliacoes verificadas, zero comissao. A partir de CHF 24.90/mes com 14 dias gratis.",
    es: "Unase a Just-Tag: 500+ restaurantes de la Suiza Romanda, 1 488 resenas verificadas, cero comision. Desde CHF 24.90/mes con 14 dias de prueba gratis.",
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

export default async function PourRestaurateursPage() {
  // Fetch real restaurant count
  let totalRestaurants = 0;
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("restaurants")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);
    totalRestaurants = count ?? 0;
  } catch {
    // Fallback to 0 if Supabase is unavailable
  }

  // Fetch Early Bird spots remaining
  const spotsRemaining = await getEarlyBirdSpotsRemaining();

  // FAQ structured data (Schema.org)
  const faqItems = [
    { q: "Combien ça me rapporte concrètement ?", a: "À CHF 24.90/mois, il suffit d'un seul client supplémentaire par mois pour rentabiliser votre abonnement." },
    { q: "Comment vous vérifiez que je suis bien le propriétaire ?", a: "Notre équipe vérifie manuellement que les informations correspondent avant d'activer votre accès." },
    { q: "Je peux annuler quand je veux ?", a: "Oui. Le plan mensuel est sans engagement. Vous annulez depuis votre espace client." },
    { q: "Vous prenez une commission sur mes réservations ?", a: "Non. Zéro commission, zéro frais de transaction." },
    { q: "Mes données appartiennent à qui ?", a: "À vous. Hébergement en Suisse, conforme LPD et RGPD." },
    { q: "Quelle différence avec les plateformes à commission ?", a: "Just-Tag combine fiche professionnelle, avis vérifiés, zéro commission et SEO local en 5 langues." },
    { q: "Je peux essayer gratuitement ?", a: "Oui. Tous les plans incluent 14 jours d'essai gratuit via Stripe." },
    { q: "Que se passe-t-il après les 14 jours ?", a: "Votre abonnement démarre automatiquement. Annulation possible à tout moment sur le plan mensuel." },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <B2BEarlyBirdBanner spotsRemaining={spotsRemaining} />
      <B2BHero totalRestaurants={totalRestaurants} />
      <B2BTrustStats totalRestaurants={totalRestaurants} />
      <B2BProblemSolution />
      <B2BFeatures />
      <B2BPricing spotsRemaining={spotsRemaining} />
      <B2BFindRestaurant />
      <B2BFAQ />
      <B2BFinalCTA spotsRemaining={spotsRemaining} />
    </>
  );
}
