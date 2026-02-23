"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    questionFr: "Comment trouver un restaurant sur Just-Tag ?",
    questionDe: "Wie finde ich ein Restaurant auf Just-Tag?",
    questionEn: "How do I find a restaurant on Just-Tag?",
    questionPt: "Como encontrar um restaurante no Just-Tag?",
    questionEs: "¿Cómo encontrar un restaurante en Just-Tag?",
    answerFr: "Utilisez notre barre de recherche en page d'accueil pour filtrer par canton, type de cuisine ou mot-cle. Vous pouvez aussi explorer par categorie de cuisine ou consulter nos restaurants du mois.",
    answerDe: "Nutzen Sie unsere Suchleiste auf der Startseite, um nach Kanton, Kuechenart oder Stichwort zu filtern. Sie koennen auch nach Kuechenkategorien durchstoeebern oder unsere Restaurants des Monats ansehen.",
    answerEn: "Use our search bar on the homepage to filter by canton, cuisine type or keyword. You can also browse by cuisine category or check out our restaurants of the month.",
    answerPt: "Use a nossa barra de pesquisa na página inicial para filtrar por cantão, tipo de cozinha ou palavra-chave. Também pode explorar por categoria de cozinha ou consultar os nossos restaurantes do mês.",
    answerEs: "Utilice nuestra barra de búsqueda en la página de inicio para filtrar por cantón, tipo de cocina o palabra clave. También puede explorar por categoría de cocina o consultar nuestros restaurantes del mes.",
  },
  {
    questionFr: "Comment inscrire mon restaurant sur la plateforme ?",
    questionDe: "Wie kann ich mein Restaurant auf der Plattform registrieren?",
    questionEn: "How can I register my restaurant on the platform?",
    questionPt: "Como inscrever o meu restaurante na plataforma?",
    questionEs: "¿Cómo registrar mi restaurante en la plataforma?",
    answerFr: "Contactez-nous directement pour obtenir le lien d'inscription. Nous proposons des abonnements mensuels, semestriels, annuels et a vie pour mettre en valeur votre etablissement.",
    answerDe: "Kontaktieren Sie uns direkt, um den Registrierungslink zu erhalten. Wir bieten monatliche, halbjaeehrliche, jaehrliche und lebenslange Abonnements an, um Ihre Einrichtung hervorzuheben.",
    answerEn: "Contact us directly to get the registration link. We offer monthly, semi-annual, annual and lifetime subscriptions to showcase your establishment.",
    answerPt: "Contacte-nos diretamente para obter o link de inscrição. Oferecemos assinaturas mensais, semestrais, anuais e vitalícias para destacar o seu estabelecimento.",
    answerEs: "Contáctenos directamente para obtener el enlace de registro. Ofrecemos suscripciones mensuales, semestrales, anuales y vitalicias para destacar su establecimiento.",
  },
  {
    questionFr: "Les avis sont-ils verifies ?",
    questionDe: "Werden die Bewertungen ueberprueft?",
    questionEn: "Are the reviews verified?",
    questionPt: "As avaliações são verificadas?",
    questionEs: "¿Las reseñas están verificadas?",
    answerFr: "Oui, tous les avis sont moderes par notre equipe pour garantir leur authenticite et leur fiabilite.",
    answerDe: "Ja, alle Bewertungen werden von unserem Team moderiert, um ihre Authentizitaet und Zuverlaessigkeit zu gewaehrleisten.",
    answerEn: "Yes, all reviews are moderated by our team to ensure their authenticity and reliability.",
    answerPt: "Sim, todas as avaliações são moderadas pela nossa equipa para garantir a sua autenticidade e fiabilidade.",
    answerEs: "Sí, todas las reseñas son moderadas por nuestro equipo para garantizar su autenticidad y fiabilidad.",
  },
  {
    questionFr: "Just-Tag couvre-t-il toute la Suisse ?",
    questionDe: "Deckt Just-Tag die gesamte Schweiz ab?",
    questionEn: "Does Just-Tag cover all of Switzerland?",
    questionPt: "O Just-Tag cobre toda a Suíça?",
    questionEs: "¿Just-Tag cubre toda Suiza?",
    answerFr: "Oui ! Just-Tag reference des restaurants dans les 26 cantons suisses, de Geneve a Zurich en passant par le Tessin et les Grisons.",
    answerDe: "Ja! Just-Tag listet Restaurants in allen 26 Schweizer Kantonen, von Genf ueber Zuerich bis zum Tessin und Graubuenden.",
    answerEn: "Yes! Just-Tag lists restaurants in all 26 Swiss cantons, from Geneva to Zurich, Ticino and Graubunden.",
    answerPt: "Sim! O Just-Tag lista restaurantes nos 26 cantões suíços, de Genebra a Zurique, passando pelo Ticino e Grisões.",
    answerEs: "¡Sí! Just-Tag lista restaurantes en los 26 cantones suizos, desde Ginebra hasta Zúrich, pasando por Tesino y Grisones.",
  },
  {
    questionFr: "Puis-je reserverf directement via Just-Tag ?",
    questionDe: "Kann ich direkt ueber Just-Tag reservieren?",
    questionEn: "Can I book directly through Just-Tag?",
    questionPt: "Posso reservar diretamente pelo Just-Tag?",
    questionEs: "¿Puedo reservar directamente a través de Just-Tag?",
    answerFr: "Pour le moment, Just-Tag vous fournit toutes les informations de contact du restaurant. Vous pouvez les appeler ou leur envoyer un email directement depuis la fiche du restaurant.",
    answerDe: "Derzeit stellt Just-Tag Ihnen alle Kontaktinformationen des Restaurants zur Verfuegung. Sie koennen sie anrufen oder ihnen direkt von der Restaurantseite aus eine E-Mail senden.",
    answerEn: "Currently, Just-Tag provides you with all the restaurant's contact information. You can call them or send them an email directly from the restaurant page.",
    answerPt: "Atualmente, o Just-Tag fornece-lhe todas as informações de contacto do restaurante. Pode ligar ou enviar um email diretamente a partir da ficha do restaurante.",
    answerEs: "Actualmente, Just-Tag le proporciona toda la información de contacto del restaurante. Puede llamar o enviar un correo electrónico directamente desde la ficha del restaurante.",
  },
];

export default function FAQPage() {
  const t = useTranslations("nav");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {t("faq")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Questions frequemment posees
        </p>
      </div>

      <div className="mt-12 space-y-3">
        {faqs.map((faq, index) => (
          <FAQItem key={index} faq={faq} />
        ))}
      </div>
    </div>
  );
}

function FAQItem({
  faq,
}: {
  faq: (typeof faqs)[number];
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Simple locale detection from URL
  const locale = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "fr";

  const questionMap: Record<string, string> = { de: faq.questionDe, en: faq.questionEn, pt: faq.questionPt, es: faq.questionEs };
  const answerMap: Record<string, string> = { de: faq.answerDe, en: faq.answerEn, pt: faq.answerPt, es: faq.answerEs };
  const question = questionMap[locale] || faq.questionFr;
  const answer = answerMap[locale] || faq.answerFr;

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-5">
          <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
