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
  { slug: "fruits-de-mer", nameFr: "Fruits de mer", nameDe: "Meeresfruechte", nameEn: "Seafood", namePt: "Frutos do mar", nameEs: "Mariscos", icon: "🦞", count: 27 },
  { slug: "steakhouse", nameFr: "Steakhouse", nameDe: "Steakhouse", nameEn: "Steakhouse", namePt: "Steakhouse", nameEs: "Steakhouse", icon: "🥩", count: 31 },
];
