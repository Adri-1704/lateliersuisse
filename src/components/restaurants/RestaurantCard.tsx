"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Star, MapPin, Heart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@/data/mock-restaurants";
import { getLocalizedName, getLocalizedDescription } from "@/lib/locale-helpers";

function isOpenNow(openingHours: Restaurant["openingHours"]): boolean {
  const now = new Date();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
  const today = days[now.getDay()];
  const hours = openingHours[today];
  if (!hours) return false;
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const openTime = openH * 100 + openM;
  const closeTime = closeH * 100 + closeM;
  return currentTime >= openTime && currentTime <= closeTime;
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("featured");
  const tR = useTranslations("restaurant");

  const name = getLocalizedName(restaurant, locale);
  const description = getLocalizedDescription(restaurant, locale);

  const open = isOpenNow(restaurant.openingHours);

  return (
    <Link href={`/${locale}/restaurants/${restaurant.slug}`}>
      <div className="group h-full overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={restaurant.coverImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Top left: Featured badge or cuisine */}
          {restaurant.isFeatured ? (
            <Badge className="absolute left-3 top-3 bg-[var(--color-just-tag)] text-white border-0 animate-pulse-gentle">
              {t("badge")}
            </Badge>
          ) : (
            <Badge className="absolute left-3 top-3 bg-black/50 text-white border-0 backdrop-blur-sm text-xs">
              {restaurant.cuisineType}
            </Badge>
          )}

          {/* Top right: Heart icon */}
          <button
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 opacity-0 transition-all group-hover:opacity-100 hover:bg-white"
            onClick={(e) => { e.preventDefault(); }}
            aria-label="Save"
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </button>

          {/* Bottom left: Canton badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Badge className="bg-white/90 text-gray-800 border-0 backdrop-blur-sm text-xs font-semibold">
              {restaurant.canton.slice(0, 2).toUpperCase()}
            </Badge>
            {/* Open/Closed indicator */}
            <Badge className={`border-0 backdrop-blur-sm text-xs ${
              open
                ? "bg-green-500/90 text-white"
                : "bg-gray-500/80 text-white"
            }`}>
              <Clock className="mr-1 h-3 w-3" />
              {open ? tR("open") : tR("closed")}
            </Badge>
          </div>

          {/* Bottom right: Price range */}
          <div className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2 py-1 backdrop-blur-sm">
            <span className="text-xs font-medium">
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  className={
                    i < restaurant.priceRange
                      ? "text-gray-900"
                      : "text-gray-300"
                  }
                >
                  $
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--color-just-tag)] transition-colors line-clamp-1">
              {name}
            </h3>
            {/* Rating badge */}
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--color-just-tag)]/10 px-2 py-1">
              <Star className="h-3.5 w-3.5 fill-[var(--color-just-tag)] text-[var(--color-just-tag)]" />
              <span className="text-sm font-bold text-[var(--color-just-tag)]">{restaurant.avgRating}</span>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {restaurant.city}, {restaurant.canton}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">({restaurant.reviewCount})</span>
          </div>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {restaurant.features.slice(0, 3).map((feature) => (
              <Badge
                key={feature}
                variant="secondary"
                className="text-xs font-normal"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
