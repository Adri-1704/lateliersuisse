import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité - Just-Tag.ch",
};

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content: Record<string, { title: string; sections: { heading: string; text: string }[] }> = {
    fr: {
      title: "Politique de confidentialité",
      sections: [
        {
          heading: "1. Introduction",
          text: "Just-Tag.ch (ci-après « nous », « notre » ou « Just-Tag ») accorde une grande importance à la protection de vos données personnelles. La présente politique de confidentialité décrit la manière dont nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme accessible à l'adresse just-tag.ch.",
        },
        {
          heading: "2. Responsable du traitement",
          text: "Le responsable du traitement des données est Just-Tag.ch, opéré depuis la Suisse. Pour toute question relative à la protection des données, vous pouvez nous contacter à l'adresse : contact@just-tag.ch.",
        },
        {
          heading: "3. Données collectées",
          text: "Nous collectons les données suivantes :\n\n• Données de compte : nom, prénom, adresse e-mail, numéro de téléphone lors de l'inscription en tant que restaurateur.\n• Données de navigation : adresse IP, type de navigateur, pages consultées, durée de visite via des cookies analytiques.\n• Données de restaurant : informations sur l'établissement (nom, adresse, horaires, menu, photos) fournies volontairement par les restaurateurs.\n• Avis et commentaires : nom d'auteur et contenu des avis publiés sur la plateforme.\n• Données de contact : informations transmises via nos formulaires de contact ou d'inscription B2B.\n• Données de newsletter : adresse e-mail et préférence de langue.",
        },
        {
          heading: "4. Finalités du traitement",
          text: "Vos données sont traitées pour les finalités suivantes :\n\n• Fournir et améliorer nos services de référencement de restaurants.\n• Gérer les comptes restaurateurs et les abonnements.\n• Afficher les informations des restaurants aux visiteurs.\n• Envoyer des communications marketing (newsletter) avec votre consentement.\n• Répondre à vos demandes de contact.\n• Analyser l'utilisation de la plateforme pour l'améliorer.\n• Respecter nos obligations légales.",
        },
        {
          heading: "5. Base légale du traitement",
          text: "Le traitement de vos données repose sur :\n\n• Votre consentement (newsletter, cookies non essentiels).\n• L'exécution d'un contrat (gestion de compte restaurateur, abonnement).\n• Nos intérêts légitimes (amélioration du service, statistiques anonymisées).\n• Le respect d'obligations légales.",
        },
        {
          heading: "6. Partage des données",
          text: "Nous ne vendons jamais vos données personnelles. Nous pouvons les partager avec :\n\n• Supabase (hébergement de la base de données, serveurs en Europe).\n• Vercel (hébergement du site web).\n• Stripe (traitement des paiements pour les abonnements restaurateurs).\n• Des autorités compétentes si la loi l'exige.",
        },
        {
          heading: "7. Durée de conservation",
          text: "Vos données sont conservées aussi longtemps que nécessaire pour les finalités décrites ci-dessus :\n\n• Données de compte : durée de l'abonnement + 1 an après la suppression du compte.\n• Données de navigation : 26 mois maximum.\n• Avis publiés : durée indéterminée (sauf demande de suppression).\n• Données de contact : 3 ans après le dernier échange.",
        },
        {
          heading: "8. Vos droits",
          text: "Conformément à la Loi fédérale sur la protection des données (LPD) et au RGPD (pour les résidents de l'UE), vous disposez des droits suivants :\n\n• Droit d'accès : obtenir une copie de vos données personnelles.\n• Droit de rectification : corriger des données inexactes.\n• Droit à l'effacement : demander la suppression de vos données.\n• Droit à la portabilité : recevoir vos données dans un format structuré.\n• Droit d'opposition : vous opposer au traitement de vos données.\n• Droit de retrait du consentement : retirer votre consentement à tout moment.\n\nPour exercer ces droits, contactez-nous à : contact@just-tag.ch.",
        },
        {
          heading: "9. Cookies",
          text: "Notre site utilise des cookies essentiels au fonctionnement de la plateforme ainsi que des cookies analytiques pour comprendre comment le site est utilisé. Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.",
        },
        {
          heading: "10. Sécurité",
          text: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, toute modification, divulgation ou destruction. Les connexions sont chiffrées via HTTPS et l'accès aux données est restreint au personnel autorisé.",
        },
        {
          heading: "11. Modifications",
          text: "Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec une date de mise à jour. Nous vous encourageons à consulter régulièrement cette page.",
        },
        {
          heading: "12. Contact",
          text: "Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez-nous :\n\nE-mail : contact@just-tag.ch\nSite web : just-tag.ch",
        },
      ],
    },
    de: {
      title: "Datenschutzrichtlinie",
      sections: [
        { heading: "1. Einleitung", text: "Just-Tag.ch legt grossen Wert auf den Schutz Ihrer persönlichen Daten. Diese Datenschutzrichtlinie beschreibt, wie wir Ihre Informationen bei der Nutzung unserer Plattform just-tag.ch erfassen, verwenden und schützen." },
        { heading: "2. Verantwortlicher", text: "Der Verantwortliche für die Datenverarbeitung ist Just-Tag.ch, betrieben in der Schweiz. Kontakt: contact@just-tag.ch." },
        { heading: "3. Erhobene Daten", text: "Wir erheben: Kontodaten (Name, E-Mail, Telefon), Navigationsdaten (IP, Browser, besuchte Seiten), Restaurantdaten, Bewertungen, Kontaktformulardaten und Newsletter-Daten." },
        { heading: "4. Ihre Rechte", text: "Gemäss dem Schweizer Datenschutzgesetz (DSG) und der DSGVO haben Sie das Recht auf Auskunft, Berichtigung, Löschung, Datenübertragbarkeit und Widerspruch. Kontakt: contact@just-tag.ch." },
      ],
    },
    en: {
      title: "Privacy Policy",
      sections: [
        { heading: "1. Introduction", text: "Just-Tag.ch values the protection of your personal data. This privacy policy describes how we collect, use and protect your information when you use our platform at just-tag.ch." },
        { heading: "2. Data Controller", text: "The data controller is Just-Tag.ch, operated from Switzerland. Contact: contact@just-tag.ch." },
        { heading: "3. Data Collected", text: "We collect: account data (name, email, phone), browsing data (IP, browser, pages visited), restaurant data, reviews, contact form data and newsletter data." },
        { heading: "4. Your Rights", text: "Under the Swiss Data Protection Act (FADP) and GDPR (for EU residents), you have the right to access, rectify, erase, port and object to the processing of your data. Contact: contact@just-tag.ch." },
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
