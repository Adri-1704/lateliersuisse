import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Conditions générales - Just-Tag.app",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const content: Record<string, { title: string; sections: { heading: string; text: string }[] }> = {
    fr: {
      title: "Conditions générales d'utilisation",
      sections: [
        {
          heading: "1. Objet",
          text: "Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Just-Tag.app, un annuaire en ligne de restaurants en Suisse. En accédant au site, vous acceptez sans réserve les présentes CGU.",
        },
        {
          heading: "2. Définitions",
          text: "• « Plateforme » : le site web accessible à l'adresse just-tag.app et ses sous-domaines.\n• « Utilisateur » : toute personne accédant à la Plateforme.\n• « Restaurateur » : tout professionnel de la restauration disposant d'un compte sur la Plateforme.\n• « Contenu » : toute information, texte, image, avis ou donnée publiée sur la Plateforme.",
        },
        {
          heading: "3. Accès à la plateforme",
          text: "L'accès à la Plateforme est gratuit pour les Utilisateurs. La consultation des fiches de restaurants ne nécessite pas de création de compte. Just-Tag.app se réserve le droit de modifier, suspendre ou interrompre tout ou partie de la Plateforme à tout moment.",
        },
        {
          heading: "4. Compte restaurateur",
          text: "Les Restaurateurs peuvent créer un compte pour gérer leur fiche d'établissement. Le Restaurateur s'engage à :\n\n• Fournir des informations exactes et à jour.\n• Maintenir la confidentialité de ses identifiants de connexion.\n• Ne pas utiliser le compte à des fins frauduleuses ou contraires à la loi.\n\nJust-Tag.app se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes CGU.",
        },
        {
          heading: "5. Abonnements et paiements",
          text: "Certaines fonctionnalités avancées sont accessibles via un abonnement payant. Les tarifs sont indiqués sur la page dédiée. Les paiements sont traités de manière sécurisée par Stripe. Les abonnements sont renouvelés automatiquement sauf résiliation par le Restaurateur avant la date de renouvellement.\n\nLes conditions de résiliation et de remboursement sont les suivantes :\n• Résiliation possible à tout moment depuis l'espace client.\n• Accès maintenu jusqu'à la fin de la période payée.\n• Pas de remboursement au prorata pour la période en cours.",
        },
        {
          heading: "6. Contenu et propriété intellectuelle",
          text: "Le Restaurateur conserve la propriété de son Contenu (photos, descriptions, menus). En publiant du Contenu sur la Plateforme, le Restaurateur accorde à Just-Tag.app une licence non exclusive, gratuite et mondiale pour afficher, reproduire et distribuer ce Contenu dans le cadre du fonctionnement de la Plateforme.\n\nLe design, le code, les logos et les éléments graphiques de Just-Tag.app sont protégés par le droit d'auteur et ne peuvent être reproduits sans autorisation.",
        },
        {
          heading: "7. Avis des utilisateurs",
          text: "Les Utilisateurs peuvent publier des avis sur les restaurants. Ces avis doivent :\n\n• Être basés sur une expérience réelle.\n• Être respectueux et ne pas contenir de propos diffamatoires, injurieux ou discriminatoires.\n• Ne pas contenir de données personnelles de tiers.\n\nJust-Tag.app se réserve le droit de modérer et de supprimer tout avis ne respectant pas ces règles. Les Restaurateurs peuvent répondre aux avis via leur espace client.",
        },
        {
          heading: "8. Responsabilité",
          text: "Just-Tag.app agit en tant qu'intermédiaire technique et ne peut être tenu responsable :\n\n• De l'exactitude des informations fournies par les Restaurateurs.\n• De la qualité des prestations des restaurants référencés.\n• Des avis publiés par les Utilisateurs.\n• Des interruptions temporaires du service pour maintenance ou cas de force majeure.\n\nJust-Tag.app s'engage à mettre en œuvre les moyens raisonnables pour assurer la disponibilité et la sécurité de la Plateforme.",
        },
        {
          heading: "9. Protection des données",
          text: "Le traitement des données personnelles est régi par notre Politique de confidentialité, accessible sur la Plateforme. Just-Tag.app respecte la Loi fédérale sur la protection des données (LPD) et le Règlement général sur la protection des données (RGPD) pour les résidents de l'UE.",
        },
        {
          heading: "10. Droit applicable et juridiction",
          text: "Les présentes CGU sont régies par le droit suisse. Tout litige relatif à l'utilisation de la Plateforme sera soumis aux tribunaux compétents du canton de Vaud, Suisse.",
        },
        {
          heading: "11. Modifications des CGU",
          text: "Just-Tag.app se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur la Plateforme. L'utilisation continue de la Plateforme après modification vaut acceptation des nouvelles CGU.",
        },
        {
          heading: "12. Contact",
          text: "Pour toute question relative aux présentes CGU :\n\nE-mail : contact@just-tag.app\nSite web : just-tag.app",
        },
      ],
    },
    de: {
      title: "Allgemeine Geschäftsbedingungen",
      sections: [
        { heading: "1. Gegenstand", text: "Diese Allgemeinen Geschäftsbedingungen (AGB) regeln den Zugang und die Nutzung der Plattform Just-Tag.app, einem Online-Verzeichnis von Restaurants in der Schweiz." },
        { heading: "2. Zugang", text: "Der Zugang zur Plattform ist für Benutzer kostenlos. Just-Tag.app behält sich das Recht vor, die Plattform jederzeit zu ändern oder zu unterbrechen." },
        { heading: "3. Restaurateur-Konto", text: "Restaurateure können ein Konto erstellen, um ihre Restaurantseite zu verwalten. Sie verpflichten sich, korrekte Informationen anzugeben und ihre Zugangsdaten vertraulich zu behandeln." },
        { heading: "4. Anwendbares Recht", text: "Diese AGB unterliegen dem Schweizer Recht. Gerichtsstand ist der Kanton Waadt, Schweiz. Kontakt: contact@just-tag.app." },
      ],
    },
    en: {
      title: "Terms and Conditions",
      sections: [
        { heading: "1. Purpose", text: "These Terms and Conditions govern access to and use of the Just-Tag.app platform, an online restaurant directory in Switzerland." },
        { heading: "2. Access", text: "Access to the platform is free for users. Just-Tag.app reserves the right to modify or interrupt the platform at any time." },
        { heading: "3. Restaurant Accounts", text: "Restaurant owners can create an account to manage their listing. They agree to provide accurate information and keep their login credentials confidential." },
        { heading: "4. Applicable Law", text: "These Terms are governed by Swiss law. Jurisdiction is the Canton of Vaud, Switzerland. Contact: contact@just-tag.app." },
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
