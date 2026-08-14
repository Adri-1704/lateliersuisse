import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALIGRO_DISCOUNT_PERCENT, getAligroOfferLabel } from "@/config/aligro";
import {
  WhatsAppOfferMockup,
  HAPPY_HOUR_MOCKUP,
  MENU_DU_JOUR_MOCKUP,
} from "@/components/aligro/WhatsAppOfferMockup";

/**
 * Hero dédié aux clients Aligro. Contenu 100% en français en dur (pas de
 * traduction via next-intl) : cette page cible uniquement la Suisse romande.
 *
 * La colonne de droite met en scène une paire de mockups WhatsApp
 * (WhatsAppOfferMockup) — Happy Hour au premier plan, Menu du jour en second
 * plan, légèrement décalé — cœur de la proposition de valeur Just-Tag, avec
 * le logo Aligro relégué à un badge discret "Partenaire officiel" en
 * dessous. Sur mobile, les deux téléphones se replient en une pile verticale
 * (léger chevauchement) pour ne jamais provoquer de débordement horizontal.
 */
export function AligroHero() {
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
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Colonne texte */}
          <div className="animate-fade-in-up">
            {/* Eyebrow partenariat (le mockup WhatsApp est mis en avant à droite) */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white ring-1 ring-white/20">
              Offre partenaire Aligro
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
              Just-Tag, c&apos;est votre fiche professionnelle visible sur
              Google, un canal WhatsApp direct avec vos clients et vos avis mis
              en valeur — la plateforme pensée pour les restaurants, bars, cafés,
              traiteurs et hôtels-restaurants indépendants de Suisse romande.
            </p>

            {/* Bénéfices clés */}
            <ul className="mt-8 space-y-3">
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#25D366]" />
                <span className="text-base sm:text-lg">
                  Plus de visibilité en ligne, sans effort
                </span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#25D366]" />
                <span className="text-base sm:text-lg">
                  Vos offres et nouveautés envoyées directement sur WhatsApp
                </span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#25D366]" />
                <span className="text-base sm:text-lg">
                  Zéro commission sur vos réservations et commandes, toujours
                </span>
              </li>
            </ul>

            {/* Offre Aligro */}
            {ALIGRO_DISCOUNT_PERCENT !== null ? (
              <div className="mt-6 inline-flex items-center gap-4 rounded-2xl bg-[var(--color-just-tag)] px-6 py-4 shadow-xl shadow-[var(--color-just-tag)]/30 ring-1 ring-white/10">
                <span className="font-condensed text-5xl font-black leading-none text-white sm:text-6xl">
                  -{ALIGRO_DISCOUNT_PERCENT}%
                </span>
                <span className="text-sm font-bold uppercase leading-tight tracking-wide text-white">
                  sur tous
                  <br />
                  vos abonnements
                </span>
              </div>
            ) : (
              <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-just-tag)]/15 px-4 py-2 text-sm font-semibold text-[var(--color-just-tag)]">
                {getAligroOfferLabel()}
              </p>
            )}

            {/* CTA principal */}
            <div className="mt-10">
              <Button
                asChild
                size="lg"
                className="group bg-[var(--color-just-tag)] px-8 py-6 text-base font-semibold shadow-lg shadow-[var(--color-just-tag)]/20 transition-transform hover:-translate-y-0.5 hover:bg-[var(--color-just-tag-dark)]"
              >
                <Link href="/fr/partenaire-inscription?ref=aligro">
                  Profiter de l&apos;offre
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Colonne visuel — paire de mockups WhatsApp en vedette + badge partenaire Aligro */}
          <div className="flex flex-col items-center gap-8 overflow-x-hidden px-2 sm:overflow-visible sm:px-0 lg:items-end">
            {/* Paire de téléphones : Menu du jour en second plan, Happy Hour au premier plan */}
            <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-center lg:justify-end">
              {/* Happy Hour — premier plan */}
              <div className="animate-fade-in-up animate-delay-200 relative z-10">
                <WhatsAppOfferMockup
                  content={HAPPY_HOUR_MOCKUP}
                  className="w-[220px] sm:w-[240px] lg:w-[260px]"
                />
              </div>

              {/* Menu du jour — second plan, décalé et incliné à l'opposé */}
              <div className="animate-fade-in-up animate-delay-400 relative z-0 -mt-14 scale-[0.9] opacity-95 sm:-ml-14 sm:mt-0 sm:scale-90 sm:opacity-100 lg:-ml-16 lg:scale-95">
                <WhatsAppOfferMockup
                  content={MENU_DU_JOUR_MOCKUP}
                  showFloatingBadge={false}
                  frameClassName="rotate-3 hover:rotate-0"
                  className="w-[200px] sm:w-[220px] lg:w-[240px]"
                />
              </div>
            </div>

            <div className="animate-fade-in-up animate-delay-400 inline-flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-lg ring-1 ring-black/5 backdrop-blur">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/10">
                <Image
                  src="/partners/aligro-logo.png"
                  alt="Aligro"
                  width={900}
                  height={500}
                  className="h-4 w-auto object-contain"
                />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                Partenaire officiel de Just-Tag
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
