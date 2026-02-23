"use server";

import { mockRestaurants, type Restaurant } from "@/data/mock-restaurants";

interface SearchParams {
  query?: string;
  canton?: string;
  cuisine?: string;
  price?: string;
  rating?: string;
  features?: string[];
  sort?: string;
  page?: number;
  limit?: number;
}

interface SearchResult {
  restaurants: Restaurant[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Search restaurants with filters.
 * Currently uses mock data - will be replaced with Supabase queries.
 */
export async function searchRestaurants(params: SearchParams): Promise<SearchResult> {
  const {
    query,
    canton,
    cuisine,
    price,
    rating,
    features,
    sort = "rating",
    page = 1,
    limit = 12,
  } = params;

  let filtered = [...mockRestaurants];

  // Text search
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.nameFr.toLowerCase().includes(q) ||
        r.nameDe.toLowerCase().includes(q) ||
        r.nameEn.toLowerCase().includes(q) ||
        r.descriptionFr.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.cuisineType.toLowerCase().includes(q)
    );
  }

  // Canton filter
  if (canton) {
    filtered = filtered.filter((r) => r.canton === canton);
  }

  // Cuisine filter
  if (cuisine) {
    filtered = filtered.filter((r) => r.cuisineType === cuisine);
  }

  // Price filter
  if (price) {
    filtered = filtered.filter((r) => r.priceRange === parseInt(price));
  }

  // Rating filter
  if (rating) {
    const minRating = parseFloat(rating);
    filtered = filtered.filter((r) => r.avgRating >= minRating);
  }

  // Features filter
  if (features && features.length > 0) {
    filtered = filtered.filter((r) =>
      features.every((f) => r.features.includes(f))
    );
  }

  // Sorting
  switch (sort) {
    case "rating":
      filtered.sort((a, b) => b.avgRating - a.avgRating);
      break;
    case "price":
      filtered.sort((a, b) => a.priceRange - b.priceRange);
      break;
    case "priceDesc":
      filtered.sort((a, b) => b.priceRange - a.priceRange);
      break;
    case "name":
      filtered.sort((a, b) => a.nameFr.localeCompare(b.nameFr));
      break;
    case "newest":
      filtered.sort((a, b) => b.id.localeCompare(a.id));
      break;
    default:
      filtered.sort((a, b) => b.avgRating - a.avgRating);
  }

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginatedResults = filtered.slice(start, start + limit);

  return {
    restaurants: paginatedResults,
    total,
    page,
    totalPages,
  };
}
