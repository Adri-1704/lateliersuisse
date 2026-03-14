import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos - Just-Tag.ch",
  description:
    "Découvrez Just-Tag.ch, la plateforme suisse de référence pour trouver les meilleurs restaurants dans les 26 cantons de Suisse.",
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
        "Just-Tag.ch est une plateforme suisse, conçue en Suisse, pour la Suisse. Notre ambition est simple : vous aider à découvrir les meilleures tables du pays, du Léman au lac de Constance, des sommets alpins aux rives du Rhin.",
      missionTitle: "Notre mission",
      missionText:
        "La Suisse regorge de restaurants exceptionnels, mais il n'est pas toujours facile de les trouver. Just-Tag.ch a pour mission de mettre en lumière la richesse gastronomique des 26 cantons suisses. Que vous cherchiez une auberge de montagne authentique dans les Grisons, un bistrot branché à Zurich ou une table étoilée à Genève, nous sommes là pour vous guider.",
      howTitle: "Comment ça fonctionne",
      dinersTitle: "Pour les gourmets",
      dinersItems: [
        "Explorez des restaurants dans toute la Suisse, par canton, type de cuisine ou ambiance.",
        "Consultez des fiches détaillées avec menus, horaires, photos et avis.",
        "Enregistrez vos restaurants favoris et partagez vos découvertes.",
      ],
      restaurantsTitle: "Pour les restaurateurs",
      restaurantsItems: [
        "Créez une fiche complète pour présenter votre établissement.",
        "Gagnez en visibilité auprès de milliers de gourmets suisses.",
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
          name: "Identité suisse",
          description:
            "Nous célébrons la diversité culinaire de la Suisse et ses traditions régionales, du rösti bernois à la fondue vaudoise.",
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
        "Just-Tag.ch ist eine Schweizer Plattform, entwickelt in der Schweiz, für die Schweiz. Unser Ziel ist einfach: Ihnen zu helfen, die besten Restaurants des Landes zu entdecken — vom Genfersee bis zum Bodensee, von den Alpengipfeln bis zu den Ufern des Rheins.",
      missionTitle: "Unsere Mission",
      missionText:
        "Die Schweiz steckt voller aussergewöhnlicher Restaurants, doch es ist nicht immer einfach, sie zu finden. Just-Tag.ch hat es sich zur Aufgabe gemacht, den gastronomischen Reichtum aller 26 Schweizer Kantone sichtbar zu machen. Ob Sie ein authentisches Berggasthaus in Graubünden, ein trendiges Bistro in Zürich oder ein Sternerestaurant in Genf suchen — wir begleiten Sie.",
      howTitle: "So funktioniert's",
      dinersTitle: "Für Feinschmecker",
      dinersItems: [
        "Entdecken Sie Restaurants in der ganzen Schweiz — nach Kanton, Küche oder Ambiente.",
        "Sehen Sie detaillierte Profile mit Menüs, Öffnungszeiten, Fotos und Bewertungen.",
        "Speichern Sie Ihre Lieblingsrestaurants und teilen Sie Ihre Entdeckungen.",
      ],
      restaurantsTitle: "Für Restaurantbesitzer",
      restaurantsItems: [
        "Erstellen Sie ein vollständiges Profil für Ihr Restaurant.",
        "Gewinnen Sie Sichtbarkeit bei Tausenden von Schweizer Feinschmeckern.",
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
          name: "Schweizer Identität",
          description:
            "Wir feiern die kulinarische Vielfalt der Schweiz und ihre regionalen Traditionen — von Berner Rösti bis Waadtländer Fondue.",
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
        "Just-Tag.ch is a Swiss platform, built in Switzerland, for Switzerland. Our ambition is simple: help you discover the finest restaurants across the country — from Lake Geneva to Lake Constance, from Alpine peaks to the banks of the Rhine.",
      missionTitle: "Our mission",
      missionText:
        "Switzerland is home to exceptional restaurants, but they are not always easy to find. Just-Tag.ch's mission is to showcase the gastronomic richness of all 26 Swiss cantons. Whether you're looking for an authentic mountain inn in Graubünden, a trendy bistro in Zurich, or a Michelin-starred table in Geneva, we're here to guide you.",
      howTitle: "How it works",
      dinersTitle: "For diners",
      dinersItems: [
        "Explore restaurants across Switzerland by canton, cuisine type, or ambiance.",
        "View detailed profiles with menus, opening hours, photos, and reviews.",
        "Save your favourite restaurants and share your discoveries.",
      ],
      restaurantsTitle: "For restaurant owners",
      restaurantsItems: [
        "Create a complete profile to showcase your establishment.",
        "Gain visibility among thousands of Swiss food lovers.",
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
          name: "Swiss identity",
          description:
            "We celebrate Switzerland's culinary diversity and regional traditions — from Bernese rösti to Vaudois fondue.",
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
