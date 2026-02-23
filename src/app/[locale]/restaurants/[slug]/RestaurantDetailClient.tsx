"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwissCrossIcon } from "@/components/ui/swiss-cross";
import { SimilarRestaurants } from "@/components/restaurants/SimilarRestaurants";
import type { Restaurant, Review } from "@/data/mock-restaurants";
import { getLocalizedName, getLocalizedDescription, getLocalizedLabelAlt } from "@/lib/locale-helpers";

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
                  {restaurant.avgRating}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.round(restaurant.avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({restaurant.reviewCount} {t("reviews")})</span>
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
              <TabsTrigger value="reviews">{t("reviews")} ({reviews.length})</TabsTrigger>
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
                  <div className="text-5xl font-bold text-gray-900">{restaurant.avgRating}</div>
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(restaurant.avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{restaurant.reviewCount} {t("reviews")}</p>
                </div>
                <div className="w-full max-w-xs">
                  <RatingDistribution reviews={reviews} />
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
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
                  </div>
                ))}
              </div>

              {/* Write review CTA */}
              <div className="mt-6 text-center">
                <Button variant="outline" className="border-[var(--color-just-tag)]/30 text-[var(--color-just-tag)]">
                  <Star className="mr-2 h-4 w-4" />
                  {t("writeReview")}
                </Button>
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
