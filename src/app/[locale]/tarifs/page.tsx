import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Check,
  Star,
  Zap,
  Crown,
  Infinity,
  ShieldCheck,
  Store,
  Camera,
  UtensilsCrossed,
  BarChart3,
  Megaphone,
  MessageSquare,
} from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Tarifs - Abonnements pour restaurateurs | Just-Tag.ch",
    de: "Preise - Abonnements fuer Restaurantbesitzer | Just-Tag.ch",
    en: "Pricing - Subscription Plans for Restaurants | Just-Tag.ch",
  };

  const descriptions: Record<string, string> = {
    fr: "Decouvrez nos formules d'abonnement pour les restaurants suisses. A partir de CHF 29/mois. Visibilite, gestion de menu, promotions et analytics.",
    de: "Entdecken Sie unsere Abonnements fuer Schweizer Restaurants. Ab CHF 29/Monat. Sichtbarkeit, Menueverwaltung, Aktionen und Analysen.",
    en: "Discover our subscription plans for Swiss restaurants. From CHF 29/month. Visibility, menu management, promotions and analytics.",
  };

  return {
    title: titles[locale] || titles.fr,
    description: descriptions[locale] || descriptions.fr,
    alternates: {
      canonical: `/${locale}/tarifs`,
      languages: {
        fr: "/fr/tarifs",
        de: "/de/tarifs",
        en: "/en/tarifs",
      },
    },
    openGraph: {
      title: titles[locale] || titles.fr,
      description: descriptions[locale] || descriptions.fr,
      url: `${baseUrl}/${locale}/tarifs`,
      type: "website",
    },
  };
}

type PlanId = "monthly" | "semiannual" | "annual" | "lifetime";

interface PricingPlan {
  id: PlanId;
  icon: typeof Star;
  pricePerMonth: string;
  totalPrice: string | null;
  highlighted: boolean;
  badge: string | null;
}

const plans: PricingPlan[] = [
  {
    id: "monthly",
    icon: Star,
    pricePerMonth: "29",
    totalPrice: null,
    highlighted: false,
    badge: null,
  },
  {
    id: "semiannual",
    icon: Zap,
    pricePerMonth: "24.80",
    totalPrice: "149",
    highlighted: false,
    badge: null,
  },
  {
    id: "annual",
    icon: Crown,
    pricePerMonth: "20.75",
    totalPrice: "249",
    highlighted: true,
    badge: "popular",
  },
  {
    id: "lifetime",
    icon: Infinity,
    pricePerMonth: null as unknown as string,
    totalPrice: "499",
    highlighted: false,
    badge: null,
  },
];

const allFeatures = [
  { key: "listing", icon: Store },
  { key: "photos", icon: Camera },
  { key: "menu", icon: UtensilsCrossed },
  { key: "promotions", icon: Megaphone },
  { key: "reviews", icon: MessageSquare },
  { key: "analytics", icon: BarChart3 },
];

// Features available per plan (cumulative)
const planFeatures: Record<PlanId, string[]> = {
  monthly: ["listing", "photos", "menu", "reviews"],
  semiannual: ["listing", "photos", "menu", "promotions", "reviews"],
  annual: ["listing", "photos", "menu", "promotions", "reviews", "analytics"],
  lifetime: ["listing", "photos", "menu", "promotions", "reviews", "analytics"],
};

// i18n content keyed by locale
const content: Record<
  string,
  {
    pageTitle: string;
    pageSubtitle: string;
    guarantee: string;
    perMonth: string;
    totalBilled: string;
    oneTime: string;
    ctaChoose: string;
    ctaPopular: string;
    planNames: Record<PlanId, string>;
    planDescriptions: Record<PlanId, string>;
    badgePopular: string;
    featureLabels: Record<string, string>;
    includedTitle: string;
    faqTitle: string;
    faqSubtitle: string;
    faqs: { q: string; a: string }[];
    saveBadge: string;
  }
> = {
  fr: {
    pageTitle: "Des tarifs simples et transparents",
    pageSubtitle:
      "Choisissez la formule qui correspond a votre restaurant. Sans engagement sur le mensuel, avec des economies sur les formules longues.",
    guarantee: "Satisfait ou rembourse sous 30 jours",
    perMonth: "/mois",
    totalBilled: "Facture {price} CHF",
    oneTime: "Paiement unique",
    ctaChoose: "Choisir cette formule",
    ctaPopular: "Commencer maintenant",
    planNames: {
      monthly: "Mensuel",
      semiannual: "Semestriel",
      annual: "Annuel",
      lifetime: "A vie",
    },
    planDescriptions: {
      monthly: "Ideal pour decouvrir la plateforme sans engagement.",
      semiannual: "Un semestre de visibilite a prix reduit.",
      annual: "Le meilleur rapport qualite-prix pour votre restaurant.",
      lifetime: "Un investissement unique pour une visibilite permanente.",
    },
    badgePopular: "Le plus populaire",
    featureLabels: {
      listing: "Fiche restaurant complete",
      photos: "Photos et galerie",
      menu: "Gestion du menu",
      promotions: "Promotions et offres",
      reviews: "Gestion des avis",
      analytics: "Statistiques et analytics",
    },
    includedTitle: "Inclus dans toutes les formules",
    faqTitle: "Questions frequentes",
    faqSubtitle: "Tout ce que vous devez savoir sur nos abonnements.",
    faqs: [
      {
        q: "Puis-je changer de formule en cours de route ?",
        a: "Oui, vous pouvez passer a une formule superieure a tout moment. La difference sera calculee au prorata.",
      },
      {
        q: "Y a-t-il un engagement minimum ?",
        a: "Non, la formule mensuelle est sans engagement. Vous pouvez annuler a tout moment.",
      },
      {
        q: "Comment fonctionne le paiement ?",
        a: "Le paiement est securise par Stripe. Vous pouvez payer par carte bancaire ou TWINT.",
      },
      {
        q: "Que comprend la formule a vie ?",
        a: "La formule a vie inclut toutes les fonctionnalites actuelles et futures de la plateforme, pour un paiement unique.",
      },
    ],
    saveBadge: "Economisez {percent}%",
  },
  de: {
    pageTitle: "Einfache und transparente Preise",
    pageSubtitle:
      "Waehlen Sie das Angebot, das zu Ihrem Restaurant passt. Ohne Bindung beim Monatsabo, mit Ersparnissen bei laengeren Laufzeiten.",
    guarantee: "30 Tage Geld-zurueck-Garantie",
    perMonth: "/Monat",
    totalBilled: "{price} CHF abgerechnet",
    oneTime: "Einmalige Zahlung",
    ctaChoose: "Dieses Angebot waehlen",
    ctaPopular: "Jetzt starten",
    planNames: {
      monthly: "Monatlich",
      semiannual: "Halbjaehrlich",
      annual: "Jaehrlich",
      lifetime: "Lebenslang",
    },
    planDescriptions: {
      monthly: "Ideal, um die Plattform unverbindlich zu entdecken.",
      semiannual: "Ein Halbjahr Sichtbarkeit zum reduzierten Preis.",
      annual: "Das beste Preis-Leistungs-Verhaeltnis fuer Ihr Restaurant.",
      lifetime:
        "Eine einmalige Investition fuer dauerhafte Sichtbarkeit.",
    },
    badgePopular: "Am beliebtesten",
    featureLabels: {
      listing: "Vollstaendiger Restauranteintrag",
      photos: "Fotos und Galerie",
      menu: "Menueverwaltung",
      promotions: "Aktionen und Angebote",
      reviews: "Bewertungsverwaltung",
      analytics: "Statistiken und Analysen",
    },
    includedTitle: "In allen Angeboten enthalten",
    faqTitle: "Haeufig gestellte Fragen",
    faqSubtitle: "Alles, was Sie ueber unsere Abonnements wissen muessen.",
    faqs: [
      {
        q: "Kann ich mein Angebot unterwegs aendern?",
        a: "Ja, Sie koennen jederzeit zu einem hoeheren Angebot wechseln. Die Differenz wird anteilig berechnet.",
      },
      {
        q: "Gibt es eine Mindestlaufzeit?",
        a: "Nein, das Monatsabo ist ohne Bindung. Sie koennen jederzeit kuendigen.",
      },
      {
        q: "Wie funktioniert die Zahlung?",
        a: "Die Zahlung ist durch Stripe gesichert. Sie koennen mit Kreditkarte oder TWINT bezahlen.",
      },
      {
        q: "Was beinhaltet das Lebenslang-Angebot?",
        a: "Das Lebenslang-Angebot umfasst alle aktuellen und zukuenftigen Funktionen der Plattform, fuer eine einmalige Zahlung.",
      },
    ],
    saveBadge: "Sparen Sie {percent}%",
  },
  en: {
    pageTitle: "Simple and transparent pricing",
    pageSubtitle:
      "Choose the plan that fits your restaurant. No commitment on monthly, with savings on longer plans.",
    guarantee: "30-day money-back guarantee",
    perMonth: "/month",
    totalBilled: "Billed {price} CHF",
    oneTime: "One-time payment",
    ctaChoose: "Choose this plan",
    ctaPopular: "Get started now",
    planNames: {
      monthly: "Monthly",
      semiannual: "Semi-annual",
      annual: "Annual",
      lifetime: "Lifetime",
    },
    planDescriptions: {
      monthly: "Ideal to discover the platform with no commitment.",
      semiannual: "Six months of visibility at a reduced price.",
      annual: "The best value for your restaurant.",
      lifetime: "A one-time investment for permanent visibility.",
    },
    badgePopular: "Most popular",
    featureLabels: {
      listing: "Complete restaurant listing",
      photos: "Photos and gallery",
      menu: "Menu management",
      promotions: "Promotions and offers",
      reviews: "Reviews management",
      analytics: "Statistics and analytics",
    },
    includedTitle: "Included in all plans",
    faqTitle: "Frequently asked questions",
    faqSubtitle: "Everything you need to know about our subscriptions.",
    faqs: [
      {
        q: "Can I switch plans at any time?",
        a: "Yes, you can upgrade to a higher plan at any time. The difference will be prorated.",
      },
      {
        q: "Is there a minimum commitment?",
        a: "No, the monthly plan has no commitment. You can cancel at any time.",
      },
      {
        q: "How does payment work?",
        a: "Payment is secured by Stripe. You can pay by credit card or TWINT.",
      },
      {
        q: "What does the lifetime plan include?",
        a: "The lifetime plan includes all current and future platform features, for a one-time payment.",
      },
    ],
    saveBadge: "Save {percent}%",
  },
};

function getContent(locale: string) {
  return content[locale] || content.fr;
}

function getSavingsPercent(planId: PlanId): number | null {
  // Monthly is 29/month baseline
  const monthlyRate = 29;
  const rates: Record<PlanId, number | null> = {
    monthly: null,
    semiannual: 24.8,
    annual: 20.75,
    lifetime: null,
  };
  const rate = rates[planId];
  if (!rate) return null;
  return Math.round(((monthlyRate - rate) / monthlyRate) * 100);
}

export default async function TarifsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getContent(locale);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {t.pageTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            {t.pageSubtitle}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <ShieldCheck className="h-4 w-4" />
            {t.guarantee}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const features = planFeatures[plan.id];
              const savings = getSavingsPercent(plan.id);
              const isLifetime = plan.id === "lifetime";

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 transition-shadow ${
                    plan.highlighted
                      ? "border-[var(--color-just-tag)] shadow-xl ring-1 ring-[var(--color-just-tag)]/20 scale-[1.02]"
                      : "border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge === "popular" && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-just-tag)] px-4 py-1 text-xs font-semibold text-white shadow-sm">
                        <Crown className="h-3 w-3" />
                        {t.badgePopular}
                      </span>
                    </div>
                  )}

                  {/* Savings badge */}
                  {savings && (
                    <div className="absolute -top-3.5 right-4">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {t.saveBadge.replace("{percent}", String(savings))}
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        plan.highlighted
                          ? "bg-[var(--color-just-tag)] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t.planNames[plan.id]}
                    </h3>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {t.planDescriptions[plan.id]}
                  </p>

                  {/* Price */}
                  <div className="mt-6">
                    {isLifetime ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-gray-900">
                            CHF {plan.totalPrice}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {t.oneTime}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-gray-900">
                            CHF {plan.pricePerMonth}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            {t.perMonth}
                          </span>
                        </div>
                        {plan.totalPrice && (
                          <p className="mt-1 text-sm text-gray-500">
                            {t.totalBilled.replace(
                              "{price}",
                              plan.totalPrice
                            )}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mt-6 flex-1 space-y-3">
                    {allFeatures.map(({ key, icon: FeatureIcon }) => {
                      const included = features.includes(key);
                      return (
                        <li
                          key={key}
                          className={`flex items-center gap-2.5 text-sm ${
                            included ? "text-gray-700" : "text-gray-300"
                          }`}
                        >
                          {included ? (
                            <Check className="h-4 w-4 shrink-0 text-[var(--color-just-tag)]" />
                          ) : (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                              <span className="block h-0.5 w-3 rounded-full bg-gray-300" />
                            </span>
                          )}
                          <FeatureIcon
                            className={`h-4 w-4 shrink-0 ${
                              included
                                ? "text-gray-500"
                                : "text-gray-300"
                            }`}
                          />
                          <span>{t.featureLabels[key]}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={`/${locale}/espace-client/connexion`}
                    className={`mt-8 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-[var(--color-just-tag)] text-white hover:bg-[var(--color-just-tag-dark)] shadow-md"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {plan.highlighted ? t.ctaPopular : t.ctaChoose}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All plans include */}
      <section className="border-t bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-sm font-bold uppercase tracking-wider text-gray-500">
            {t.includedTitle}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {allFeatures.map(({ key, icon: FeatureIcon }) => (
              <div
                key={key}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-just-tag)]/10">
                  <FeatureIcon className="h-5 w-5 text-[var(--color-just-tag)]" />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {t.featureLabels[key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t.faqTitle}
            </h2>
            <p className="mt-3 text-gray-600">{t.faqSubtitle}</p>
          </div>
          <dl className="mt-10 space-y-6">
            {t.faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <dt className="text-base font-semibold text-gray-900">
                  {faq.q}
                </dt>
                <dd className="mt-2 text-sm text-gray-600">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
