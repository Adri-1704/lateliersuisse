/**
 * Helpers de rendu pour les adresses postales des restaurants (#35).
 *
 * Les champs address / postalCode / city peuvent être vides individuellement
 * en base (import incomplet, fiche non revendiquée...). On évite de
 * concaténer des chaînes vides séparées par des virgules (rendu du type
 * ", " observé sur les fiches sans adresse) : on ne joint que les segments
 * réellement renseignés.
 */

export interface AddressParts {
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
}

/** True si au moins un des composants de l'adresse est renseigné. */
export function hasAddress(parts: AddressParts): boolean {
  return Boolean(parts.address?.trim() || parts.postalCode?.trim() || parts.city?.trim());
}

/**
 * Formatte une adresse postale en ne joignant que les segments non vides.
 * Retourne une chaîne vide si aucun composant n'est disponible.
 *
 * Exemples :
 * - { address: "Rue du Lac 3", postalCode: "1200", city: "Genève" }
 *   -> "Rue du Lac 3, 1200 Genève"
 * - { address: "", postalCode: "1200", city: "Genève" } -> "1200 Genève"
 * - { address: "", postalCode: "", city: "" } -> ""
 */
export function formatAddress(parts: AddressParts): string {
  const street = parts.address?.trim() || "";
  const postalCity = [parts.postalCode?.trim(), parts.city?.trim()].filter(Boolean).join(" ");
  return [street, postalCity].filter(Boolean).join(", ");
}
