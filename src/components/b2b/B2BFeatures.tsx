"use client";

import { Store, Search, Camera, MessageSquare, BarChart3, Phone } from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Fiche professionnelle",
    desc: "Photos, menu, horaires, carte interactive. Votre vitrine en ligne, toujours à jour.",
  },
  {
    icon: Search,
    title: "SEO par canton",
    desc: "Votre restaurant apparait quand un client cherche \"restaurant [votre ville]\" sur Google.",
  },
  {
    icon: Camera,
    title: "Galerie photos et video",
    desc: "Montrez votre ambiance, vos plats, votre équipe. Jusqu'à 20 photos + 1 vidéo de présentation.",
  },
  {
    icon: MessageSquare,
    title: "Gestion des avis",
    desc: "Recevez des avis vérifiés, répondez-y, améliorez votre note. Tout depuis votre tableau de bord.",
  },
  {
    icon: BarChart3,
    title: "Statistiques de visites",
    desc: "Combien de personnes ont vu votre fiche, cliqué sur votre numéro, consulté votre menu. Chaque semaine.",
  },
  {
    icon: Phone,
    title: "Contact direct client",
    desc: "Les clients vous appellent ou vous écrivent sans intermédiaire. Pas de commission, pas de plateforme entre vous deux.",
  },
];

export function B2BFeatures() {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Tout ce qu&apos;il vous faut, rien de superflu
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Pas de gadgets inutiles. Des outils concrets pour remplir votre restaurant.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-just-tag)]/10">
                  <Icon className="h-6 w-6 text-[var(--color-just-tag)]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
