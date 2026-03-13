"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { useFavorites } from "@/hooks/useFavorites";
import { mockRestaurants, type Restaurant } from "@/data/mock-restaurants";
import { createClient } from "@/lib/supabase/client";

const placeholderImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
];

export default function FavorisPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { favorites } = useFavorites();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (favorites.length === 0) {
        setRestaurants([]);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("restaurants")
          .select("*")
          .in("id", favorites)
          .eq("is_published", true);

        if (data && data.length > 0) {
          setRestaurants(
            data.map((row: Record<string, unknown>, i: number) => ({
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
              priceRange: parseInt((row.price_range as string) || "2") as 1 | 2 | 3 | 4,
              avgRating: parseFloat(row.avg_rating as string) || 0,
              reviewCount: (row.review_count as number) || 0,
              openingHours: (row.opening_hours as Restaurant["openingHours"]) || {},
              features: (row.features as string[]) || [],
              coverImage: (row.cover_image as string) || placeholderImages[i % placeholderImages.length],
              images: [],
              isFeatured: (row.is_featured as boolean) || false,
              isPublished: true,
              menuItems: [],
            }))
          );
        } else {
          // Fallback to mock data
          setRestaurants(mockRestaurants.filter((r) => favorites.includes(r.id)));
        }
      } catch {
        setRestaurants(mockRestaurants.filter((r) => favorites.includes(r.id)));
      }
      setLoading(false);
    }
    load();
  }, [favorites]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {locale === "de" ? "Meine Favoriten" : locale === "en" ? "My favorites" : locale === "pt" ? "Meus favoritos" : locale === "es" ? "Mis favoritos" : "Mes favoris"}
        </h1>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : restaurants.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">
            {locale === "de" ? "Noch keine Favoriten" : locale === "en" ? "No favorites yet" : locale === "pt" ? "Sem favoritos ainda" : locale === "es" ? "Sin favoritos todavía" : "Aucun favori pour le moment"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {locale === "de" ? "Klicken Sie auf das Herz-Symbol, um Restaurants zu speichern" : locale === "en" ? "Click the heart icon to save restaurants" : locale === "pt" ? "Clique no ícone de coração para salvar restaurantes" : locale === "es" ? "Haga clic en el icono del corazón para guardar restaurantes" : "Cliquez sur le coeur pour sauvegarder des restaurants"}
          </p>
        </div>
      )}
    </div>
  );
}
