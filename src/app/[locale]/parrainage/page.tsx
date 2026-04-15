import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Users, Sparkles, ArrowRight, Mail, Phone, Share2 } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Parrainage Just-Tag — 3 mois offerts pour chaque restaurateur parrainé",
    description:
      "Parrainez un confrère restaurateur et recevez 3 mois d'abonnement Just-Tag offerts. Sans limite de parrainages. Aidez-nous à construire la communauté des restos romands.",
    alternates: {
      canonical: `/${locale}/parrainage`,
    },
    openGraph: {
      title: "Parrainage Just-Tag — 3 mois offerts",
      description:
        "Chaque restaurateur que vous faites rejoindre Just-Tag vous offre 3 mois d'abonnement gratuits.",
      url: `${baseUrl}/${locale}/parrainage`,
      type: "website",
    },
  };
}

export default async function ParrainagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const steps = [
    {
      icon: Share2,
      title: "Partagez votre lien",
      description:
        "Retrouvez votre lien de parrainage personnel depuis votre espace client, puis envoyez-le à vos confrères restaurateurs.",
    },
    {
      icon: Users,
      title: "Ils s'abonnent",
      description:
        "Dès qu'un restaurateur parrainé s'abonne via votre lien, il bénéficie lui aussi de notre offre Early Bird.",
    },
    {
      icon: Gift,
      title: "Vous recevez 3 mois offerts",
      description:
        "Votre prochain prélèvement est automatiquement crédité de 3 mois d'abonnement. Sans limite de parrainages cumulables.",
    },
  ];

  const benefits = [
    "3 mois offerts par restaurant parrainé (≈ 75 CHF)",
    "Pas de limite — parrainez 10 restos, obtenez 30 mois gratuits",
    "Crédit automatique sur votre prochain prélèvement Stripe",
    "Le restaurateur parrainé bénéficie aussi de l'offre Early Bird",
    "Le bonus s'applique dès le premier paiement, pas à la fin du trial",
    "Cumulable avec l'offre Founding 50",
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--color-just-tag)] via-red-600 to-red-700 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Programme de parrainage
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Parrainez un confrère,<br />
            gagnez <span className="text-amber-200">3 mois offerts</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
            Chaque restaurateur que vous amenez sur Just-Tag vous offre 3 mois
            d&apos;abonnement gratuits. Sans limite. Ensemble, on construit la
            communauté des restos romands.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/espace-client`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[var(--color-just-tag)] shadow-lg transition hover:scale-105"
            >
              Obtenir mon lien de parrainage
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={`/${locale}/pour-restaurateurs`}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/60 px-8 py-4 text-base font-bold text-white transition hover:bg-white/10"
            >
              Je ne suis pas encore abonné
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Comment ça marche
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              En 3 étapes simples, sans paperasse, sans attente.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-just-tag)] text-sm font-bold text-white">
                  {idx + 1}
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50">
                  <step.icon className="h-7 w-7 text-[var(--color-just-tag)]" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Les règles du jeu
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Un programme généreux, sans petits caractères piégeux.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-just-tag)]/10">
                      <Gift className="h-4 w-4 text-[var(--color-just-tag)]" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-gray-900 p-8 text-white shadow-xl">
              <div className="mb-4 text-sm uppercase tracking-widest text-gray-400">
                Exemple concret
              </div>
              <p className="text-lg leading-relaxed">
                Vous parrainez <strong className="text-amber-300">5 restaurants</strong>,
                ils deviennent abonnés Early Bird à 24.90 CHF/mois.
              </p>
              <div className="my-6 h-px bg-gray-700" />
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">5 parrainages × 3 mois</span>
                  <span className="font-semibold">15 mois offerts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Valeur économisée</span>
                  <span className="font-semibold">374 CHF</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>Votre abo gratuit</span>
                  <span className="font-bold">jusqu&apos;en 2027+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Une question ?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Je réponds personnellement à tous les restaurateurs qui me contactent.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:contact@just-tag.app"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-just-tag)] px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90"
            >
              <Mail className="h-4 w-4" />
              contact@just-tag.app
            </a>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Phone className="h-4 w-4" />
              Formulaire de contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
