import type { Metadata } from "next";
import { featuresOptions } from "@/data/mock-restaurants";
import type { Restaurant, Review } from "@/data/mock-restaurants";
import { getLocalizedName, getLocalizedDescription } from "@/lib/locale-helpers";
import { notFound } from "next/navigation";
import { RestaurantDetailClient } from "./RestaurantDetailClient";
import { createAdminClient } from "@/lib/supabase/server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch";

// Placeholder images for restaurants without cover images
const placeholderImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80",
  "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80",
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
    images: (row.cover_image as string)
      ? [row.cover_image as string]
      : [placeholderImages[index % placeholderImages.length]],
    isFeatured: (row.is_featured as boolean) || false,
    isPublished: (row.is_published as boolean) || true,
    menuItems: [],
  };
}

function mapDbToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    restaurantId: row.restaurant_id as string,
    authorName: row.author_name as string,
    rating: row.rating as number,
    comment: (row.comment as string) || "",
    createdAt: row.created_at as string,
  };
}

async function getRestaurant(slug: string): Promise<{ restaurant: Restaurant; index: number } | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return { restaurant: mapDbToRestaurant(data as Record<string, unknown>, 0), index: 0 };
}

async function getReviews(restaurantId: string): Promise<Review[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapDbToReview(row as Record<string, unknown>));
}

async function getMenuItems(restaurantId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true)
    .order("position", { ascending: true });

  if (error || !data) return [];
  return data.map((row) => ({
    nameFr: (row.name_fr as string) || "",
    nameDe: (row.name_de as string) || "",
    nameEn: (row.name_en as string) || "",
    descriptionFr: (row.description_fr as string) || "",
    descriptionDe: (row.description_de as string) || "",
    descriptionEn: (row.description_en as string) || "",
    price: parseFloat(row.price as string) || 0,
    category: (row.category as string) || "",
  }));
}

async function getRestaurantImages(restaurantId: string): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurant_images")
    .select("url")
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: true });

  if (error || !data) return [];
  return data.map((row) => row.url as string);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const result = await getRestaurant(slug);

  if (!result) {
    return { title: "Restaurant not found" };
  }

  const { restaurant } = result;
  const name = getLocalizedName(restaurant, locale);
  const description = getLocalizedDescription(restaurant, locale);

  return {
    title: `${name} - ${restaurant.city}`,
    description: description.slice(0, 160),
    alternates: {
      canonical: `/${locale}/restaurants/${slug}`,
      languages: {
        fr: `/fr/restaurants/${slug}`,
        de: `/de/restaurants/${slug}`,
        en: `/en/restaurants/${slug}`,
        pt: `/pt/restaurants/${slug}`,
        es: `/es/restaurants/${slug}`,
      },
    },
    openGraph: {
      title: `${name} - Restaurant ${restaurant.cuisineType} a ${restaurant.city}`,
      description: description.slice(0, 200),
      url: `${baseUrl}/${locale}/restaurants/${slug}`,
      type: "article",
      images: [
        {
          url: restaurant.coverImage,
          width: 800,
          height: 600,
          alt: name,
        },
      ],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const result = await getRestaurant(slug);

  if (!result) {
    notFound();
  }

  const { restaurant } = result;

  // Fetch reviews, menu items, and images in parallel
  const [reviews, menuItems, images] = await Promise.all([
    getReviews(restaurant.id),
    getMenuItems(restaurant.id),
    getRestaurantImages(restaurant.id),
  ]);

  // Enrich restaurant with menu items and images
  const enrichedRestaurant: Restaurant = {
    ...restaurant,
    menuItems,
    images: images.length > 0 ? images : restaurant.images,
  };

  // Structured data - Restaurant (Schema.org)
  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: getLocalizedName(enrichedRestaurant, locale),
    description: getLocalizedDescription(enrichedRestaurant, locale),
    image: enrichedRestaurant.images,
    address: {
      "@type": "PostalAddress",
      streetAddress: enrichedRestaurant.address,
      addressLocality: enrichedRestaurant.city,
      postalCode: enrichedRestaurant.postalCode,
      addressRegion: enrichedRestaurant.canton,
      addressCountry: "CH",
    },
    telephone: enrichedRestaurant.phone,
    email: enrichedRestaurant.email,
    url: enrichedRestaurant.website,
    servesCuisine: enrichedRestaurant.cuisineType,
    priceRange: "$".repeat(enrichedRestaurant.priceRange),
    aggregateRating: enrichedRestaurant.reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: enrichedRestaurant.avgRating,
          reviewCount: enrichedRestaurant.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    review: reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.authorName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment,
      datePublished: review.createdAt,
    })),
    hasMenu: menuItems.length > 0
      ? {
          "@type": "Menu",
          hasMenuSection: [...new Set(menuItems.map((i) => i.category))].map(
            (category) => ({
              "@type": "MenuSection",
              name: category,
              hasMenuItem: menuItems
                .filter((i) => i.category === category)
                .map((item) => ({
                  "@type": "MenuItem",
                  name: getLocalizedName(item, locale),
                  description: getLocalizedDescription(item, locale),
                  offers: {
                    "@type": "Offer",
                    priceCurrency: "CHF",
                    price: item.price,
                  },
                })),
            })
          ),
        }
      : undefined,
  };

  // BreadcrumbList structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Just-Tag",
        item: `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Restaurants",
        item: `${baseUrl}/${locale}/restaurants`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: getLocalizedName(enrichedRestaurant, locale),
        item: `${baseUrl}/${locale}/restaurants/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RestaurantDetailClient
        restaurant={enrichedRestaurant}
        reviews={reviews}
        locale={locale}
        featuresOptions={featuresOptions}
      />
    </>
  );
}
