"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

export function FavoriteButton({ restaurantId, className = "" }: { restaurantId: string; className?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(restaurantId);

  return (
    <button
      className={`flex items-center justify-center rounded-full transition-all ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(restaurantId);
      }}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          active ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
    </button>
  );
}
