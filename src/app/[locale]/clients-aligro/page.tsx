import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { AligroHero } from "@/components/aligro/AligroHero";
import { AligroOfferBanner } from "@/components/aligro/AligroOfferBanner";
import { AligroFinalCTA } from "@/components/aligro/AligroFinalCTA";
import { AligroFeatures } from "@/components/aligro/AligroFeatures";
import { AligroProblemSolution } from "@/components/aligro/AligroProblemSolution";
import { B2BTrustStats } from "@/components/b2b/B2BTrustStats";
import { B2BWhatsAppStats } from "@/components/b2b/B2BWhatsAppStats";
import { B2BHowItWorks } from "@/components/b2b/B2BHowItWorks";

/**
 * Page d'atterrissage partenaire Aligro. Contenu en dur en français
 * uniquement (pas de traduction 5 langues) : la page vit sous [locale] par
 * nécessité de routing Next.js, mais cible exclusivement la Suisse romande.
 *
 * Accessible via /fr/clients-aligro. Le pourcentage de remise se configure
 * dans src/config/aligro.ts (ALIGRO_DISCOUNT_PERCENT).
 */

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Clients Aligro — Just-Tag";
  const description =
    "Offre partenaire réservée aux clients Aligro : donnez à votre établissement une fiche professionnelle visible sur Google, un canal WhatsApp direct avec vos clients et des avis mis en valeur, sans commission sur vos réservations.";

  return {
    title,
    description,
    // Page d'offre partenaire ciblée (diffusée par Aligro), pas destinée au
    // référencement public.
    robots: { index: false, follow: true },
    alternates: {
      canonical: "/fr/clients-aligro",
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/fr/clients-aligro`,
      type: "website",
    },
  };
}

export default async function ClientsAligroPage() {
  // Chiffres réels de la plateforme (même logique que /pour-restaurateurs)
  let totalRestaurants = 0;
  let totalReviews = 0;
  try {
    const supabase = createAdminClient();
    const [{ count: restaurantsCount }, { count: reviewsCount }] = await Promise.all([
      supabase
        .from("restaurants")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
    ]);
    totalRestaurants = restaurantsCount ?? 0;
    totalReviews = reviewsCount ?? 0;
  } catch {
    // Fallback à 0 si Supabase est indisponible
  }

  return (
    <>
      <AligroHero />
      <AligroOfferBanner />
      <B2BTrustStats totalRestaurants={totalRestaurants} totalReviews={totalReviews} />
      <B2BWhatsAppStats />
      <AligroFeatures />
      <AligroProblemSolution />
      <B2BHowItWorks />
      <AligroFinalCTA />
    </>
  );
}
