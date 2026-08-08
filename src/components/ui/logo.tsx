/**
 * Logo Just-Tag — l'assiette connectée.
 *
 * Une assiette (restaurant/bar) avec un badge de notification vert en haut à
 * droite (message WhatsApp) — les deux métiers de Just-Tag dans un seul
 * symbole, lisible à toutes les tailles (favicon 16px, sidebar, header).
 *
 * Remplace les 3 marques différentes utilisées avant (favicon fourchette/
 * couteau dessiné, icône Lucide UtensilsCrossed dans le back-office, croix
 * suisse sur le site public) — un seul composant, une seule source de vérité.
 */
export function Logo({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Just-Tag"
    >
      <rect width="32" height="32" rx="7" fill="#ff3c48" />
      <circle cx="14" cy="18" r="8" fill="none" stroke="#ffffff" strokeWidth="2" />
      <circle cx="14" cy="18" r="3" fill="none" stroke="#ffffff" strokeWidth="1.4" />
      <circle cx="23" cy="9" r="6" fill="#25d366" stroke="#ff3c48" strokeWidth="1.5" />
    </svg>
  );
}
