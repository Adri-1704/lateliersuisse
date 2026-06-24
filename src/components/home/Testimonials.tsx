import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Star, Quote } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";

const CURATED_REVIEW_IDS = [
  "7c8d9cf4-771d-41d9-89d9-78aa283d4688",
  "4a635f14-18e6-44d9-a12f-214b186aa151",
  "6214f9d7-b5b3-4ba6-93f8-64980d03bff5",
  "c8cfe3d0-5990-4930-b0d8-289a3b4f5497",
];

interface ReviewRow {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  restaurants: { name_fr: string; city: string; slug: string } | null;
}

export async function Testimonials({ locale }: { locale: string }) {
  const t = await getTranslations("testimonials");
  const supabase = createAdminClient();

  const { data } = (await supabase
    .from("reviews")
    .select("id, author_name, rating, comment, restaurants(name_fr, city, slug)")
    .in("id", CURATED_REVIEW_IDS)) as { data: ReviewRow[] | null };

  const reviews = CURATED_REVIEW_IDS
    .map((id) => data?.find((r) => r.id === id))
    .filter((r): r is ReviewRow => Boolean(r && r.restaurants));

  if (reviews.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("title")}</h2>
          <p className="mt-2 text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <Quote className="h-8 w-8 text-[var(--color-just-tag)]/20" />
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-900">{review.author_name}</p>
                <p className="text-xs text-gray-500">
                  Sur{" "}
                  <Link
                    href={`/${locale}/restaurants/${review.restaurants!.slug}`}
                    className="font-medium text-[var(--color-just-tag)] hover:underline"
                  >
                    {review.restaurants!.name_fr}
                  </Link>
                  {" — "}
                  {review.restaurants!.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
