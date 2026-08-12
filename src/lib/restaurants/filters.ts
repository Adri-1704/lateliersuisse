import type { RestaurantFilters } from "@/lib/restaurants/queries";

/**
 * Parse les searchParams d'URL (?canton=, ?cuisine=, ?features=, ...) en
 * RestaurantFilters. Partagé entre /restaurants (generateMetadata + page) et
 * /collections/[slug] pour que le même jeu de filtres produise le même
 * compte de restaurants partout (#41).
 */
export function parseRestaurantFilters(
  sp: Record<string, string | string[] | undefined>
): RestaurantFilters {
  const establishmentType = typeof sp.type === "string" ? sp.type : undefined;
  const canton = typeof sp.canton === "string" ? sp.canton : undefined;
  const cuisine = typeof sp.cuisine === "string" ? sp.cuisine : undefined;
  // ?city= peut contenir plusieurs variantes brutes d'une même commune
  // canonicalisée séparées par une virgule (ex. "Bern,Berne"), générées par
  // le lien "Voir tous" de la page ville (voir lib/restaurants/city-canton.ts) —
  // sinon un simple filtre sur le nom fusionné ne matcherait aucune ligne
  // dont `city` est une variante brute différente (#34, bloquant sécurité).
  const city =
    typeof sp.city === "string" && sp.city
      ? sp.city.includes(",")
        ? sp.city.split(",").filter(Boolean)
        : sp.city
      : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const priceMax =
    typeof sp.price === "string" && sp.price ? parseInt(sp.price, 10) : undefined;
  const ratingMin =
    typeof sp.rating === "string" && sp.rating ? parseFloat(sp.rating) : undefined;

  const features =
    typeof sp.features === "string"
      ? sp.features.split(",").filter(Boolean)
      : undefined;

  const sortRaw = typeof sp.sort === "string" ? sp.sort : "rating";
  const sort = (["rating", "price", "priceDesc", "name", "newest"].includes(sortRaw)
    ? sortRaw
    : "rating") as RestaurantFilters["sort"];

  return {
    establishmentType,
    canton,
    cuisine,
    city,
    priceMax: priceMax != null && !isNaN(priceMax) ? priceMax : undefined,
    ratingMin: ratingMin != null && !isNaN(ratingMin) ? ratingMin : undefined,
    features: features && features.length > 0 ? features : undefined,
    query: q,
    sort,
  };
}
