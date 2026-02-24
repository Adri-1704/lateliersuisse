"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RestaurantCard } from "./RestaurantCard";
import type { Restaurant } from "@/data/mock-restaurants";
import { createClient } from "@/lib/supabase/client";

const placeholderImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
];

function mapDbToRestaurant(row: Record<string, unknown>, index: number): Restaurant {
  return {
    id: row.id as string,
    slug: row.slug as string,
    nameFr: row.name_fr as string,
    nameDe: row.name_de as string,
    nameEn: row.name_en as string,
    descriptionFr: (row.description_fr as string) || "",
    descriptionDe: (row.description_de as string) || "",
    descriptionEn: (row.description_en as string) || "",
    cuisineType: (row.cuisine_type as string) || "",
    canton: row.canton as string,
    city: row.city as string,
    address: (row.address as string) || "",
    postalCode: (row.postal_code as string) || "",
    latitude: (row.latitude as number) || 0,
    longitude: (row.longitude as number) || 0,
    phone: (row.phone as string) || "",
    email: (row.email as string) || "",
    website: (row.website as string) || "",
    priceRange: parseInt(row.price_range as string || "2") as 1 | 2 | 3 | 4,
    avgRating: parseFloat(row.avg_rating as string) || 0,
    reviewCount: (row.review_count as number) || 0,
    openingHours: (row.opening_hours as Record<string, { open: string; close: string }>) || {},
    features: (row.features as string[]) || [],
    coverImage: (row.cover_image as string) || placeholderImages[index % placeholderImages.length],
    images: [],
    isFeatured: (row.is_featured as boolean) || false,
    isPublished: (row.is_published as boolean) || true,
    menuItems: [],
  };
}

interface Props {
  restaurant: Restaurant;
}

export function SimilarRestaurants({ restaurant }: Props) {
  const t = useTranslations("restaurant");
  const params = useParams();
  const locale = params.locale as string;
  const [similar, setSimilar] = useState<Restaurant[]>([]);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .eq("is_published", true)
          .neq("id", restaurant.id)
          .or(`canton.eq.${restaurant.canton},cuisine_type.eq.${restaurant.cuisineType}`)
          .order("avg_rating", { ascending: false })
          .limit(3);

        if (!error && data) {
          setSimilar(data.map((row, i) => mapDbToRestaurant(row as Record<string, unknown>, i)));
        }
      } catch (err) {
        console.error("Error fetching similar restaurants:", err);
      }
    }
    fetchSimilar();
  }, [restaurant.id, restaurant.canton, restaurant.cuisineType]);

  if (similar.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
        {t("similar")}
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
    </section>
  );
}
