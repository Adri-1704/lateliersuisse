import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Mentions légales - Just-Tag.app",
};

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content: Record<string, { title: string; sections: { heading: string; text: string }[] }> = {
    fr: {
      title: "Mentions légales",
      sections: [
        {
          heading: "1. Éditeur du site",
          text: "Just-Tag.app\nPlateforme d'annuaire de restaurants en Suisse\n\nE-mail : contact@just-tag.app\nSite web : just-tag.app\nPays : Suisse",
        },
        {
          heading: "2. Hébergement",
          text: "Le site Just-Tag.app est hébergé par :\n\nVercel Inc.\n340 S Lemon Ave #4133\nWalnut, CA 91789, États-Unis\nSite web : vercel.com\n\nLa base de données est hébergée par :\n\nSupabase Inc.\nSan Francisco, CA, États-Unis\nSite web : supabase.com\nServeurs de données : Europe (AWS eu-central-1)",
        },
        {
          heading: "3. Propriété intellectuelle",
          text: "L'ensemble du contenu du site Just-Tag.app (design, logos, textes, code source, éléments graphiques) est protégé par le droit d'auteur suisse et les conventions internationales applicables.\n\nToute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie du site est interdite et constitue une contrefaçon sanctionnée par le droit suisse.\n\nLe nom « Just-Tag » et le logo associé sont des marques de Just-Tag.app. Leur utilisation sans autorisation préalable est interdite.",
        },
        {
          heading: "4. Contenu des restaurants",
          text: "Les informations relatives aux restaurants (descriptions, menus, photos, horaires) sont fournies par les restaurateurs eux-mêmes ou collectées depuis des sources publiques. Just-Tag.app s'efforce de garantir l'exactitude de ces informations mais ne peut en être tenu responsable.\n\nLes restaurateurs sont responsables de la mise à jour de leurs informations via leur espace client.",
        },
        {
          heading: "5. Avis et commentaires",
          text: "Les avis publiés sur la plateforme reflètent l'opinion personnelle de leurs auteurs et n'engagent pas Just-Tag.app. Nous nous réservons le droit de modérer et de supprimer tout contenu contraire à nos conditions générales d'utilisation.\n\nPour signaler un avis inapproprié, contactez-nous à contact@just-tag.app.",
        },
        {
          heading: "6. Liens hypertextes",
          text: "Le site Just-Tag.app peut contenir des liens vers des sites tiers (sites de restaurants, réseaux sociaux, etc.). Just-Tag.app n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques en matière de protection des données.",
        },
        {
          heading: "7. Protection des données",
          text: "Le traitement des données personnelles est détaillé dans notre Politique de confidentialité. Just-Tag.app respecte la Loi fédérale suisse sur la protection des données (LPD) révisée, entrée en vigueur le 1er septembre 2023, ainsi que le RGPD pour les utilisateurs résidant dans l'Union européenne.",
        },
        {
          heading: "8. Cookies",
          text: "Le site utilise des cookies essentiels au fonctionnement de la plateforme et des cookies analytiques pour améliorer l'expérience utilisateur. Pour plus d'informations, consultez notre Politique de confidentialité.",
        },
        {
          heading: "9. Limitation de responsabilité",
          text: "Just-Tag.app met tout en œuvre pour assurer l'exactitude et la mise à jour des informations diffusées sur le site. Toutefois, Just-Tag.app ne peut garantir l'exactitude, la complétude ou l'actualité des informations et décline toute responsabilité pour :\n\n• Les erreurs ou omissions dans le contenu.\n• Les dommages résultant de l'utilisation ou de l'impossibilité d'utiliser le site.\n• Les interruptions temporaires du service.\n• Les actes de tiers (piratage, virus, etc.).",
        },
        {
          heading: "10. Droit applicable",
          text: "Les présentes mentions légales sont régies par le droit suisse. Tout litige sera soumis à la compétence exclusive des tribunaux du canton de Vaud, Suisse.",
        },
        {
          heading: "11. Contact",
          text: "Pour toute question relative aux présentes mentions légales :\n\nE-mail : contact@just-tag.app\nSite web : just-tag.app",
        },
      ],
    },
    de: {
      title: "Impressum",
      sections: [
        { heading: "1. Herausgeber", text: "Just-Tag.app\nOnline-Restaurantverzeichnis der Schweiz\n\nE-Mail: contact@just-tag.app\nWebsite: just-tag.app\nLand: Schweiz" },
        { heading: "2. Hosting", text: "Website: Vercel Inc., Walnut, CA, USA\nDatenbank: Supabase Inc., San Francisco, CA, USA (Server in Europa)" },
        { heading: "3. Geistiges Eigentum", text: "Alle Inhalte von Just-Tag.app (Design, Logos, Texte, Quellcode) sind durch das Schweizer Urheberrecht geschützt. Jede nicht autorisierte Nutzung ist untersagt." },
        { heading: "4. Anwendbares Recht", text: "Dieses Impressum unterliegt dem Schweizer Recht. Gerichtsstand: Kanton Waadt, Schweiz. Kontakt: contact@just-tag.app." },
      ],
    },
    en: {
      title: "Legal Notice",
      sections: [
        { heading: "1. Publisher", text: "Just-Tag.app\nOnline restaurant directory in Switzerland\n\nEmail: contact@just-tag.app\nWebsite: just-tag.app\nCountry: Switzerland" },
        { heading: "2. Hosting", text: "Website: Vercel Inc., Walnut, CA, USA\nDatabase: Supabase Inc., San Francisco, CA, USA (European servers)" },
        { heading: "3. Intellectual Property", text: "All content on Just-Tag.app (design, logos, text, source code) is protected by Swiss copyright law. Unauthorized use is prohibited." },
        { heading: "4. Applicable Law", text: "This legal notice is governed by Swiss law. Jurisdiction: Canton of Vaud, Switzerland. Contact: contact@just-tag.app." },
      ],
    },
  };

  const c = content[locale] || content.fr;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">{c.title}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {locale === "de" ? "Letzte Aktualisierung: März 2026" : locale === "en" ? "Last updated: March 2026" : "Dernière mise à jour : Mars 2026"}
      </p>
      <div className="mt-8 space-y-8">
        {c.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-gray-900">{section.heading}</h2>
            <p className="mt-2 whitespace-pre-line text-gray-600 leading-relaxed">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
