"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ChevronLeft, ChevronRight, Clock, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockRestaurants, mockReviews, type Restaurant } from "@/data/mock-restaurants";
import { getLocalizedName } from "@/lib/locale-helpers";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";

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
  if (!hours) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  return currentMinutes >= openH * 60 + openM && currentMinutes <= closeH * 60 + closeM;
}

function RestaurantSlideCard({ restaurant, locale }: { restaurant: Restaurant; locale: string }) {
  const t = useTranslations("featured");
  const tR = useTranslations("restaurant");
  const name = getLocalizedName(restaurant, locale);
  const open = isOpenNow(restaurant.openingHours);

  // Get the best review for this restaurant
  const bestReview = mockReviews
    .filter((r) => r.restaurantId === restaurant.id)
    .sort((a, b) => b.rating - a.rating)[0];

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

function RestaurantSlideCardCompact({ restaurant, locale }: { restaurant: Restaurant; locale: string }) {
  const t = useTranslations("featured");
  const tR = useTranslations("restaurant");
  const name = getLocalizedName(restaurant, locale);
  const open = isOpenNow(restaurant.openingHours);

  // Get the best review for this restaurant
  const bestReview = mockReviews
    .filter((r) => r.restaurantId === restaurant.id)
    .sort((a, b) => b.rating - a.rating)[0];

  return (
    <Link href={`/${locale}/restaurants/${restaurant.slug}`}>
      <div className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={restaurant.coverImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {restaurant.isFeatured && (
            <Badge className="absolute left-3 top-3 bg-[var(--color-just-tag)] text-white border-0 text-xs px-2.5 py-0.5 animate-pulse-gentle">
              ⭐ {t("badge")}
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

export function RestaurantOfMonth() {
  const t = useTranslations("featured");
  const params = useParams();
  const locale = params.locale as string;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Show top 8 restaurants (featured first, then by rating)
  const topRestaurants = [
    ...mockRestaurants.filter((r) => r.isFeatured),
    ...mockRestaurants.filter((r) => !r.isFeatured).sort((a, b) => b.avgRating - a.avgRating),
  ].slice(0, 8);

  // Split into pairs for 2-row layout
  const slides: Restaurant[][] = [];
  for (let i = 0; i < topRestaurants.length; i += 2) {
    slides.push(topRestaurants.slice(i, i + 2));
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-2 text-gray-600">{t("subtitle")}</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="outline" size="icon" onClick={scrollPrev} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={scrollNext} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-8 overflow-hidden" ref={emblaRef}>
          <div className="-ml-4 flex">
            {slides.map((pair, idx) => (
              <div key={idx} className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                <div className="flex flex-col gap-6">
                  {pair.map((restaurant) => (
                    <RestaurantSlideCardCompact
                      key={restaurant.id}
                      restaurant={restaurant}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
