"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ChevronLeft, ChevronRight, Clock, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/data/mock-restaurants";
import { getLocalizedName } from "@/lib/locale-helpers";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DbReview {
  id: string;
  restaurant_id: string;
  author_name: string;
  rating: number;
  comment: string;
}

const placeholderImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=75&fm=webp",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=75&fm=webp",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75&fm=webp",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&q=75&fm=webp",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=75&fm=webp",
];

function PriceRange({ range }: { range: number }) {
  return (
    <span className="text-sm font-medium">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className={i < range ? "text-gray-900" : "text-gray-300"}>
          $
        </span>
      ))}
    </span>
  );
}

function isOpenNow(openingHours: Record<string, { open: string; close: string } | null>): boolean {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const now = new Date();
  const dayName = days[now.getDay()];
  const hours = openingHours[dayName];
  if (!hours || !("open" in hours) || !("close" in hours)) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  return currentMinutes >= openH * 60 + openM && currentMinutes <= closeH * 60 + closeM;
}

function RestaurantSlideCard({ restaurant, bestReview, locale }: { restaurant: Restaurant; bestReview?: DbReview; locale: string }) {
  const t = useTranslations("featured");
  const tR = useTranslations("restaurant");
  const name = getLocalizedName(restaurant, locale);
  const open = isOpenNow(restaurant.openingHours);

  return (
    <div className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
      <Link href={`/${locale}/restaurants/${restaurant.slug}`}>
        <div className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg">
          <div className="relative h-52 overflow-hidden">
            <Image
              src={restaurant.coverImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {restaurant.isFeatured && (
              <Badge className="absolute left-3 top-3 bg-[var(--color-just-tag)] text-white border-0 animate-pulse-gentle">
                {t("badge")}
              </Badge>
            )}
            {/* Open/Closed badge */}
            <div className="absolute bottom-3 left-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                open ? "bg-green-500/90 text-white" : "bg-gray-800/80 text-gray-200"
              }`}>
                <Clock className="h-3 w-3" />
                {open ? tR("open") : tR("closed")}
              </span>
            </div>
            {/* Rating badge */}
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-sm font-bold text-gray-900 shadow-sm">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {restaurant.avgRating}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--color-just-tag)] transition-colors">
              {name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-gray-500">({restaurant.reviewCount} {tR("reviews")})</span>
              <span className="text-gray-300">|</span>
              <PriceRange range={restaurant.priceRange} />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {restaurant.city}, {restaurant.canton.toUpperCase().slice(0, 2)}
            </div>
            {/* Review snippet */}
            {bestReview && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 p-2.5">
                <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-just-tag)] rotate-180" />
                <p className="text-xs text-gray-600 line-clamp-2 italic">
                  {bestReview.comment.length > 80
                    ? bestReview.comment.slice(0, 80) + "…"
                    : bestReview.comment}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function RestaurantSlideCardCompact({ restaurant, bestReview, locale }: { restaurant: Restaurant; bestReview?: DbReview; locale: string }) {
  const t = useTranslations("featured");
  const tR = useTranslations("restaurant");
  const name = getLocalizedName(restaurant, locale);
  const open = isOpenNow(restaurant.openingHours);

  return (
    <Link href={`/${locale}/restaurants/${restaurant.slug}`}>
      <div className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center px-4">
          <h4 className="relative z-10 text-center text-base font-bold text-white leading-snug line-clamp-3">{name}</h4>
          {restaurant.isFeatured && (
            <Badge className="absolute left-3 top-3 bg-[var(--color-just-tag)] text-white border-0 text-xs px-2.5 py-0.5 animate-pulse-gentle">
              {t("badge")}
            </Badge>
          )}
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              open ? "bg-green-500/90 text-white" : "bg-gray-800/80 text-gray-200"
            }`}>
              <Clock className="h-3 w-3" />
              {open ? tR("open") : tR("closed")}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-sm font-bold text-gray-900 shadow-sm">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {restaurant.avgRating}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-[var(--color-just-tag)] transition-colors">
            {name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{restaurant.city}, {restaurant.canton.toUpperCase().slice(0, 2)}</span>
            </div>
            <span className="text-gray-300">|</span>
            <PriceRange range={restaurant.priceRange} />
          </div>
          <div className="mt-1 text-xs text-gray-400">
            ({restaurant.reviewCount} {tR("reviews")})
          </div>
          {/* Review snippet */}
          {bestReview && (
            <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-gray-50 p-2">
              <Quote className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-just-tag)] rotate-180" />
              <p className="text-xs text-gray-600 line-clamp-2 italic">
                {bestReview.comment.length > 70
                  ? bestReview.comment.slice(0, 70) + "…"
                  : bestReview.comment}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

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

export function RestaurantOfMonth() {
  const t = useTranslations("featured");
  const params = useParams();
  const locale = params.locale as string;
  const [topRestaurants, setTopRestaurants] = useState<Restaurant[]>([]);
  const [reviews, setReviews] = useState<DbReview[]>([]);

  // Fetch 12 featured restaurants from Supabase
  useEffect(() => {
    async function fetchFeatured() {
      const supabase = createClient();

      // Fetch all 12 featured restaurants
      const { data: featured } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("review_count", { ascending: false })
        .limit(12);

      let restaurants = (featured || []).map((row, i) =>
        mapDbToRestaurant(row as Record<string, unknown>, i)
      );

      // If less than 8 featured, fill with top rated
      if (restaurants.length < 8) {
        const featuredIds = restaurants.map((r) => r.id);
        const { data: topRated } = await supabase
          .from("restaurants")
          .select("*")
          .eq("is_published", true)
          .eq("is_featured", false)
          .order("review_count", { ascending: false })
          .limit(8 - restaurants.length);

        const extra = (topRated || []).map((row, i) =>
          mapDbToRestaurant(row as Record<string, unknown>, restaurants.length + i)
        ).filter((r) => !featuredIds.includes(r.id));

        restaurants = [...restaurants, ...extra].slice(0, 8);
      }

      setTopRestaurants(restaurants);

      // Fetch best review per restaurant
      if (restaurants.length > 0) {
        const ids = restaurants.map((r) => r.id);
        const { data: revs } = await supabase
          .from("reviews")
          .select("id, restaurant_id, author_name, rating, comment")
          .in("restaurant_id", ids)
          .order("rating", { ascending: false });

        setReviews((revs as DbReview[]) || []);
      }
    }
    fetchFeatured();
  }, []);

  function getBestReview(restaurantId: string): DbReview | undefined {
    return reviews.find((r) => r.restaurant_id === restaurantId);
  }

  if (topRestaurants.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topRestaurants.map((restaurant) => (
            <RestaurantSlideCardCompact
              key={restaurant.id}
              restaurant={restaurant}
              bestReview={getBestReview(restaurant.id)}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
