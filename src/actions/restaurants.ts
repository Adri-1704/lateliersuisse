"use server";

import { mockRestaurants, mockReviews, type Restaurant, type Review } from "@/data/mock-restaurants";

/**
 * Get a restaurant by slug.
 * Currently uses mock data - will be replaced with Supabase queries.
 */
export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  return mockRestaurants.find((r) => r.slug === slug) || null;
}

/**
 * Get reviews for a restaurant.
 * Currently uses mock data - will be replaced with Supabase queries.
 */
export async function getRestaurantReviews(
  restaurantId: string,
  page = 1,
  limit = 10
): Promise<{ reviews: Review[]; total: number }> {
  const filtered = mockReviews.filter((r) => r.restaurantId === restaurantId);
  const start = (page - 1) * limit;
  return {
    reviews: filtered.slice(start, start + limit),
    total: filtered.length,
  };
}

/**
 * Get featured restaurants (restaurant of the month).
 */
export async function getFeaturedRestaurants(): Promise<Restaurant[]> {
  return mockRestaurants.filter((r) => r.isFeatured);
}

/**
 * Get similar restaurants (same cuisine or canton).
 */
export async function getSimilarRestaurants(
  restaurant: Restaurant,
  limit = 4
): Promise<Restaurant[]> {
  return mockRestaurants
    .filter(
      (r) =>
        r.id !== restaurant.id &&
        (r.cuisineType === restaurant.cuisineType || r.canton === restaurant.canton)
    )
    .slice(0, limit);
}
