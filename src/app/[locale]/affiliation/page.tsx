import type { Metadata } from "next";
import Link from "next/link";
import { Users, Gift, TrendingUp, Star, Sparkles, Heart, ArrowRight, Mail } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Programme d'affiliation Just-Tag — Influenceurs & créateurs food",
    description:
      "Rejoignez le programme d'affiliation Just-Tag : partagez vos adresses préférées, obtenez votre page personnalisée et touchez une commission sur chaque abonnement.",
    alternates: {
      canonical: `/${locale}/affiliation`,
      languages: {
        fr: "/fr/affiliation",
        de: "/de/affiliation",
        en: "/en/affiliation",
        pt: "/pt/affiliation",
        es: "/es/affiliation",
      },
    },
    openGraph: {
      title: "Programme d'affiliation Just-Tag — Influenceurs food",
      description: "Partagez vos adresses préférées, obtenez votre page personnalisée et gagnez à chaque abonnement.",
      url: `${baseUrl}/${locale}/affiliation`,
      type: "website",
    },
  };
}

export default async function AffiliationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const steps = [
    {
      icon: Heart,
      title: "Partagez vos coups de coeur",
      description: "Sélectionnez vos 10 restaurants, bars et cafés préférés en Suisse Romande. Ceux que vous recommanderiez les yeux fermés.",
    },
    {
      icon: Star,
      title: "On crée votre page",
      description: "Votre sélection devient une page permanente sur Just-Tag avec votre nom, votre photo et vos commentaires personnels.",
    },
    {
      icon: TrendingUp,
      title: "Partagez, gagnez",
      description: "Chaque restaurateur qui s'abonne via votre page vous rapporte une commission. Plus vous partagez, plus vous gagnez.",
    },
  ];

  const benefits = [
    {
      icon: Sparkles,
      title: "Votre page personnalisée",
      description: "Une page \"La sélection de [Votre nom]\" hébergée à vie sur Just-Tag. Votre vitrine gastronomique permanente.",
    },
    {
      icon: Gift,
      title: "Commission sur chaque abonnement",
      description: "Un restaurateur s'abonne grâce à vous ? Vous touchez une commission récurrente tant qu'il reste abonné.",
    },
    {
      icon: Users,
      title: "Visibilité croisée",
      description: "Just-Tag met en avant votre profil et vos réseaux sociaux sur votre page. Nos visiteurs deviennent vos followers.",
    },
    {
      icon: TrendingUp,
      title: "Contenu exclusif",
      description: "Accès en avant-première aux nouveaux restaurants, aux données de fréquentation et aux tendances food de la Romandie.",
    },
  ];

  const profiles = [
    {
      title: "Influenceurs food",
      description: "Vous partagez vos découvertes culinaires sur Instagram, TikTok ou YouTube ? Votre audience fait confiance à vos recommandations.",
      followers: "1K+ abonnés",
    },
    {
      title: "Blogueurs & journalistes",
      description: "Vous écrivez sur la gastronomie suisse ? Intégrez Just-Tag comme source et référence dans vos articles.",
      followers: "Blog ou média actif",
    },
    {
      title: "Passionnés de gastronomie",
      description: "Pas besoin d'être influenceur. Si vos amis vous demandent toujours \"tu connais un bon resto ?\", ce programme est pour vous.",
      followers: "Aucun minimum",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--color-just-tag)] via-red-600 to-red-700 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Programme d&apos;affiliation
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Partagez vos adresses,<br />
            <span className="text-amber-200">gagnez à chaque abonnement</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
            Vous êtes influenceur food, blogueur culinaire ou simplement passionné de gastronomie ?
            Rejoignez le programme d&apos;affiliation Just-Tag et transformez vos recommandations en revenus.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:contact@just-tag.app?subject=Programme%20d'affiliation%20Just-Tag"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[var(--color-just-tag)] shadow-lg transition hover:scale-105"
            >
              <Mail className="h-5 w-5" />
              Rejoindre le programme
            </a>
            <Link
              href={`/${locale}/restaurants`}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/60 px-8 py-4 text-base font-bold text-white transition hover:bg-white/10"
            >
              Découvrir Just-Tag
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
              En 3 étapes simples, sans engagement, sans investissement.
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
                <h3 className="mt-5 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Vos avantages
            </h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-5 rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <benefit.icon className="h-6 w-6 text-[var(--color-just-tag)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Pour qui ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Pas besoin d&apos;avoir 100K followers. Si vous aimez la gastronomie romande, vous êtes le bienvenu.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {profiles.map((profile) => (
              <div
                key={profile.title}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center"
              >
                <h3 className="text-xl font-bold text-gray-900">{profile.title}</h3>
                <p className="mt-3 text-gray-600">{profile.description}</p>
                <div className="mt-4 inline-block rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700">
                  {profile.followers}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example */}
      <section className="bg-gray-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Exemple concret
          </h2>
          <div className="mx-auto mt-8 max-w-lg rounded-2xl bg-gray-800 p-8 text-left">
            <p className="text-sm uppercase tracking-widest text-gray-400">Scénario</p>
            <p className="mt-3 text-lg leading-relaxed">
              Vous partagez votre page <strong className="text-amber-300">&ldquo;La sélection de Marie&rdquo;</strong> en story Instagram.
              Sur 10 000 vues, 200 personnes cliquent. 5 restaurateurs découvrent Just-Tag et s&apos;abonnent grâce à vous.
            </p>
            <div className="my-6 h-px bg-gray-700" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">5 abonnements annuels</span>
                <span className="font-semibold">5 × 299 CHF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Votre commission (10%)</span>
                <span className="font-semibold text-amber-300">149.50 CHF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Récurrence annuelle</span>
                <span className="font-semibold text-amber-300">tant qu&apos;ils restent abonnés</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Et ça, c&apos;est pour UNE story. Imaginez avec un post, un article de blog ou une vidéo YouTube.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Prêt à rejoindre l&apos;aventure ?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Envoyez-nous un email avec votre nom, votre compte Instagram/blog et vos 3 restaurants préférés en Romandie. On revient vers vous sous 48h.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:contact@just-tag.app?subject=Programme%20d'affiliation%20Just-Tag&body=Bonjour%2C%0A%0AJe%20souhaite%20rejoindre%20le%20programme%20d'affiliation%20Just-Tag.%0A%0AMon%20nom%20%3A%20%0AMon%20Instagram%20%2F%20blog%20%3A%20%0AMes%203%20restaurants%20pr%C3%A9f%C3%A9r%C3%A9s%20%3A%20%0A%0AMerci%20!"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-just-tag)] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:scale-105"
            >
              <Mail className="h-5 w-5" />
              Envoyer ma candidature
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Gratuit · Sans engagement · Réponse sous 48h
          </p>
        </div>
      </section>
    </>
  );
}
