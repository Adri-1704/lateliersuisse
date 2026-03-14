export interface Collection {
  slug: string;
  titleFr: string;
  titleDe: string;
  titleEn: string;
  titlePt: string;
  titleEs: string;
  descriptionFr: string;
  descriptionDe: string;
  descriptionEn: string;
  descriptionPt: string;
  descriptionEs: string;
  icon: string;
  coverImage: string;
  filterFeature?: string;
  filterCuisine?: string;
}

export const collections: Collection[] = [
  {
    slug: "meilleur-brunch",
    titleFr: "Meilleur brunch",
    titleDe: "Bester Brunch",
    titleEn: "Best brunch",
    titlePt: "Melhor brunch",
    titleEs: "Mejor brunch",
    descriptionFr: "Les meilleurs spots pour un brunch gourmand en Suisse",
    descriptionDe: "Die besten Brunch-Spots der Schweiz",
    descriptionEn: "The best spots for a gourmet brunch in Switzerland",
    descriptionPt: "Os melhores locais para um brunch gourmet na Suíça",
    descriptionEs: "Los mejores sitios para un brunch gourmet en Suiza",
    icon: "🥞",
    coverImage: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=80",
    filterFeature: "brunch",
  },
  {
    slug: "romantique",
    titleFr: "Restaurants romantiques",
    titleDe: "Romantische Restaurants",
    titleEn: "Romantic restaurants",
    titlePt: "Restaurantes românticos",
    titleEs: "Restaurantes románticos",
    descriptionFr: "Les adresses les plus romantiques pour un diner en amoureux",
    descriptionDe: "Die romantischsten Adressen fuer ein Dinner zu zweit",
    descriptionEn: "The most romantic spots for a dinner for two",
    descriptionPt: "Os endereços mais românticos para um jantar a dois",
    descriptionEs: "Las direcciones mas románticas para una cena en pareja",
    icon: "💕",
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    filterFeature: "romantic",
  },
  {
    slug: "vue-sur-le-lac",
    titleFr: "Vue sur le lac",
    titleDe: "Seeblick",
    titleEn: "Lake view",
    titlePt: "Vista para o lago",
    titleEs: "Vista al lago",
    descriptionFr: "Restaurants avec une vue imprenable sur les lacs suisses",
    descriptionDe: "Restaurants mit atemberaubendem Blick auf die Schweizer Seen",
    descriptionEn: "Restaurants with stunning views of Swiss lakes",
    descriptionPt: "Restaurantes com vista deslumbrante para os lagos suíços",
    descriptionEs: "Restaurantes con vistas impresionantes a los lagos suizos",
    icon: "🏔️",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    filterFeature: "lake-view",
  },
  {
    slug: "business-lunch",
    titleFr: "Business lunch",
    titleDe: "Business Lunch",
    titleEn: "Business lunch",
    titlePt: "Almoço de negocios",
    titleEs: "Almuerzo de negocios",
    descriptionFr: "Les meilleures adresses pour un dejeuner d'affaires reussi",
    descriptionDe: "Die besten Adressen fuer ein erfolgreiches Business-Lunch",
    descriptionEn: "The best spots for a successful business lunch",
    descriptionPt: "Os melhores endereços para um almoço de negócios bem-sucedido",
    descriptionEs: "Las mejores direcciones para un almuerzo de negocios exitoso",
    icon: "💼",
    coverImage: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    filterFeature: "business",
  },
  {
    slug: "terrasse",
    titleFr: "Terrasses d'ete",
    titleDe: "Sommerterrassen",
    titleEn: "Summer terraces",
    titlePt: "Terraços de verão",
    titleEs: "Terrazas de verano",
    descriptionFr: "Les plus belles terrasses pour profiter du soleil",
    descriptionDe: "Die schoensten Terrassen zum Geniessen der Sonne",
    descriptionEn: "The most beautiful terraces to enjoy the sun",
    descriptionPt: "Os mais belos terraços para aproveitar o sol",
    descriptionEs: "Las mas hermosas terrazas para disfrutar del sol",
    icon: "☀️",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    filterFeature: "terrace",
  },
  {
    slug: "gastronomique",
    titleFr: "Cuisine gastronomique",
    titleDe: "Gourmetkueche",
    titleEn: "Fine dining",
    titlePt: "Cozinha gastronômica",
    titleEs: "Alta cocina",
    descriptionFr: "Les tables d'exception pour une experience culinaire inoubliable",
    descriptionDe: "Aussergewoehnliche Tische fuer ein unvergessliches kulinarisches Erlebnis",
    descriptionEn: "Exceptional tables for an unforgettable culinary experience",
    descriptionPt: "Mesas excepcionais para uma experiência culinária inesquecível",
    descriptionEs: "Mesas excepcionales para una experiencia culinaria inolvidable",
    icon: "⭐",
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    filterCuisine: "gastronomique",
  },
];
