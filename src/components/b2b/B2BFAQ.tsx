"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    question: "Combien ça me rapporte concrètement ?",
    answer:
      "Difficile de promettre un chiffre exact — ça dépend de votre emplacement, votre type de cuisine et votre prix moyen. Ce qu'on sait : les restaurants avec une fiche complète (photos, menu, horaires à jour) sur Just-Tag reçoivent en moyenne plus de visites que ceux sans fiche. À CHF 24.90/mois, il suffit d'un seul client supplémentaire par mois pour rentabiliser votre abonnement. (Estimation basée sur un panier moyen de CHF 30-40 en restauration romande.)",
  },
  {
    question: "Comment vous vérifiez que je suis bien le propriétaire ?",
    answer:
      "Lors de votre inscription, vous renseignez le nom et la ville de votre restaurant. Notre équipe vérifie ensuite manuellement que les informations correspondent avant d'activer votre accès au tableau de bord. Si votre restaurant est déjà dans notre base, vous pourrez le réclamer directement.",
  },
  {
    question: "Je peux annuler quand je veux ?",
    answer:
      "Oui. Le plan mensuel est sans engagement. Vous annulez depuis votre espace client, sans justification, et ça prend effet à la fin du mois en cours. Les plans semestriel et annuel sont facturés en une fois ; en cas d'annulation, votre accès reste actif jusqu'à la fin de la période payée.",
  },
  {
    question: "Vous prenez une commission sur mes réservations ?",
    answer:
      "Non. Zéro commission, zéro frais de transaction. Les clients vous contactent directement (téléphone, email). Vous ne payez que votre abonnement mensuel, semestriel ou annuel. C'est tout.",
  },
  {
    question: "Mes données appartiennent à qui ?",
    answer:
      "À vous. Vos photos, votre menu, vos textes restent votre propriété. Si vous résiliez, on supprime votre fiche et vos données. L'hébergement est en Suisse, conforme à la loi fédérale sur la protection des données (LPD) et au RGPD.",
  },
  {
    question:
      "Quelle différence avec les plateformes à commission ou les annuaires génériques ?",
    answer:
      "Les annuaires génériques offrent une fiche basique : pas de menu lisible, photos mal mises en valeur, avis non modérés. Les plateformes à commission prennent 2 à 5 EUR par couvert réservé. Just-Tag combine une fiche professionnelle complète, des avis vérifiés, zéro commission, et un positionnement SEO local en 5 langues. Le tout pour un prix fixe prévisible.",
  },
  {
    question: "Je peux essayer gratuitement ?",
    answer:
      "Oui. Tous les plans incluent 14 jours d'essai gratuit. Vous renseignez vos coordonnées bancaires à l'inscription (c'est Stripe, c'est sécurisé), mais vous n'êtes débité qu'au 15e jour. Si vous annulez avant, zéro frais.",
  },
  {
    question: "Que se passe-t-il après les 14 jours ?",
    answer:
      "Votre abonnement démarre automatiquement. Vous recevez un email de confirmation avec votre facture. Si vous avez choisi le plan mensuel, vous pouvez toujours annuler à tout moment. Si vous avez choisi semestriel ou annuel, vous bénéficiez du tarif réduit pour toute la période.",
  },
];

export function B2BFAQ() {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Vos questions, nos réponses
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqItems.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="pr-4 font-medium text-gray-900">{question}</span>
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
