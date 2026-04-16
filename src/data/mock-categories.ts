export interface CuisineCategory {
  slug: string;
  nameFr: string;
  nameDe: string;
  nameEn: string;
  namePt: string;
  nameEs: string;
  icon: string;
  count: number;
}

export const cuisineCategories: CuisineCategory[] = [
  { slug: "italien", nameFr: "Italien", nameDe: "Italienisch", nameEn: "Italian", namePt: "Italiano", nameEs: "Italiano", icon: "🍕", count: 145 },
  { slug: "francais", nameFr: "Francais", nameDe: "Franzoesisch", nameEn: "French", namePt: "Francês", nameEs: "Francés", icon: "🥐", count: 98 },
  { slug: "japonais", nameFr: "Japonais", nameDe: "Japanisch", nameEn: "Japanese", namePt: "Japonês", nameEs: "Japonés", icon: "🍣", count: 67 },
  { slug: "suisse", nameFr: "Suisse", nameDe: "Schweizer", nameEn: "Swiss", namePt: "Suíço", nameEs: "Suizo", icon: "🫕", count: 120 },
  { slug: "chinois", nameFr: "Chinois", nameDe: "Chinesisch", nameEn: "Chinese", namePt: "Chinês", nameEs: "Chino", icon: "🥡", count: 54 },
  { slug: "indien", nameFr: "Indien", nameDe: "Indisch", nameEn: "Indian", namePt: "Indiano", nameEs: "Indio", icon: "🍛", count: 43 },
  { slug: "thai", nameFr: "Thailandais", nameDe: "Thailaendisch", nameEn: "Thai", namePt: "Tailandês", nameEs: "Tailandés", icon: "🍜", count: 38 },
  { slug: "mexicain", nameFr: "Mexicain", nameDe: "Mexikanisch", nameEn: "Mexican", namePt: "Mexicano", nameEs: "Mexicano", icon: "🌮", count: 29 },
  { slug: "libanais", nameFr: "Libanais", nameDe: "Libanesisch", nameEn: "Lebanese", namePt: "Libanês", nameEs: "Libanés", icon: "🧆", count: 35 },
  { slug: "turc", nameFr: "Turc", nameDe: "Tuerkisch", nameEn: "Turkish", namePt: "Turco", nameEs: "Turco", icon: "🥙", count: 41 },
  { slug: "espagnol", nameFr: "Espagnol", nameDe: "Spanisch", nameEn: "Spanish", namePt: "Espanhol", nameEs: "Español", icon: "🥘", count: 22 },
  { slug: "grec", nameFr: "Grec", nameDe: "Griechisch", nameEn: "Greek", namePt: "Grego", nameEs: "Griego", icon: "🫒", count: 18 },
  { slug: "americain", nameFr: "Americain", nameDe: "Amerikanisch", nameEn: "American", namePt: "Americano", nameEs: "Americano", icon: "🍔", count: 56 },
  { slug: "coreen", nameFr: "Coreen", nameDe: "Koreanisch", nameEn: "Korean", namePt: "Coreano", nameEs: "Coreano", icon: "🍱", count: 15 },
  { slug: "vietnamien", nameFr: "Vietnamien", nameDe: "Vietnamesisch", nameEn: "Vietnamese", namePt: "Vietnamita", nameEs: "Vietnamita", icon: "🍲", count: 21 },
  { slug: "africain", nameFr: "Africain", nameDe: "Afrikanisch", nameEn: "African", namePt: "Africano", nameEs: "Africano", icon: "🥘", count: 12 },
  { slug: "portugais", nameFr: "Portugais", nameDe: "Portugiesisch", nameEn: "Portuguese", namePt: "Português", nameEs: "Portugués", icon: "🐟", count: 16 },
  { slug: "vegetarien", nameFr: "Vegetarien", nameDe: "Vegetarisch", nameEn: "Vegetarian", namePt: "Vegetariano", nameEs: "Vegetariano", icon: "🥗", count: 34 },
  { slug: "vegan", nameFr: "Vegan", nameDe: "Vegan", nameEn: "Vegan", namePt: "Vegano", nameEs: "Vegano", icon: "🌱", count: 19 },
  { slug: "fruits-de-mer", nameFr: "Fruits de mer", nameDe: "Meeresfruechte", nameEn: "Seafood", namePt: "Frutos do mar", nameEs: "Mariscos", icon: "🦞", count: 27 },
  { slug: "steakhouse", nameFr: "Steakhouse", nameDe: "Steakhouse", nameEn: "Steakhouse", namePt: "Steakhouse", nameEs: "Steakhouse", icon: "🥩", count: 31 },
  { slug: "mediterraneen", nameFr: "Mediterraneen", nameDe: "Mediterran", nameEn: "Mediterranean", namePt: "Mediterrâneo", nameEs: "Mediterraneo", icon: "🫒", count: 42 },
  { slug: "peruvien", nameFr: "Peruvien", nameDe: "Peruanisch", nameEn: "Peruvian", namePt: "Peruano", nameEs: "Peruano", icon: "🐟", count: 11 },
  { slug: "bresilien", nameFr: "Bresilien", nameDe: "Brasilianisch", nameEn: "Brazilian", namePt: "Brasileiro", nameEs: "Brasileño", icon: "🥩", count: 9 },
  { slug: "marocain", nameFr: "Marocain", nameDe: "Marokkanisch", nameEn: "Moroccan", namePt: "Marroquino", nameEs: "Marroquí", icon: "🫖", count: 14 },
  { slug: "pizza", nameFr: "Pizza", nameDe: "Pizza", nameEn: "Pizza", namePt: "Pizza", nameEs: "Pizza", icon: "🍕", count: 87 },
  { slug: "sushi", nameFr: "Sushi", nameDe: "Sushi", nameEn: "Sushi", namePt: "Sushi", nameEs: "Sushi", icon: "🍣", count: 52 },
  { slug: "burger", nameFr: "Burger", nameDe: "Burger", nameEn: "Burger", namePt: "Hambúrguer", nameEs: "Hamburguesa", icon: "🍔", count: 63 },
  { slug: "gastronomique", nameFr: "Gastronomique", nameDe: "Gourmet", nameEn: "Fine dining", namePt: "Gastronômico", nameEs: "Gastronómico", icon: "⭐", count: 36 },
  { slug: "bistrot", nameFr: "Bistrot", nameDe: "Bistro", nameEn: "Bistro", namePt: "Bistrô", nameEs: "Bistró", icon: "🍷", count: 48 },
  { slug: "brasserie", nameFr: "Brasserie", nameDe: "Brasserie", nameEn: "Brasserie", namePt: "Brasserie", nameEs: "Brasserie", icon: "🍺", count: 39 },
  { slug: "brunch", nameFr: "Brunch", nameDe: "Brunch", nameEn: "Brunch", namePt: "Brunch", nameEs: "Brunch", icon: "🥞", count: 44 },
  { slug: "tapas", nameFr: "Tapas", nameDe: "Tapas", nameEn: "Tapas", namePt: "Tapas", nameEs: "Tapas", icon: "🫒", count: 20 },
  { slug: "fusion", nameFr: "Fusion", nameDe: "Fusion", nameEn: "Fusion", namePt: "Fusão", nameEs: "Fusión", icon: "🍽️", count: 25 },
  { slug: "asiatique", nameFr: "Asiatique", nameDe: "Asiatisch", nameEn: "Asian", namePt: "Asiático", nameEs: "Asiático", icon: "🥢", count: 58 },
  { slug: "oriental", nameFr: "Oriental", nameDe: "Orientalisch", nameEn: "Middle Eastern", namePt: "Oriental", nameEs: "Oriental", icon: "🧆", count: 23 },
  { slug: "ethiopien", nameFr: "Ethiopien", nameDe: "Aethiopisch", nameEn: "Ethiopian", namePt: "Etíope", nameEs: "Etíope", icon: "🫓", count: 8 },
  { slug: "georgien", nameFr: "Georgien", nameDe: "Georgisch", nameEn: "Georgian", namePt: "Georgiano", nameEs: "Georgiano", icon: "🥟", count: 6 },
  { slug: "pakistanais", nameFr: "Pakistanais", nameDe: "Pakistanisch", nameEn: "Pakistani", namePt: "Paquistanês", nameEs: "Paquistaní", icon: "🍛", count: 10 },
  { slug: "sri-lankais", nameFr: "Sri Lankais", nameDe: "Sri-Lankisch", nameEn: "Sri Lankan", namePt: "Cingalês", nameEs: "Cingalés", icon: "🌶️", count: 7 },
  { slug: "erythreen", nameFr: "Erythreen", nameDe: "Eritreisch", nameEn: "Eritrean", namePt: "Eritreu", nameEs: "Eritreo", icon: "🫓", count: 5 },
  { slug: "creole", nameFr: "Creole", nameDe: "Kreolisch", nameEn: "Creole", namePt: "Crioulo", nameEs: "Criollo", icon: "🌴", count: 8 },
  { slug: "tibetain", nameFr: "Tibetain", nameDe: "Tibetisch", nameEn: "Tibetan", namePt: "Tibetano", nameEs: "Tibetano", icon: "🥟", count: 5 },
  { slug: "bar", nameFr: "Bar & Pub", nameDe: "Bar & Pub", nameEn: "Bar & Pub", namePt: "Bar & Pub", nameEs: "Bar & Pub", icon: "🍸", count: 0 },
  { slug: "bar-a-vin", nameFr: "Bar a vin", nameDe: "Weinbar", nameEn: "Wine bar", namePt: "Bar de vinhos", nameEs: "Bar de vinos", icon: "🍷", count: 30 },
  { slug: "cave-a-vin", nameFr: "Cave a vin", nameDe: "Weinkeller", nameEn: "Wine cellar", namePt: "Cave de vinhos", nameEs: "Bodega", icon: "🏺", count: 0 },
  { slug: "tea-room", nameFr: "Tea-room", nameDe: "Tea-Room", nameEn: "Tea room", namePt: "Sala de chá", nameEs: "Salón de té", icon: "🫖", count: 0 },
  { slug: "cafe", nameFr: "Cafe", nameDe: "Cafe", nameEn: "Cafe", namePt: "Café", nameEs: "Café", icon: "☕", count: 55 },
  { slug: "glaces", nameFr: "Glaces", nameDe: "Eisdiele", nameEn: "Ice cream", namePt: "Sorvete", nameEs: "Helados", icon: "🍦", count: 18 },
  { slug: "patisserie", nameFr: "Patisserie", nameDe: "Patisserie", nameEn: "Pastry shop", namePt: "Pastelaria", nameEs: "Pastelería", icon: "🧁", count: 22 },
];
