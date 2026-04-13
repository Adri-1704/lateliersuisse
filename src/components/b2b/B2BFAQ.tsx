"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    question: "Combien ca me rapporte concretement ?",
    answer:
      "Difficile de promettre un chiffre exact — ca depend de votre emplacement, votre type de cuisine et votre prix moyen. Ce qu'on sait : les restaurants avec une fiche complete (photos, menu, horaires a jour) sur Just-Tag recoivent en moyenne plus de visites que ceux sans fiche. A CHF 24.90/mois, il suffit d'un seul client supplementaire par mois pour rentabiliser votre abonnement. (Estimation basee sur un panier moyen de CHF 30-40 en restauration romande.)",
  },
  {
    question: "Comment vous verifiez que je suis bien le proprietaire ?",
    answer:
      "Lors de votre inscription, vous renseignez le nom et la ville de votre restaurant. Notre equipe verifie ensuite manuellement que les informations correspondent avant d'activer votre acces au tableau de bord. Si votre restaurant est deja dans notre base, vous pourrez le reclamer directement.",
  },
  {
    question: "Je peux annuler quand je veux ?",
    answer:
      "Oui. Le plan mensuel est sans engagement. Vous annulez depuis votre espace client, sans justification, et ca prend effet a la fin du mois en cours. Les plans semestriel et annuel sont factures en une fois ; en cas d'annulation, votre acces reste actif jusqu'a la fin de la periode payee.",
  },
  {
    question: "Vous prenez une commission sur mes reservations ?",
    answer:
      "Non. Zero commission, zero frais de transaction. Les clients vous contactent directement (telephone, email). Vous ne payez que votre abonnement mensuel, semestriel ou annuel. C'est tout.",
  },
  {
    question: "Mes donnees appartiennent a qui ?",
    answer:
      "A vous. Vos photos, votre menu, vos textes restent votre propriete. Si vous resiliez, on supprime votre fiche et vos donnees. L'hebergement est en Suisse, conforme a la loi federale sur la protection des donnees (LPD) et au RGPD.",
  },
  {
    question:
      "Quelle difference avec les plateformes a commission ou les annuaires generiques ?",
    answer:
      "Les annuaires generiques offrent une fiche basique : pas de menu lisible, photos mal mises en valeur, avis non moderes. Les plateformes a commission prennent 2 a 5 EUR par couvert reserve. Just-Tag combine une fiche professionnelle complete, des avis verifies, zero commission, et un positionnement SEO local en 5 langues. Le tout pour un prix fixe previsible.",
  },
  {
    question: "Je peux essayer gratuitement ?",
    answer:
      "Oui. Tous les plans incluent 14 jours d'essai gratuit. Vous renseignez vos coordonnees bancaires a l'inscription (c'est Stripe, c'est securise), mais vous n'etes debite qu'au 15e jour. Si vous annulez avant, zero frais.",
  },
  {
    question: "Que se passe-t-il apres les 14 jours ?",
    answer:
      "Votre abonnement demarre automatiquement. Vous recevez un email de confirmation avec votre facture. Si vous avez choisi le plan mensuel, vous pouvez toujours annuler a tout moment. Si vous avez choisi semestriel ou annuel, vous beneficiez du tarif reduit pour toute la periode.",
  },
];

export function B2BFAQ() {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Vos questions, nos reponses
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
