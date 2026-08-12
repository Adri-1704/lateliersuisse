import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts } from "@/actions/blog";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Blog — Just-Tag | Guides, tops et conseils restaurants en Suisse Romande",
    description:
      "Guides des meilleurs restaurants, tops par ville et par canton, conseils pour les restaurateurs. Le blog gastronomique de la Suisse Romande.",
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        fr: "/fr/blog",
        de: "/de/blog",
        en: "/en/blog",
        pt: "/pt/blog",
        es: "/es/blog",
      },
    },
    openGraph: {
      title: "Blog Just-Tag — Guides restaurants Suisse Romande",
      description:
        "Guides des meilleurs restaurants, tops par ville et par canton, conseils pour les restaurateurs.",
      url: `${baseUrl}/${locale}/blog`,
      type: "website",
    },
  };
}

const POSTS_PER_PAGE = 20;

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const requestedPage =
    typeof sp.page === "string" && sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  // On borne la page demandée à la dernière page réelle (au lieu de renvoyer
  // "0 article" sur une page hors limites, comme sur /restaurants — #40) :
  // on récupère d'abord le total, puis on ajuste la page avant de charger
  // les articles correspondants.
  const { total: totalCount } = await getPublishedPosts(1, 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
  const page = Math.min(requestedPage, totalPages);

  const { posts, total } = await getPublishedPosts(POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-[var(--color-just-tag)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Blog Just-Tag
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Guides, classements et conseils pour les gourmets et les restaurateurs de Suisse Romande.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-lg text-gray-500">
                Les premiers articles arrivent bientôt.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                En attendant, explorez nos{" "}
                <Link href={`/${locale}/restaurants`} className="text-[var(--color-just-tag)] underline">
                  restaurants
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${locale}/blog/${post.slug}`}
                    className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1"
                  >
                    {post.cover_image ? (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <span className="text-4xl font-bold text-white/20">Just-Tag</span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {post.category && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {post.category}
                          </Badge>
                        )}
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.published_at).toLocaleDateString("fr-CH")}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-gray-900 group-hover:text-[var(--color-just-tag)] line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[var(--color-just-tag)]">
                        Lire <ArrowRight className="h-4 w-4" />
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                            >
                              <Tag className="h-2.5 w-2.5" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {/* Pagination — indispensable dès que le catalogue dépasse
                  POSTS_PER_PAGE articles : sans elle, seuls les 20 plus
                  récents étaient jamais atteignables (#40). */}
              {totalPages > 1 && (
                <nav
                  aria-label={
                    locale === "de" ? "Seitennavigation" : locale === "en" ? "Pagination" : locale === "pt" ? "Paginação" : locale === "es" ? "Paginación" : "Pagination"
                  }
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  <Link
                    href={`/${locale}/blog${page > 2 ? `?page=${page - 1}` : ""}`}
                    aria-disabled={page === 1}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      page === 1
                        ? "pointer-events-none border-gray-200 text-gray-300"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {locale === "de" ? "Zurück" : locale === "en" ? "Previous" : locale === "pt" ? "Anterior" : locale === "es" ? "Anterior" : "Précédent"}
                  </Link>

                  <span className="px-2 text-sm text-gray-600">
                    {page} / {totalPages}
                  </span>

                  <Link
                    href={`/${locale}/blog?page=${page + 1}`}
                    aria-disabled={page === totalPages}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      page === totalPages
                        ? "pointer-events-none border-gray-200 text-gray-300"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {locale === "de" ? "Weiter" : locale === "en" ? "Next" : locale === "pt" ? "Seguinte" : locale === "es" ? "Siguiente" : "Suivant"}
                  </Link>
                </nav>
              )}

              <p className="mt-4 text-center text-sm text-gray-500">
                {total} articles au total.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
