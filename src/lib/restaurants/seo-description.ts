import { cantons } from "@/data/cantons";
import { cantonCodeToSlug } from "@/lib/city-slug";
import { cleanDisplayText } from "@/lib/locale-helpers";

/**
 * Construit une phrase "canton de Genève" / "Kanton Genf" / "Geneva canton"
 * localisée et correctement accentuée à partir d'un code canton à 2 lettres
 * ("GE", "VD"...). Réutilise la même table de cantons (avec prépositions)
 * que /restaurants/canton/[canton].
 */
function getCantonPhrase(cantonCode: string | null | undefined, locale: string): string | null {
  if (!cantonCode) return null;
  const slug = cantonCodeToSlug(cantonCode.toUpperCase());
  const canton = slug ? cantons.find((c) => c.value === slug) : undefined;
  if (!canton) return null;

  switch (locale) {
    case "de":
      return `Kanton ${canton.labelDe}`;
    case "en":
      return `${canton.labelEn} canton`;
    case "pt":
      return `cantão de ${canton.labelPt}`;
    case "es":
      return `cantón ${canton.prepositionEs} ${canton.labelEs}`;
    default:
      return `canton ${canton.prepositionFr} ${canton.label}`;
  }
}

/**
 * Génère une meta description (et description JSON-LD) propre, traduite et
 * grammaticalement correcte pour une fiche restaurant, à partir de champs
 * structurés fiables (ville, canton) plutôt que du texte libre
 * description_fr/de/en stocké en base.
 *
 * #41 : le texte libre importé en base contient parfois des descriptions
 * strictement identiques entre fr/de/en (non traduites) ou des formulations
 * fautives générées automatiquement ("Restaurant en Geneve.", "Francais en
 * Vaud.", canton sans accent). On ne peut pas corriger ces données historiques
 * sans migration ; on garantit donc une description correcte et traduite en
 * la reconstruisant à partir de colonnes fiables (ville/canton), pour les 5
 * locales et pour tous les restaurants.
 */
export function getRestaurantSeoDescription(
  restaurant: { city?: string | null; canton?: string | null },
  locale: string
): string {
  const city = cleanDisplayText(restaurant.city) || "";
  const cantonPhrase = getCantonPhrase(restaurant.canton, locale);
  const location = [city, cantonPhrase].filter(Boolean).join(", ");

  switch (locale) {
    case "de":
      return location
        ? `Restaurant in ${location}. Speisekarte, Öffnungszeiten, Bewertungen und Kontaktdaten auf Just-Tag.`
        : "Restaurant in der Westschweiz. Speisekarte, Öffnungszeiten, Bewertungen und Kontaktdaten auf Just-Tag.";
    case "en":
      return location
        ? `Restaurant in ${location}. Menu, opening hours, reviews and contact details on Just-Tag.`
        : "Restaurant in Western Switzerland. Menu, opening hours, reviews and contact details on Just-Tag.";
    case "pt":
      return location
        ? `Restaurante em ${location}. Menu, horários, avaliações e contactos no Just-Tag.`
        : "Restaurante na Suíça Romanda. Menu, horários, avaliações e contactos no Just-Tag.";
    case "es":
      return location
        ? `Restaurante en ${location}. Menú, horarios, reseñas y contacto en Just-Tag.`
        : "Restaurante en la Suiza Romanda. Menú, horarios, reseñas y contacto en Just-Tag.";
    default:
      return location
        ? `Restaurant à ${location}. Menu, horaires, avis clients et coordonnées sur Just-Tag.`
        : "Restaurant en Suisse Romande. Menu, horaires, avis clients et coordonnées sur Just-Tag.";
  }
}
