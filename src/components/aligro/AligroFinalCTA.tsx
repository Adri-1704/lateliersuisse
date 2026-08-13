import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAligroOfferLabel } from "@/config/aligro";

/**
 * CTA final de la page /fr/clients-aligro. Le bouton pointe vers
 * /fr/partenaire-inscription?ref=aligro : le param `ref` est capté par
 * `AffiliateTracker` (cookie `jt_ref`, 30 jours) puis transmis aux métadonnées
 * Stripe lors de l'abonnement, ce qui permet de tracer les inscriptions
 * venues d'Aligro.
 */
export function AligroFinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 sm:py-28">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/60" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-just-tag)]">
          Offre partenaire Aligro
        </p>
        <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          Prêt à faire décoller votre visibilité ?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
          {getAligroOfferLabel()}. Inscription en quelques minutes, essai
          gratuit de 14 jours, sans engagement.
        </p>

        <Button
          asChild
          size="lg"
          className="mt-8 bg-[var(--color-just-tag)] px-10 py-6 text-lg font-semibold hover:bg-[var(--color-just-tag-dark)]"
        >
          <Link href="/fr/partenaire-inscription?ref=aligro">
            Profiter de l&apos;offre
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>

        <p className="mt-6 text-sm text-gray-400">
          Une question ?{" "}
          <a
            href="mailto:contact@just-tag.app"
            className="text-white underline hover:text-gray-200"
          >
            contact@just-tag.app
          </a>
        </p>
      </div>
    </section>
  );
}
