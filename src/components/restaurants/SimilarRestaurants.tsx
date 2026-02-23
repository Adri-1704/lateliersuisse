"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { RestaurantCard } from "./RestaurantCard";
import { mockRestaurants, type Restaurant } from "@/data/mock-restaurants";

interface Props {
  restaurant: Restaurant;
}

export function SimilarRestaurants({ restaurant }: Props) {
  const t = useTranslations("restaurant");
  const params = useParams();
  const locale = params.locale as string;

  const similar = mockRestaurants
    .filter(
      (r) =>
        r.id !== restaurant.id &&
        r.isPublished &&
        (r.canton === restaurant.canton || r.cuisineType === restaurant.cuisineType)
    )
    .slice(0, 3);

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
