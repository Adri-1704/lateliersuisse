"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  X,
  Camera,
  Navigation,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwissCrossIcon } from "@/components/ui/swiss-cross";
import { SimilarRestaurants } from "@/components/restaurants/SimilarRestaurants";
import type { Restaurant, Review } from "@/data/mock-restaurants";
import { getLocalizedName, getLocalizedDescription, getLocalizedLabelAlt } from "@/lib/locale-helpers";
import { submitReview } from "@/actions/reviews";

interface FeatureOption {
  value: string;
  labelFr: string;
  labelDe: string;
  labelEn: string;
  labelPt?: string;
  labelEs?: string;
}

interface Props {
  restaurant: Restaurant;
  reviews: Review[];
  locale: string;
  featuresOptions: FeatureOption[];
}

function PriceRange({ range }: { range: number }) {
  return (
    <span className="font-medium">
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

function relativeDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    const todayMap: Record<string, string> = { de: "Heute", en: "Today", pt: "Hoje", es: "Hoy" };
    return todayMap[locale] || "Aujourd'hui";
  }
  if (diffDays < 7) {
    if (locale === "de") return `Vor ${diffDays} Tagen`;
    if (locale === "en") return `${diffDays} days ago`;
    if (locale === "pt") return `Há ${diffDays} dias`;
    if (locale === "es") return `Hace ${diffDays} días`;
    return `Il y a ${diffDays} jours`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    if (locale === "de") return `Vor ${weeks} Woche${weeks > 1 ? "n" : ""}`;
    if (locale === "en") return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    if (locale === "pt") return `Há ${weeks} semana${weeks > 1 ? "s" : ""}`;
    if (locale === "es") return `Hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
    return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  }
  const months = Math.floor(diffDays / 30);
  if (locale === "de") return `Vor ${months} Monat${months > 1 ? "en" : ""}`;
  if (locale === "en") return `${months} month${months > 1 ? "s" : ""} ago`;
  if (locale === "pt") return `Há ${months} ${months > 1 ? "meses" : "mês"}`;
  if (locale === "es") return `Hace ${months} ${months > 1 ? "meses" : "mes"}`;
  return `Il y a ${months} mois`;
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  if (total === 0) return null;

  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((r) => r.rating === stars).length;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <span className="w-3 text-gray-600">{stars}</span>
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-right text-xs text-gray-400">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function PhotoLightbox({
  images,
  initialIndex,
  name,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  name: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIndex((i) => (i - 1 + images.length) % images.length);
        }}
        className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="relative h-[80vh] w-[90vw] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={images[index]}
          alt={`${name} - Photo ${index + 1}`}
          fill
          className="object-contain"
          sizes="90vw"
        />
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIndex((i) => (i + 1) % images.length);
        }}
        className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}

export function RestaurantDetailClient({ restaurant, reviews, locale, featuresOptions }: Props) {
  const t = useTranslations("restaurant");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [localAvgRating, setLocalAvgRating] = useState(restaurant.avgRating);
  const [localReviewCount, setLocalReviewCount] = useState(restaurant.reviewCount);

  const handleSubmitReview = useCallback(async () => {
    setReviewError(null);

    if (!reviewName.trim() || reviewName.trim().length < 2) {
      setReviewError(t("reviewForm.errorName"));
      return;
    }
    if (reviewRating < 1) {
      setReviewError(t("reviewForm.errorRating"));
      return;
    }

    setReviewSubmitting(true);
    try {
      const result = await submitReview({
        restaurant_id: restaurant.id,
        author_name: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });

      if (result.success && result.review) {
        // Optimistic update: add the new review to the list
        const newReview: Review = {
          id: result.review.id,
          restaurantId: result.review.restaurantId,
          authorName: result.review.authorName,
          rating: result.review.rating,
          comment: result.review.comment,
          createdAt: result.review.createdAt,
        };
        const updatedReviews = [newReview, ...localReviews];
        setLocalReviews(updatedReviews);

        // Update local avg rating and count
        const newCount = localReviewCount + 1;
        const newAvg = ((localAvgRating * localReviewCount) + newReview.rating) / newCount;
        setLocalAvgRating(Math.round(newAvg * 10) / 10);
        setLocalReviewCount(newCount);

        // Reset form
        setReviewName("");
        setReviewRating(0);
        setReviewComment("");
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewSuccess(false);
          setShowReviewForm(false);
        }, 3000);
      } else {
        setReviewError(result.error || t("reviewForm.errorGeneric"));
      }
    } catch {
      setReviewError(t("reviewForm.errorGeneric"));
    } finally {
      setReviewSubmitting(false);
    }
  }, [reviewName, reviewRating, reviewComment, restaurant.id, localReviews, localAvgRating, localReviewCount, t]);

  const name = getLocalizedName(restaurant, locale);
  const description = getLocalizedDescription(restaurant, locale);
  const open = isOpenNow(restaurant.openingHours);
  const isSwissCuisine = restaurant.cuisineType === "suisse";

  const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

  const getFeatureLabel = (value: string) => {
    const feature = featuresOptions.find((f) => f.value === value);
    if (!feature) return value;
    return getLocalizedLabelAlt(feature, locale);
  };

  // Average menu price
  const avgMenuPrice =
    restaurant.menuItems.length > 0
      ? Math.round(restaurant.menuItems.reduce((sum, item) => sum + item.price, 0) / restaurant.menuItems.length)
      : 0;

  // Category colors for menu
  const categoryColors = ["border-l-[var(--color-just-tag)]", "border-l-blue-500", "border-l-green-500", "border-l-purple-500", "border-l-orange-500"];

  // OpenStreetMap embed URL
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${restaurant.longitude - 0.005}%2C${restaurant.latitude - 0.003}%2C${restaurant.longitude + 0.005}%2C${restaurant.latitude + 0.003}&layer=mapnik&marker=${restaurant.latitude}%2C${restaurant.longitude}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href={`/${locale}`} className="hover:text-[var(--color-just-tag)] transition-colors">
          {tNav("home")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${locale}/restaurants`} className="hover:text-[var(--color-just-tag)] transition-colors">
          {tNav("restaurants")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/${locale}/restaurants?canton=${restaurant.canton}`}
          className="hover:text-[var(--color-just-tag)] transition-colors"
        >
          {restaurant.canton.charAt(0).toUpperCase() + restaurant.canton.slice(1)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium truncate">{name}</span>
      </nav>

      {/* Photo Gallery */}
      {restaurant.images.length >= 3 ? (
        <div className="relative grid grid-cols-1 gap-2 md:grid-cols-3 overflow-hidden rounded-2xl">
          <div
            className="relative col-span-1 md:col-span-2 h-64 md:h-[400px] cursor-pointer"
            onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
          >
            <Image
              src={restaurant.images[0]}
              alt={name}
              fill
              className="object-cover hover:brightness-95 transition-all"
              priority
            />
          </div>
          <div className="hidden md:grid gap-2">
            {restaurant.images.slice(1, 3).map((img, i) => (
              <div
                key={i}
                className="relative h-[196px] cursor-pointer"
                onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
              >
                <Image
                  src={img}
                  alt={`${name} ${i + 2}`}
                  fill
                  className="object-cover hover:brightness-95 transition-all"
                  sizes="33vw"
                />
                {/* "See all photos" on last visible image */}
                {i === 1 && restaurant.images.length > 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
                    <span className="flex items-center gap-2 text-sm font-medium text-white">
                      <Camera className="h-4 w-4" />
                      {t("photos")} ({restaurant.images.length})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="relative h-64 md:h-[400px] overflow-hidden rounded-2xl cursor-pointer"
          onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
        >
          <Image
            src={restaurant.images[0] || restaurant.coverImage}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <PhotoLightbox
          images={restaurant.images}
          initialIndex={lightboxIndex}
          name={name}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Title Section */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {name}
              </h1>
              {restaurant.isFeatured && (
                <Badge className="bg-[var(--color-just-tag)] text-white border-0 animate-pulse-gentle">
                  ⭐ {locale === "de" ? "Restaurant des Monats" : locale === "en" ? "Restaurant of the month" : locale === "pt" ? "Restaurante do mês" : locale === "es" ? "Restaurante del mes" : "Restaurant du mois"}
                </Badge>
              )}
              {isSwissCuisine && (
                <Badge variant="outline" className="border-[var(--color-just-tag)]/30 text-[var(--color-just-tag)] gap-1">
                  <SwissCrossIcon size={12} />
                  {locale === "de" ? "Schweizer Qualität" : locale === "en" ? "Swiss Quality" : locale === "pt" ? "Qualidade Suíça" : locale === "es" ? "Calidad Suiza" : "Qualité Suisse"}
                </Badge>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {/* Rating circle */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-just-tag)] text-white font-bold text-sm">
                  {localAvgRating}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.round(localAvgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({localReviewCount} {t("reviews")})</span>
                </div>
              </div>
              <span className="text-gray-300">|</span>
              <PriceRange range={restaurant.priceRange} />
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">{restaurant.cuisineType}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-3.5 w-3.5" />
                {restaurant.city}
              </span>
              <span className="text-gray-300">|</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                open ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"
              }`}>
                <Clock className="h-3 w-3" />
                {open ? t("open") : t("closed")}
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <p className="text-gray-700 leading-relaxed">{description}</p>

          {/* Features */}
          <div className="mt-6 flex flex-wrap gap-2">
            {restaurant.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-sm px-3 py-1">
                {getFeatureLabel(feature)}
              </Badge>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Tabs */}
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="menu">{t("menu")}</TabsTrigger>
              <TabsTrigger value="reviews">{t("reviews")} ({localReviews.length})</TabsTrigger>
              <TabsTrigger value="hours">{t("hours")}</TabsTrigger>
            </TabsList>

            {/* Menu Tab */}
            <TabsContent value="menu" className="mt-6">
              {/* Average price indicator */}
              {avgMenuPrice > 0 && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm">
                  <span className="text-gray-500">
                    {{ de: "Durchschnittspreis", en: "Average price", pt: "Preço médio", es: "Precio medio" }[locale] || "Prix moyen"}:
                  </span>
                  <span className="font-semibold text-gray-900">CHF {avgMenuPrice}</span>
                </div>
              )}
              {(() => {
                const categories = [...new Set(restaurant.menuItems.map((item) => item.category))];
                return categories.map((category, catIdx) => (
                  <div key={category} className="mb-8">
                    <h3 className={`text-lg font-semibold text-gray-900 mb-4 border-l-4 pl-3 ${categoryColors[catIdx % categoryColors.length]}`}>
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {restaurant.menuItems
                        .filter((item) => item.category === category)
                        .map((item, idx) => {
                          const itemName = getLocalizedName(item, locale);
                          const itemDesc = getLocalizedDescription(item, locale);
                          return (
                            <div key={idx} className="flex items-start justify-between rounded-lg border p-4">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{itemName}</h4>
                                <p className="mt-1 text-sm text-gray-500">{itemDesc}</p>
                              </div>
                              <span className="ml-4 shrink-0 font-semibold text-gray-900">
                                CHF {item.price}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ));
              })()}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              {/* Aggregate rating */}
              <div className="mb-8 flex flex-col items-center gap-6 rounded-xl border bg-gray-50 p-6 sm:flex-row">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{localAvgRating}</div>
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(localAvgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{localReviewCount} {t("reviews")}</p>
                </div>
                <div className="w-full max-w-xs">
                  <RatingDistribution reviews={localReviews} />
                </div>
              </div>

              <div className="space-y-4">
                {localReviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-just-tag)]/10 text-sm font-semibold text-[var(--color-just-tag)]">
                          {review.authorName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{review.authorName}</span>
                          <p className="text-xs text-gray-400">{relativeDate(review.createdAt, locale)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    {review.replyComment && (
                      <div className="mt-3 ml-4 rounded-lg bg-gray-50 border-l-2 border-[var(--color-just-tag)] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-[var(--color-just-tag)]">
                            {t("restaurantReply")}
                          </span>
                          {review.replyDate && (
                            <span className="text-xs text-gray-400">
                              {relativeDate(review.replyDate, locale)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{review.replyComment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Write review CTA & Form */}
              <div className="mt-6">
                {!showReviewForm && !reviewSuccess && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      className="border-[var(--color-just-tag)]/30 text-[var(--color-just-tag)]"
                      onClick={() => setShowReviewForm(true)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      {t("writeReview")}
                    </Button>
                  </div>
                )}

                {reviewSuccess && (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{t("reviewForm.success")}</span>
                  </div>
                )}

                {showReviewForm && !reviewSuccess && (
                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reviewForm.title")}</h3>

                    {reviewError && (
                      <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {reviewError}
                      </div>
                    )}

                    {/* Author name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("reviewForm.name")}
                      </label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder={t("reviewForm.namePlaceholder")}
                        maxLength={50}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-just-tag)] focus:outline-none focus:ring-1 focus:ring-[var(--color-just-tag)]"
                      />
                    </div>

                    {/* Star rating selector */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("reviewForm.rating")}
                      </label>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => {
                          const starValue = i + 1;
                          const isFilled = starValue <= (reviewHoverRating || reviewRating);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewRating(starValue)}
                              onMouseEnter={() => setReviewHoverRating(starValue)}
                              onMouseLeave={() => setReviewHoverRating(0)}
                              className="p-0.5 transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-7 w-7 transition-colors ${
                                  isFilled
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 hover:text-yellow-300"
                                }`}
                              />
                            </button>
                          );
                        })}
                        {reviewRating > 0 && (
                          <span className="ml-2 text-sm text-gray-500">{reviewRating}/5</span>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("reviewForm.comment")}
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={t("reviewForm.commentPlaceholder")}
                        maxLength={1000}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-just-tag)] focus:outline-none focus:ring-1 focus:ring-[var(--color-just-tag)]"
                      />
                      <p className="mt-1 text-xs text-gray-400 text-right">{reviewComment.length}/1000</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={reviewSubmitting}
                        className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
                      >
                        {reviewSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="mr-2 h-4 w-4" />
                        )}
                        {t("reviewForm.submit")}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewError(null);
                        }}
                        disabled={reviewSubmitting}
                      >
                        {t("reviewForm.cancel")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Hours Tab */}
            <TabsContent value="hours" className="mt-6">
              <div className="rounded-lg border">
                {dayKeys.map((day) => {
                  const hours = restaurant.openingHours[day];
                  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                  const todayName = days[new Date().getDay()];
                  const isToday = day === todayName;
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between border-b last:border-b-0 px-4 py-3 ${
                        isToday ? "bg-[var(--color-just-tag)]/5 font-medium" : ""
                      }`}
                    >
                      <span className={`font-medium capitalize ${isToday ? "text-[var(--color-just-tag)]" : "text-gray-700"}`}>
                        {t(day)} {isToday && "•"}
                      </span>
                      <span className={hours ? (isToday ? "text-[var(--color-just-tag)] font-medium" : "text-gray-900") : "text-red-500"}>
                        {hours ? `${hours.open} - ${hours.close}` : t("closed")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Similar Restaurants */}
          <SimilarRestaurants restaurant={restaurant} />
        </div>

        {/* Sidebar - Contact Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">{t("contact")}</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span className="text-gray-700">
                    {restaurant.address}, {restaurant.postalCode} {restaurant.city}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  <a href={`tel:${restaurant.phone}`} className="text-gray-700 hover:text-[var(--color-just-tag)]">
                    {restaurant.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <a href={`mailto:${restaurant.email}`} className="text-gray-700 hover:text-[var(--color-just-tag)]">
                    {restaurant.email}
                  </a>
                </div>
                {restaurant.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--color-just-tag)] hover:underline"
                    >
                      {t("website")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {restaurant.instagram && (
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    <a
                      href={restaurant.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--color-just-tag)] hover:underline"
                    >
                      {t("followInstagram")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {restaurant.facebook && (
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    <a
                      href={restaurant.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--color-just-tag)] hover:underline"
                    >
                      {t("followFacebook")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {restaurant.tiktok && (
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.17v-3.44a4.85 4.85 0 01-3.58-1.46V6.69h3.58z"/></svg>
                    <a
                      href={restaurant.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--color-just-tag)] hover:underline"
                    >
                      {t("followTiktok")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  asChild
                  className="w-full bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)]"
                >
                  <a href={`tel:${restaurant.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {t("call")}
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href={`mailto:${restaurant.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {t("email")}
                  </a>
                </Button>
              </div>
            </div>

            {/* OpenStreetMap */}
            <div className="overflow-hidden rounded-xl border">
              <iframe
                src={osmUrl}
                className="h-48 w-full border-0"
                loading="lazy"
                title={`${name} - ${t("location")}`}
              />
              <div className="bg-white p-3">
                <p className="text-xs text-gray-500">
                  {restaurant.address}, {restaurant.postalCode} {restaurant.city}
                </p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-just-tag)] hover:underline"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {{ de: "Route berechnen", en: "Get directions", pt: "Como chegar", es: "Cómo llegar" }[locale] || "Itinéraire"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
