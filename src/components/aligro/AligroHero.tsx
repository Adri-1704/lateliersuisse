import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAligroOfferLabel } from "@/config/aligro";

interface AligroHeroProps {
  totalRestaurants: number;
}

/**
 * Hero dédié aux clients Aligro. Contenu 100% en français en dur (pas de
 * traduction via next-intl) : cette page cible uniquement la Suisse romande.
 */
export function AligroHero({ totalRestaurants }: AligroHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-gray-900/70" />

      {/* Swiss cross watermark */}
      <svg
        className="pointer-events-none absolute right-10 top-10 opacity-[0.04]"
        width="300"
        height="300"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path d="M14 8h4v6h6v4h-6v6h-4v-6H8v-4h6V8z" fill="white" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge partenariat Aligro : pastille blanche pour le logo (fond
              blanc) sur le hero sombre, + libellé "Partenaire" à côté. */}
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-2.5 pr-4 shadow-sm">
            <Image
              src="/partners/aligro-logo.png"
              alt="Aligro"
              width={900}
              height={500}
              className="h-6 w-auto rounded-sm object-contain"
            />
            <span className="text-sm font-semibold text-gray-700">
              Partenaire
            </span>
          </div>

          <h1 className="font-condensed text-5xl font-black leading-[0.93] tracking-tight text-white sm:text-6xl md:text-7xl">
            Client Aligro ?
            <br />
            Faites rayonner votre établissement{" "}
            <em className="not-italic text-[var(--color-just-tag)]">
              sans commission.
            </em>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-gray-300">
            Just-Tag, c&apos;est votre fiche professionnelle visible sur Google,
            un canal WhatsApp direct avec vos clients et vos avis mis en valeur
            — la plateforme pensée pour les restaurants, bars, cafés, traiteurs
            et hôtels-restaurants indépendants de Suisse romande.
          </p>

          {/* Bénéfices clés */}
          <ul className="mt-8 space-y-3">
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-just-tag)]" />
              <span className="text-base sm:text-lg">
                Plus de visibilité en ligne, sans effort
              </span>
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-just-tag)]" />
              <span className="text-base sm:text-lg">
                Vos offres et nouveautés envoyées directement sur WhatsApp
              </span>
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-just-tag)]" />
              <span className="text-base sm:text-lg">
                Zéro commission sur vos réservations et commandes, toujours
              </span>
            </li>
          </ul>

          {/* Offre Aligro */}
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-just-tag)]/15 px-4 py-2 text-sm font-semibold text-[var(--color-just-tag)]">
            {getAligroOfferLabel()}
          </p>

          {totalRestaurants > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <Users className="h-4 w-4" />
              Déjà {totalRestaurants.toLocaleString("fr-CH")}+ établissements
              romands sur Just-Tag
            </div>
          )}

          {/* CTA principal */}
          <div className="mt-10">
            <Button
              asChild
              size="lg"
              className="bg-[var(--color-just-tag)] px-8 py-6 text-base font-semibold hover:bg-[var(--color-just-tag-dark)]"
            >
              <Link href="/fr/partenaire-inscription?ref=aligro">
                Profiter de l&apos;offre
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
