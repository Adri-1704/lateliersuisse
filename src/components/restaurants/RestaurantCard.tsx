"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Star, MapPin, Clock } from "lucide-react";
import { FavoriteButton } from "@/components/restaurants/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@/data/mock-restaurants";
import { DistinctionBadges } from "@/components/restaurants/DistinctionBadges";
import { PromotionBadge } from "@/components/restaurants/PromotionBadge";
import { getLocalizedName, getLocalizedDescription } from "@/lib/locale-helpers";
import { useIsOpenNow } from "@/lib/use-is-open-now";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("featured");
  const tR = useTranslations("restaurant");

  const name = getLocalizedName(restaurant, locale);
  const description = getLocalizedDescription(restaurant, locale);

  const open = useIsOpenNow(restaurant.openingHours);

  // Source de vérité unique pour la note affichée (#34) : la note Google
  // (avis vérifiés, volume réel) prévaut sur la note interne quand elle est
  // disponible, pour éviter la contradiction "5/5 (5 avis)" affichée en
  // façade d'un établissement décrit comme "noté 4.3/5 sur Google avec 255 avis".
  const displayRating = restaurant.googleRating ?? restaurant.avgRating;
  const displayReviewCount = restaurant.googleReviewCount ?? restaurant.reviewCount;

  return (
    <Link href={`/${locale}/restaurants/${restaurant.slug}`} className="block w-full">
      <div className="group h-full overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center px-4">
          {/* Bandeau décoratif utilisé comme visuel de remplacement quand le
              restaurant n'a pas de photo de couverture : le nom y est répété
              visuellement, mais ce n'est pas un titre de page (le vrai titre
              est le <h3> ci-dessous) — évite un h4 fantôme dans la hiérarchie
              des titres et la double annonce du nom aux lecteurs d'écran
              (#42, #43). */}
          <p aria-hidden="true" className="relative z-10 text-center text-lg font-bold text-white leading-snug line-clamp-3">{name}</p>

          {/* Top left: Featured badge or cuisine */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {restaurant.isFeatured ? (
              <Badge className="bg-[var(--color-just-tag)] text-white border-0 animate-pulse-gentle">
                {t("badge")}
              </Badge>
            ) : (
              <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs">
                {restaurant.cuisineType}
              </Badge>
            )}
            {restaurant.promotions && restaurant.promotions.length > 0 && (
              <PromotionBadge promotion={restaurant.promotions[0]} size="sm" />
            )}
          </div>

          {/* Top right: Heart icon — zone tactile 44x44 (#43) ; visible par
              défaut sur mobile (pas de :hover), révélé au survol sur
              desktop pour ne pas surcharger visuellement la carte. */}
          <FavoriteButton
            restaurantId={restaurant.id}
            className="absolute right-3 top-3 h-11 w-11 bg-white/80 opacity-100 hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
          />

          {/* Bottom left: Canton badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Badge className="bg-white/90 text-gray-800 border-0 backdrop-blur-sm text-xs font-semibold">
              {restaurant.canton.slice(0, 2).toUpperCase()}
            </Badge>
            {/* Open/Closed indicator — hidden if hours unknown */}
            {open !== null && (
              <Badge className={`border-0 backdrop-blur-sm text-xs ${
                open
                  ? "bg-green-500/90 text-white"
                  : "bg-gray-500/80 text-white"
              }`}>
                <Clock className="mr-1 h-3 w-3" />
                {open ? tR("open") : tR("closed")}
              </Badge>
            )}
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
        <div className="p-4 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 text-lg font-semibold text-gray-900 group-hover:text-[var(--color-just-tag)] transition-colors line-clamp-1">
              {name}
            </h3>
            {/* Rating badge */}
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-1">
              <Star className="h-3.5 w-3.5 fill-[var(--color-just-tag)] text-[var(--color-just-tag)]" />
              <span className="text-sm font-bold text-[var(--color-just-tag)]">{displayRating}</span>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {restaurant.city ? `${restaurant.city}, ${restaurant.canton}` : restaurant.canton}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">({displayReviewCount})</span>
          </div>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {description}
          </p>
          {restaurant.badges && restaurant.badges.length > 0 && (
            <div className="mt-2">
              <DistinctionBadges badges={restaurant.badges} size="sm" />
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
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
