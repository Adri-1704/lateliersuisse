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
 * Get the localized name from an object with nameFr/nameDe/nameEn/namePt/nameEs properties.
 * Falls back to French if the locale-specific name is not available.
 */
export function getLocalizedName(item: LocalizedName, locale: string): string {
  switch (locale) {
    case "de": return item.nameDe;
    case "en": return item.nameEn;
    case "pt": return item.namePt || item.nameEn;
    case "es": return item.nameEs || item.nameEn;
    default: return item.nameFr;
  }
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
