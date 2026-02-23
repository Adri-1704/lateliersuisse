import type { Metadata } from "next";
import { mockRestaurants, mockReviews, featuresOptions } from "@/data/mock-restaurants";
import { getLocalizedName, getLocalizedDescription } from "@/lib/locale-helpers";
import { notFound } from "next/navigation";
import { RestaurantDetailClient } from "./RestaurantDetailClient";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const restaurant = mockRestaurants.find((r) => r.slug === slug);

  if (!restaurant) {
    return { title: "Restaurant not found" };
  }

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

export async function generateStaticParams() {
  return mockRestaurants
    .filter((r) => r.isPublished)
    .map((r) => ({ slug: r.slug }));
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const restaurant = mockRestaurants.find((r) => r.slug === slug);

  if (!restaurant) {
    notFound();
  }

  const reviews = mockReviews.filter((r) => r.restaurantId === restaurant.id);

  // Structured data - Restaurant (Schema.org)
  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: getLocalizedName(restaurant, locale),
    description: getLocalizedDescription(restaurant, locale),
    image: restaurant.images,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      postalCode: restaurant.postalCode,
      addressRegion: restaurant.canton,
      addressCountry: "CH",
    },
    telephone: restaurant.phone,
    email: restaurant.email,
    url: restaurant.website,
    servesCuisine: restaurant.cuisineType,
    priceRange: "$".repeat(restaurant.priceRange),
    aggregateRating: restaurant.reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: restaurant.avgRating,
          reviewCount: restaurant.reviewCount,
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
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: [...new Set(restaurant.menuItems.map((i) => i.category))].map(
        (category) => ({
          "@type": "MenuSection",
          name: category,
          hasMenuItem: restaurant.menuItems
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
    },
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
        name: getLocalizedName(restaurant, locale),
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
        restaurant={restaurant}
        reviews={reviews}
        locale={locale}
        featuresOptions={featuresOptions}
      />
    </>
  );
}
