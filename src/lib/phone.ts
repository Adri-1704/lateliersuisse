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

/**
 * Construit un href `tel:` normalisé (sans espaces, préfixe international)
 * à partir d'un numéro affiché tel quel dans l'UI (ex. "022 300 16 12").
 * Les espaces bruts dans un schéma `tel:` échouent sur certains combinés et
 * l'absence d'indicatif international empêche de composer depuis l'étranger
 * (#40). Le texte affiché à l'utilisateur n'est pas modifié — seul le href
 * est reconstruit.
 *
 * - "022 300 16 12" (format national suisse, 0 initial) → "tel:+41223001612"
 * - "0041 22 300 16 12" / "0041223001612" → "tel:+41223001612"
 * - "+41 22 300 16 12" → "tel:+41223001612"
 */
export function toTelHref(raw: string | null | undefined): string | null {
  const e164 = toE164(raw);
  return e164 ? `tel:${e164}` : null;
}

/**
 * Convertit un numéro affiché (format national suisse ou international) en
 * E.164 (`+41223001612`), sans le préfixe `tel:`. Utile pour le JSON-LD
 * (`telephone`) en plus du href `tel:` des liens cliquables.
 */
export function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = normalizePhoneNumber(raw.trim());
  if (!digits) return null;

  if (digits.startsWith("00")) {
    digits = `+${digits.slice(2)}`;
  } else if (digits.startsWith("0")) {
    // Format national suisse (0XX XXX XX XX) : le 0 initial est remplacé
    // par l'indicatif international suisse.
    digits = `+41${digits.slice(1)}`;
  } else if (!digits.startsWith("+")) {
    digits = `+${digits}`;
  }

  return digits;
}
