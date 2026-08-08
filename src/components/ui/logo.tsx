/**
 * Logo Just-Tag — monogramme JT + combiné téléphonique WhatsApp.
 *
 * Un monogramme "JT" dessiné au trait (extrémités arrondies, lisible même en
 * favicon 16px) avec un badge en bas à droite reprenant le vrai combiné
 * téléphonique de WhatsApp, en blanc sur fond vert — le canal de
 * communication au cœur du produit.
 *
 * Remplace la version précédente (assiette en anneaux concentriques + badge
 * rond), trop proche visuellement de l'icône Instagram.
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
      {/* Monogramme JT */}
      <path d="M8.5,7 v9.5 a4,4 0 0 1 -4,4" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M15.5,7 h9" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M20,7 v13" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
      {/* Badge téléphone WhatsApp */}
      <circle cx="24" cy="24" r="7.4" fill="#25d366" stroke="#ff3c48" strokeWidth="1.4" />
      <path
        d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"
        fill="#ffffff"
        transform="translate(24,24) scale(0.0245) translate(-243,-256)"
      />
    </svg>
  );
}
