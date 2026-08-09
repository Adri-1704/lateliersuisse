/**
 * Helper functions for locale-specific data selection.
 * Used to avoid long ternary chains in components.
 */

type LocalizedName = {
  nameFr: string;
  nameDe: string;
  nameEn: string;
  namePt?: string;
  nameEs?: string;
};

type LocalizedDescription = {
  descriptionFr: string;
  descriptionDe: string;
  descriptionEn: string;
  descriptionPt?: string;
  descriptionEs?: string;
};

type LocalizedLabel = {
  label: string;
  labelDe: string;
  labelEn: string;
  labelPt?: string;
  labelEs?: string;
};

type LocalizedLabelAlt = {
  labelFr: string;
  labelDe: string;
  labelEn: string;
  labelPt?: string;
  labelEs?: string;
};

/**
 * Paires de guillemets englobants reconnues pour le nettoyage d'affichage.
 * Volontairement limité aux guillemets doubles (droits et courbes) : les
 * apostrophes (' U+0027 et ' U+2019) sont exclues car elles servent aussi
 * d'élision légitime en tête de nom ("'O Sole Mio", "L'Auberge",
 * "Nell'Angolo", "Café d'Ô") et ne doivent jamais être retirées.
 */
const ENCLOSING_QUOTE_PAIRS: [string, string][] = [
  ['"', '"'],
  ["“", "”"], // “ ”
];

/**
 * Nettoie un texte affiché (nom d'établissement, etc.) des artefacts
 * d'import les plus courants (#35) : guillemets d'échappement CSV doublés
 * ("" -> "), guillemets englobants superflus, espaces en trop. Ne fait
 * aucune mutation en base — purement cosmétique à l'affichage.
 *
 * On ne retire les guillemets englobants que si le PREMIER et le DERNIER
 * caractère forment une vraie paire symétrique (ex. `"Chez Max"` ->
 * `Chez Max`), jamais tête et queue indépendamment : un nom comme
 * `Restaurant "Spécial"` (guillemet interne non symétrique) reste donc
 * intact plutôt que de laisser un guillemet orphelin.
 */
export function cleanDisplayText(value: string | null | undefined): string {
  if (!value) return "";
  let cleaned = value.trim();
  // Échappement CSV : "" -> "
  cleaned = cleaned.replace(/""/g, '"').trim();

  for (const [open, close] of ENCLOSING_QUOTE_PAIRS) {
    if (cleaned.length > open.length + close.length && cleaned.startsWith(open) && cleaned.endsWith(close)) {
      cleaned = cleaned.slice(open.length, cleaned.length - close.length).trim();
      break;
    }
  }

  return cleaned;
}

/**
 * Get the localized name from an object with nameFr/nameDe/nameEn/namePt/nameEs properties.
 * Falls back to French if the locale-specific name is not available.
 */
export function getLocalizedName(item: LocalizedName, locale: string): string {
  const raw = (() => {
    switch (locale) {
      case "de": return item.nameDe;
      case "en": return item.nameEn;
      case "pt": return item.namePt || item.nameEn;
      case "es": return item.nameEs || item.nameEn;
      default: return item.nameFr;
    }
  })();
  return cleanDisplayText(raw);
}

/**
 * Get the localized description from an object with descriptionFr/descriptionDe/descriptionEn/descriptionPt/descriptionEs.
 * Falls back to French if the locale-specific description is not available.
 */
export function getLocalizedDescription(item: LocalizedDescription, locale: string): string {
  switch (locale) {
    case "de": return item.descriptionDe;
    case "en": return item.descriptionEn;
    case "pt": return item.descriptionPt || item.descriptionEn;
    case "es": return item.descriptionEs || item.descriptionEn;
    default: return item.descriptionFr;
  }
}

/**
 * Get the localized label from an object with label (FR) / labelDe / labelEn / labelPt / labelEs.
 * Used for cantons data.
 */
export function getLocalizedLabel(item: LocalizedLabel, locale: string): string {
  switch (locale) {
    case "de": return item.labelDe;
    case "en": return item.labelEn;
    case "pt": return item.labelPt || item.labelEn;
    case "es": return item.labelEs || item.labelEn;
    default: return item.label;
  }
}

/**
 * Get the localized label from an object with labelFr / labelDe / labelEn / labelPt / labelEs.
 * Used for features data.
 */
export function getLocalizedLabelAlt(item: LocalizedLabelAlt, locale: string): string {
  switch (locale) {
    case "de": return item.labelDe;
    case "en": return item.labelEn;
    case "pt": return item.labelPt || item.labelEn;
    case "es": return item.labelEs || item.labelEn;
    default: return item.labelFr;
  }
}
