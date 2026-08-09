/**
 * Validation "plausible" d'un numéro de téléphone (pas de vérification réseau
 * réelle — juste un filtre de bon sens avant d'appeler des APIs payantes
 * comme WhatsApp/Meta).
 *
 * Règles :
 * - On ne garde que les chiffres (le "+" éventuel est ignoré pour le calcul
 *   de longueur mais toléré dans la saisie).
 * - Doit contenir entre MIN_PHONE_DIGITS et MAX_PHONE_DIGITS chiffres
 *   (format international E.164 : maximum 15 chiffres).
 * - Rejette les suites de chiffres tous identiques ("0000000000",
 *   "1111111111"...) et les chaînes ne contenant aucun chiffre
 *   ("+++++++++++", "abcdefghij").
 */
export const MIN_PHONE_DIGITS = 9;
export const MAX_PHONE_DIGITS = 15;

export function isPlausiblePhoneNumber(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const digitsOnly = raw.replace(/\D/g, "");

  if (digitsOnly.length < MIN_PHONE_DIGITS || digitsOnly.length > MAX_PHONE_DIGITS) {
    return false;
  }

  // Rejette les suites de chiffres tous identiques (0000000000, 1111111111...)
  if (/^(\d)\1+$/.test(digitsOnly)) {
    return false;
  }

  return true;
}

/**
 * Normalise un numéro en ne conservant que les chiffres et un éventuel "+"
 * initial, pour stockage/appel API.
 */
export function normalizePhoneNumber(raw: string): string {
  return raw.replace(/[^0-9+]/g, "");
}
