import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos - Just-Tag.ch",
  description:
    "Découvrez Just-Tag.ch, la plateforme de référence pour trouver les meilleurs restaurants de Suisse Romande.",
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content: Record<
    string,
    {
      title: string;
      intro: string;
      missionTitle: string;
      missionText: string;
      howTitle: string;
      dinersTitle: string;
      dinersItems: string[];
      restaurantsTitle: string;
      restaurantsItems: string[];
      valuesTitle: string;
      values: { name: string; description: string }[];
      ctaTitle: string;
      ctaText: string;
      ctaButton: string;
    }
  > = {
    fr: {
      title: "À propos de Just-Tag.ch",
      intro:
        "Just-Tag.ch est une plateforme romande, conçue en Suisse Romande, pour la Suisse Romande. Notre ambition est simple : vous aider à découvrir les meilleures tables de la région, du Léman au lac de Neuchâtel, des sommets alpins aux vignobles du Lavaux.",
      missionTitle: "Notre mission",
      missionText:
        "La Suisse Romande regorge de restaurants exceptionnels, mais il n'est pas toujours facile de les trouver. Just-Tag.ch a pour mission de mettre en lumière la richesse gastronomique des 7 cantons romands. Que vous cherchiez un chalet d'alpage authentique en Valais, un bistrot branché à Lausanne ou une table étoilée à Genève, nous sommes là pour vous guider.",
      howTitle: "Comment ça fonctionne",
      dinersTitle: "Pour les gourmets",
      dinersItems: [
        "Explorez des restaurants dans toute la Suisse Romande, par canton, type de cuisine ou ambiance.",
        "Consultez des fiches détaillées avec menus, horaires, photos et avis.",
        "Enregistrez vos restaurants favoris et partagez vos découvertes.",
      ],
      restaurantsTitle: "Pour les restaurateurs",
      restaurantsItems: [
        "Créez une fiche complète pour présenter votre établissement.",
        "Gagnez en visibilité auprès de milliers de gourmets romands.",
        "Accédez à des outils marketing pour développer votre clientèle.",
      ],
      valuesTitle: "Nos valeurs",
      values: [
        {
          name: "Qualité",
          description:
            "Nous sélectionnons et vérifions chaque restaurant pour garantir une expérience fiable à nos utilisateurs.",
        },
        {
          name: "Transparence",
          description:
            "Des informations claires, des avis authentiques et aucun classement payant. Ce que vous voyez est ce que vous obtenez.",
        },
        {
          name: "Identité romande",
          description:
            "Nous célébrons la diversité culinaire de la Suisse Romande et ses traditions régionales, de la fondue fribourgeoise à la raclette valaisanne.",
        },
      ],
      ctaTitle: "Vous êtes restaurateur ?",
      ctaText:
        "Rejoignez Just-Tag.ch et donnez à votre restaurant la visibilité qu'il mérite. L'inscription est simple et rapide.",
      ctaButton: "Inscrire mon restaurant",
    },
    de: {
      title: "Über Just-Tag.ch",
      intro:
        "Just-Tag.ch ist eine Westschweizer Plattform, entwickelt in der Romandie, für die Romandie. Unser Ziel ist einfach: Ihnen zu helfen, die besten Restaurants der Westschweiz zu entdecken — vom Genfersee bis zum Neuenburgersee, von den Alpengipfeln bis zu den Weinbergen des Lavaux.",
      missionTitle: "Unsere Mission",
      missionText:
        "Die Westschweiz steckt voller aussergewöhnlicher Restaurants, doch es ist nicht immer einfach, sie zu finden. Just-Tag.ch hat es sich zur Aufgabe gemacht, den gastronomischen Reichtum der 7 Westschweizer Kantone sichtbar zu machen. Ob Sie eine authentische Alphütte im Wallis, ein trendiges Bistro in Lausanne oder ein Sternerestaurant in Genf suchen — wir begleiten Sie.",
      howTitle: "So funktioniert's",
      dinersTitle: "Für Feinschmecker",
      dinersItems: [
        "Entdecken Sie Restaurants in der Westschweiz — nach Kanton, Küche oder Ambiente.",
        "Sehen Sie detaillierte Profile mit Menüs, Öffnungszeiten, Fotos und Bewertungen.",
        "Speichern Sie Ihre Lieblingsrestaurants und teilen Sie Ihre Entdeckungen.",
      ],
      restaurantsTitle: "Für Restaurantbesitzer",
      restaurantsItems: [
        "Erstellen Sie ein vollständiges Profil für Ihr Restaurant.",
        "Gewinnen Sie Sichtbarkeit bei Tausenden von Westschweizer Feinschmeckern.",
        "Nutzen Sie Marketing-Tools, um Ihre Kundschaft zu erweitern.",
      ],
      valuesTitle: "Unsere Werte",
      values: [
        {
          name: "Qualität",
          description:
            "Wir prüfen jedes Restaurant sorgfältig, um unseren Nutzern ein zuverlässiges Erlebnis zu bieten.",
        },
        {
          name: "Transparenz",
          description:
            "Klare Informationen, authentische Bewertungen und keine bezahlten Rankings. Was Sie sehen, ist was Sie bekommen.",
        },
        {
          name: "Westschweizer Identität",
          description:
            "Wir feiern die kulinarische Vielfalt der Westschweiz und ihre regionalen Traditionen — von Freiburger Fondue bis Walliser Raclette.",
        },
      ],
      ctaTitle: "Sind Sie Restaurantbesitzer?",
      ctaText:
        "Treten Sie Just-Tag.ch bei und geben Sie Ihrem Restaurant die Sichtbarkeit, die es verdient. Die Anmeldung ist einfach und schnell.",
      ctaButton: "Mein Restaurant eintragen",
    },
    en: {
      title: "About Just-Tag.ch",
      intro:
        "Just-Tag.ch is a Western Swiss platform, built in the Romandie, for the Romandie. Our ambition is simple: help you discover the finest restaurants across Western Switzerland — from Lake Geneva to Lake Neuchatel, from Alpine peaks to the Lavaux vineyards.",
      missionTitle: "Our mission",
      missionText:
        "Western Switzerland is home to exceptional restaurants, but they are not always easy to find. Just-Tag.ch's mission is to showcase the gastronomic richness of the 7 Romand cantons. Whether you're looking for an authentic Alpine chalet in Valais, a trendy bistro in Lausanne, or a Michelin-starred table in Geneva, we're here to guide you.",
      howTitle: "How it works",
      dinersTitle: "For diners",
      dinersItems: [
        "Explore restaurants across Western Switzerland by canton, cuisine type, or ambiance.",
        "View detailed profiles with menus, opening hours, photos, and reviews.",
        "Save your favourite restaurants and share your discoveries.",
      ],
      restaurantsTitle: "For restaurant owners",
      restaurantsItems: [
        "Create a complete profile to showcase your establishment.",
        "Gain visibility among thousands of Western Swiss food lovers.",
        "Access marketing tools to grow your customer base.",
      ],
      valuesTitle: "Our values",
      values: [
        {
          name: "Quality",
          description:
            "We carefully vet every restaurant to ensure a reliable experience for our users.",
        },
        {
          name: "Transparency",
          description:
            "Clear information, authentic reviews, and no paid rankings. What you see is what you get.",
        },
        {
          name: "Romand identity",
          description:
            "We celebrate Western Switzerland's culinary diversity and regional traditions — from Fribourg fondue to Valais raclette.",
        },
      ],
      ctaTitle: "Are you a restaurant owner?",
      ctaText:
        "Join Just-Tag.ch and give your restaurant the visibility it deserves. Registration is simple and fast.",
      ctaButton: "Register my restaurant",
    },
  };

  const c = content[locale] || content.fr;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">{c.title}</h1>
      <p className="mt-4 text-lg text-gray-600 leading-relaxed">{c.intro}</p>

      {/* Mission */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900">
          {c.missionTitle}
        </h2>
        <p className="mt-3 text-gray-600 leading-relaxed">{c.missionText}</p>
      </div>

      {/* How it works */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900">{c.howTitle}</h2>

        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {/* For diners */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {c.dinersTitle}
            </h3>
            <ul className="mt-4 space-y-3">
              {c.dinersItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-just-tag)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* For restaurants */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {c.restaurantsTitle}
            </h3>
            <ul className="mt-4 space-y-3">
              {c.restaurantsItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-just-tag)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900">
          {c.valuesTitle}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {c.values.map((value, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h3 className="font-semibold text-gray-900">{value.name}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-xl bg-[var(--color-just-tag)] p-8 text-center text-white">
        <h2 className="text-2xl font-bold">{c.ctaTitle}</h2>
        <p className="mt-3 text-white/90">{c.ctaText}</p>
        <Link
          href={`/${locale}/pour-restaurateurs`}
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-[var(--color-just-tag)] transition-colors hover:bg-gray-100"
        >
          {c.ctaButton}
        </Link>
      </div>
    </div>
  );
}
