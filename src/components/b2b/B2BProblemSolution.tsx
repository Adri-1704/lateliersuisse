"use client";

import { AlertTriangle, CheckCircle2, ArrowRight, Eye, Banknote, MessageSquare } from "lucide-react";

const painPoints = [
  {
    icon: Eye,
    problem: {
      title: "Invisibilité en ligne",
      text: "Votre restaurant est noyé parmi des milliers sur Google. Pas de photos mises en valeur, pas de menu lisible, pas de fiche qui donne envie. Les clients passent à côté.",
    },
    solution: {
      title: "Fiche professionnelle optimisée",
      text: "Une fiche professionnelle optimisée pour le SEO, avec vos photos, votre menu, vos horaires. Vous apparaissez dans les recherches locales en 5 langues — y compris pour les touristes.",
    },
  },
  {
    icon: Banknote,
    problem: {
      title: "Les plateformes prennent une commission",
      text: "Les plateformes à commission prennent entre 15% et 30% par commande ou réservation. Sur un plat à CHF 25, vous perdez jusqu'à CHF 7.50. Ça s'accumule vite.",
    },
    solution: {
      title: "Zéro commission, zéro frais cachés",
      text: "Les clients vous contactent directement par téléphone ou email. Vous ne payez qu'un abonnement fixe à partir de CHF 24.90/mois — vous savez exactement ce que ça coûte.",
    },
  },
  {
    icon: MessageSquare,
    problem: {
      title: "Avis incontrolables",
      text: "Sur les plateformes génériques, n'importe qui peut poster un avis, même quelqu'un qui n'a jamais mis les pieds chez vous. Et répondre est compliqué.",
    },
    solution: {
      title: "Avis vérifiés et modérés",
      text: "Nos avis sont vérifiés et modérés. Vous pouvez répondre à chaque avis depuis votre tableau de bord. Votre note reflète vraiment la qualité de votre cuisine.",
    },
  },
];

export function B2BProblemSolution() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Vous avez un super restaurant,
            <br />
            <span className="text-[var(--color-just-tag)]">
              à nous de le mettre en lumière.
            </span>
          </h2>
        </div>

        <div className="mt-16 space-y-12">
          {painPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center"
              >
                {/* Problem */}
                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-red-900">
                      {item.problem.title}
                    </h3>
                  </div>
                  <p className="text-sm text-red-800/80 leading-relaxed">
                    {item.problem.text}
                  </p>
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-just-tag)]">
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex lg:hidden items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-just-tag)]">
                    <ArrowRight className="h-4 w-4 text-white rotate-90" />
                  </div>
                </div>

                {/* Solution */}
                <div className="rounded-2xl border border-green-100 bg-green-50/50 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-900">
                      {item.solution.title}
                    </h3>
                  </div>
                  <p className="text-sm text-green-800/80 leading-relaxed">
                    {item.solution.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
