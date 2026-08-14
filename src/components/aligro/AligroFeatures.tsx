import { Store, Search, Camera, MessageSquare, BarChart3, Phone, Sparkles, MessageCircle } from "lucide-react";

/**
 * Variante Aligro de B2BFeatures : structure et styles identiques, mais
 * copie en dur reformulée pour parler d'"établissement" (restaurants, bars,
 * cafés, traiteurs…) plutôt que de "restaurant/restaurateur", en cohérence
 * avec le hero Aligro. Contenu 100% en français en dur, comme le reste de la
 * page /fr/clients-aligro.
 */
const features = [
  {
    icon: MessageCircle,
    title: "Marketing WhatsApp",
    desc: "Envoyez vos offres du moment, votre carte du jour et vos événements directement sur le téléphone de vos clients. Taux d'ouverture de 98% — vos messages sont lus en moins de 5 minutes. Sans commission.",
  },
  {
    icon: Sparkles,
    title: "Inspiration IA",
    desc: "Indiquez les produits disponibles ce jour-là, et Just-Tag vous suggère des idées adaptées à votre activité. Valorisez vos produits frais, simplifiez la création de votre offre du jour.",
  },
  {
    icon: Store,
    title: "Fiche professionnelle",
    desc: "Photos, carte, horaires, localisation interactive. Votre vitrine en ligne, toujours à jour.",
  },
  {
    icon: Search,
    title: "SEO par canton",
    desc: "Votre établissement apparaît quand un client cherche \"restaurant\", \"bar\" ou \"traiteur [votre ville]\" sur Google.",
  },
  {
    icon: Camera,
    title: "Galerie photos et vidéo",
    desc: "Montrez votre ambiance, vos plats ou boissons, votre équipe. Jusqu'à 20 photos + 1 vidéo de présentation.",
  },
  {
    icon: MessageSquare,
    title: "Gestion des avis",
    desc: "Recevez des avis vérifiés, répondez-y, améliorez votre note. Tout depuis votre tableau de bord.",
  },
  {
    icon: BarChart3,
    title: "Statistiques de visites",
    desc: "Combien de personnes ont vu votre fiche, cliqué sur votre numéro, consulté votre carte. Chaque semaine.",
  },
  {
    icon: Phone,
    title: "Contact direct client",
    desc: "Les clients vous appellent ou vous écrivent sans intermédiaire. Pas de commission, pas de plateforme entre vous deux.",
  },
] as const;

export function AligroFeatures() {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-just-tag)]">
            Fonctionnalités
          </p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Tout ce qu&apos;il vous faut, rien de superflu
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Pas de gadgets inutiles. Des outils concrets pour remplir votre
            établissement.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, index) => {
            const isWhatsApp = index === 0;
            return (
              <div
                key={title}
                className={`group relative rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  isWhatsApp
                    ? "border-[#25D366]/30 ring-1 ring-[#25D366]/20"
                    : "border-gray-200"
                }`}
              >
                {isWhatsApp && (
                  <span className="absolute -top-3 right-6 rounded-full bg-[#25D366] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                    Star feature
                  </span>
                )}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                    isWhatsApp
                      ? "bg-[#25D366]/10"
                      : "bg-[var(--color-just-tag)]/10"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isWhatsApp ? "text-[#128C7E]" : "text-[var(--color-just-tag)]"
                    }`}
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
