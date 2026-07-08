import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles, Store, CheckCircle, Mail } from "lucide-react";
import { SwissCross } from "@/components/ui/swiss-cross";

export const metadata: Metadata = {
  title: "Partenaires — Just-Tag",
  description: "Vous fournissez des restaurants suisses ? Découvrez comment une collaboration avec Just-Tag peut apporter de la valeur à vos clients.",
  robots: { index: false },
};

const features = [
  {
    icon: MessageCircle,
    title: "Marketing WhatsApp",
    desc: "Le restaurant envoie ses menus et offres directement sur le téléphone de ses clients. Taux d'ouverture de 98%, lu en moins de 5 minutes.",
  },
  {
    icon: Sparkles,
    title: "Inspiration cuisine par IA",
    desc: "Le cuisinier indique ses ingrédients disponibles, Just-Tag suggère des idées de plats. Idéal pour valoriser les produits frais reçus chaque matin.",
  },
  {
    icon: Store,
    title: "Fiche professionnelle complète",
    desc: "Visibilité Google, galerie photos, avis vérifiés, statistiques — sans commission sur les réservations.",
  },
];

const benefits = [
  "Une rémunération pour chaque restaurant qui prend un abonnement grâce à vous",
  "Aucun effort de votre côté — vous recommandez, Just-Tag s'occupe du reste",
  "Valeur ajoutée concrète pour vos clients restaurateurs",
  "Plateforme 100% suisse, hébergement en Suisse, conforme LPD",
  "Essai gratuit 14 jours pour chaque restaurant que vous référencez",
];

export default function PourPartenairesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b bg-gray-50 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
            <SwissCross size={14} />
            Collaboration B2B
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl" style={{ textWrap: "balance" }}>
            Vous fournissez des restaurants suisses ?
          </h1>
          <p className="mt-5 text-lg text-gray-600" style={{ textWrap: "balance" }}>
            Just-Tag aide vos clients restaurateurs à remplir leurs tables, fidéliser leur clientèle et simplifier leur quotidien. Une recommandation de votre part peut tout changer pour eux.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="mailto:contact@just-tag.app?subject=Partenariat Just-Tag"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-just-tag)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              Nous contacter
            </a>
            <Link
              href="/fr/pour-restaurateurs"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Voir la plateforme
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What Just-Tag does */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-3">
            Ce que Just-Tag apporte à vos clients
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Pas un annuaire. Une plateforme complète de marketing et de gestion pour restaurants indépendants.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border bg-gray-50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-just-tag)]/10 mb-4">
                  <Icon className="h-5 w-5 text-[var(--color-just-tag)]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="bg-gray-50 py-16 px-4 border-y">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Pourquoi recommander Just-Tag ?
          </h2>
          <p className="text-gray-500 mb-8">
            En mentionnant Just-Tag à vos clients, vous leur offrez un outil concret pour développer leur activité — sans effort de votre côté.
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-just-tag)]" />
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">Comment ça fonctionne</h2>
          <div className="space-y-8">
            {[
              {
                n: "1",
                title: "Vous nous contactez",
                desc: "On échange en 20 minutes sur la façon la plus simple d'en parler à vos clients — email, flyer, mention lors d'une livraison.",
              },
              {
                n: "2",
                title: "Vous recommandez Just-Tag",
                desc: "Vos clients reçoivent un lien ou un code qui leur donne accès à l'essai gratuit de 14 jours. Aucune démarche supplémentaire de votre part.",
              },
              {
                n: "3",
                title: "Vos clients en bénéficient directement",
                desc: "Le restaurant s'inscrit, configure sa fiche en quelques minutes, et commence à envoyer ses menus par WhatsApp dès le premier jour.",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-just-tag)] text-sm font-bold text-[var(--color-just-tag)]">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-just-tag)] py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Une question ? Parlons-en.
          </h2>
          <p className="text-white/80 mb-8">
            Pas de formulaire compliqué. Écrivez-nous directement — on répond sous 24h.
          </p>
          <a
            href="mailto:contact@just-tag.app?subject=Partenariat Just-Tag"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-[var(--color-just-tag)] shadow hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            contact@just-tag.app
          </a>
        </div>
      </section>
    </main>
  );
}
