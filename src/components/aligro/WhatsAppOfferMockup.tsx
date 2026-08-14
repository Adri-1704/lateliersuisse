import { ChevronLeft, MoreVertical, Camera, Mic, CheckCheck, Video, Phone as PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bulle de texte WhatsApp avec une portion mise en gras (ex. "HAPPY HOUR").
 */
export interface WhatsAppOfferBubbleText {
  /** Texte affiché avant la portion mise en gras. */
  prefix: string;
  /** Portion mise en gras (ex. "HAPPY HOUR", "MENU DU JOUR"). */
  bold: string;
  /** Texte affiché après la portion mise en gras. */
  suffix: string;
  /** Horodatage affiché sous la bulle (ex. "10:58"). */
  timestamp: string;
}

/**
 * Vignette "photo" décorative (dégradé CSS + emojis, aucune image réelle).
 */
export interface WhatsAppOfferPhotoBubble {
  /** Classes Tailwind du dégradé (ex. `from-amber-200 via-yellow-500 to-amber-700`). */
  gradientClassName: string;
  /** Emojis affichés au centre de la vignette. */
  emojis: string;
  /** Légende affichée sous la vignette. */
  caption: string;
  /** Horodatage affiché sous la légende. */
  timestamp: string;
}

/**
 * Bulle de réponse/relance affichée en bas du fil de discussion.
 */
export interface WhatsAppOfferReplyBubble {
  text: string;
  timestamp: string;
  /** Affiche les doubles coches bleues (message lu). Par défaut `true`. */
  seen?: boolean;
}

/**
 * Contenu complet d'une conversation WhatsApp simulée par
 * `WhatsAppOfferMockup`. Permet de réutiliser le même composant pour
 * plusieurs scénarios (Happy Hour, Menu du jour, etc.) sans dupliquer le
 * rendu — voir les presets `HAPPY_HOUR_MOCKUP` / `MENU_DU_JOUR_MOCKUP`
 * ci-dessous.
 */
export interface WhatsAppOfferContent {
  /** Description de la scène pour les technologies d'assistance. */
  ariaLabel: string;
  /** Nom de l'établissement affiché dans l'en-tête du chat. */
  restaurantName: string;
  /** Initiale affichée dans l'avatar de l'établissement. */
  avatarInitial: string;
  /** Heure affichée dans la barre de statut du téléphone. */
  clockTime: string;
  bubble1: WhatsAppOfferBubbleText;
  photoBubble: WhatsAppOfferPhotoBubble;
  bubble2: WhatsAppOfferReplyBubble;
  /** Badge flottant mettant en avant le taux de lecture WhatsApp. */
  floatingBadge: {
    title: string;
    subtitle: string;
  };
}

/** Preset "Happy Hour" — contenu original du mockup, inchangé. */
export const HAPPY_HOUR_MOCKUP: WhatsAppOfferContent = {
  ariaLabel:
    "Illustration d'une conversation WhatsApp : Le Bistrot du Marché envoie à un client une offre Happy Hour — ce soir de 17h à 20h, toutes les pintes de bière à 5.- CHF.",
  restaurantName: "Le Bistrot du Marché",
  avatarInitial: "B",
  clockTime: "11:00",
  bubble1: {
    prefix: "🍺 ",
    bold: "HAPPY HOUR",
    suffix: " ce soir ! De 17h à 20h : toutes les pintes de bière à 5.- CHF 🍻",
    timestamp: "10:58",
  },
  photoBubble: {
    gradientClassName: "from-amber-200 via-yellow-500 to-amber-700",
    emojis: "🍺🍻",
    caption: "Nos pintes pression vous attendent 🍻",
    timestamp: "10:59",
  },
  bubble2: {
    text: "📍 On vous attend au Bistrot du Marché — réservez votre table 👉",
    timestamp: "11:00",
    seen: true,
  },
  floatingBadge: {
    title: "98% de lecture",
    subtitle: "en moins de 5 min",
  },
};

/** Preset "Menu du jour" — second scénario proposé aux clients Aligro. */
export const MENU_DU_JOUR_MOCKUP: WhatsAppOfferContent = {
  ariaLabel:
    "Illustration d'une conversation WhatsApp : Le Bistrot du Marché envoie à un client son menu du jour — filets de perche du lac, frites maison et salade, à 24.- CHF.",
  restaurantName: "Le Bistrot du Marché",
  avatarInitial: "B",
  clockTime: "11:00",
  bubble1: {
    prefix: "🍽️ ",
    bold: "MENU DU JOUR",
    suffix:
      " — Aujourd'hui : filets de perche du lac, frites maison & salade, 24.- CHF 😋",
    timestamp: "11:02",
  },
  photoBubble: {
    gradientClassName: "from-amber-100 via-orange-300 to-rose-400",
    emojis: "🍽️🐟",
    caption: "Le plat du jour vous attend 😋",
    timestamp: "11:02",
  },
  bubble2: {
    text: "📍 Réservez votre table pour midi 👉",
    timestamp: "11:03",
    seen: true,
  },
  floatingBadge: {
    title: "98% de lecture",
    subtitle: "en moins de 5 min",
  },
};

export interface WhatsAppOfferMockupProps {
  /** Contenu de la conversation affichée (voir presets exportés). */
  content: WhatsAppOfferContent;
  /** Classes additionnelles sur le conteneur racine (ex. pour ajuster la largeur). */
  className?: string;
  /** Classes de rotation/transition du cadre du téléphone (remplace la valeur par défaut). */
  frameClassName?: string;
  /** Affiche ou masque le badge flottant "98% de lecture" (par défaut affiché). */
  showFloatingBadge?: boolean;
}

/**
 * Maquette de téléphone illustrant une conversation WhatsApp entre un
 * établissement et l'un de ses clients : le cœur de la proposition de valeur
 * Just-Tag ("Marketing WhatsApp", voir AligroFeatures). Purement décorative
 * (CSS/SVG, aucune image externe) : exposée via un unique `role="img"` +
 * `aria-label` (fourni par `content.ariaLabel`), le détail interne est
 * masqué aux technologies d'assistance.
 *
 * Le contenu affiché (offre, horaires, dégradé de la vignette photo, etc.)
 * est entièrement piloté par le prop `content`, ce qui permet de réutiliser
 * ce même composant pour plusieurs scénarios — voir `HAPPY_HOUR_MOCKUP` et
 * `MENU_DU_JOUR_MOCKUP`.
 *
 * Les bulles s'animent à l'apparition (réutilise les utilitaires
 * `.animate-fade-in-scale` / `.animate-delay-*` de globals.css, qui
 * respectent déjà `prefers-reduced-motion` via `tw-animate-css`). Par
 * sécurité, une media query dédiée neutralise aussi l'animation ici.
 */
export function WhatsAppOfferMockup({
  content,
  className,
  frameClassName,
  showFloatingBadge = true,
}: WhatsAppOfferMockupProps) {
  return (
    <div
      role="img"
      aria-label={content.ariaLabel}
      className={cn(
        "wa-mockup relative mx-auto w-[260px] shrink-0 select-none sm:w-[290px]",
        className,
      )}
    >
      {/* Halo décoratif derrière le téléphone */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 scale-90 rounded-[3rem] bg-[#25D366]/25 blur-3xl"
      />

      {/* Cadre du téléphone */}
      <div
        aria-hidden="true"
        className={cn(
          "relative rounded-[2.5rem] border-[8px] border-gray-900 bg-gray-900 shadow-2xl ring-1 ring-black/10 transition-transform duration-500 ease-out",
          frameClassName ?? "-rotate-2 hover:rotate-0",
        )}
      >
        {/* Encoche */}
        <div className="absolute left-1/2 top-0 z-20 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-900" />

        {/* Écran */}
        <div className="relative flex h-[520px] w-full flex-col overflow-hidden rounded-[2rem] bg-[#ECE5DD]">
          {/* Barre de statut */}
          <div className="flex items-center justify-between bg-[#075E54] px-6 pb-1 pt-2.5 text-[10px] font-semibold text-white">
            <span>{content.clockTime}</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2.5 rounded-[1px] bg-white/90" />
              <span className="h-2 w-3 rounded-[1px] bg-white/90" />
              <span className="h-2.5 w-4 rounded-[2px] border border-white/90" />
            </div>
          </div>

          {/* En-tête de chat WhatsApp */}
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#075E54] to-[#128C7E] px-3 py-2.5 text-white shadow-sm">
            <ChevronLeft className="h-5 w-5 shrink-0 text-white/90" />
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-just-tag)] text-sm font-bold ring-2 ring-white/30">
              {content.avatarInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight">
                {content.restaurantName}
              </p>
              <p className="text-[10.5px] leading-tight text-white/75">en ligne</p>
            </div>
            <Video className="h-4 w-4 shrink-0 text-white/85" />
            <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-white/85" />
            <MoreVertical className="h-4 w-4 shrink-0 text-white/85" />
          </div>

          {/* Fil de discussion */}
          <div
            className="relative flex-1 space-y-2 overflow-hidden px-3 py-3"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.03) 1px, transparent 1px), radial-gradient(circle at 60% 70%, rgba(0,0,0,0.03) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          >
            {/* Bulle offre texte 1 */}
            <div className="animate-fade-in-scale flex justify-start opacity-0">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
                <p className="text-[12.5px] leading-snug text-gray-800">
                  {content.bubble1.prefix}
                  <span className="font-semibold">{content.bubble1.bold}</span>
                  {content.bubble1.suffix}
                </p>
                <span className="mt-1 block text-right text-[9.5px] text-gray-400">
                  {content.bubble1.timestamp}
                </span>
              </div>
            </div>

            {/* Bulle "photo" de l'offre */}
            <div className="animate-fade-in-scale animate-delay-200 flex justify-start opacity-0">
              <div className="w-[70%] max-w-[220px] overflow-hidden rounded-2xl rounded-tl-sm bg-white shadow-sm">
                <div
                  className={cn(
                    "flex h-20 items-center justify-center bg-gradient-to-br text-3xl",
                    content.photoBubble.gradientClassName,
                  )}
                >
                  {content.photoBubble.emojis}
                </div>
                <div className="px-3 py-1.5">
                  <p className="text-[11px] font-medium text-gray-700">
                    {content.photoBubble.caption}
                  </p>
                  <span className="mt-0.5 block text-right text-[9.5px] text-gray-400">
                    {content.photoBubble.timestamp}
                  </span>
                </div>
              </div>
            </div>

            {/* Bulle offre texte 2 */}
            <div className="animate-fade-in-scale animate-delay-400 flex justify-start opacity-0">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
                <p className="text-[12.5px] leading-snug text-gray-800">
                  {content.bubble2.text}
                </p>
                <div className="mt-1 flex items-center justify-end gap-1 text-[9.5px] text-gray-400">
                  <span>{content.bubble2.timestamp}</span>
                  {content.bubble2.seen !== false && (
                    <CheckCheck className="h-3.5 w-3.5 text-[#34B7F1]" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Barre de saisie (décorative) */}
          <div className="flex items-center gap-2 border-t border-black/5 bg-[#F0F0F0] px-3 py-2">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] text-gray-400 shadow-inner">
              <Camera className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate">Tapez un message</span>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
              <Mic className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Badge flottant : taux d'ouverture */}
      {showFloatingBadge && (
        <div
          aria-hidden="true"
          className="animate-fade-in-scale animate-delay-400 absolute -left-4 top-14 rotate-[-4deg] rounded-2xl bg-white px-3 py-2 opacity-0 shadow-xl ring-1 ring-black/5 sm:-left-8"
        >
          <p className="text-[11px] font-bold leading-none text-gray-900">
            {content.floatingBadge.title}
          </p>
          <p className="mt-0.5 text-[9.5px] leading-none text-gray-500">
            {content.floatingBadge.subtitle}
          </p>
        </div>
      )}

      {/* Motion réduite : on stoppe les animations d'apparition, tout reste visible */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .wa-mockup .animate-fade-in-scale {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
