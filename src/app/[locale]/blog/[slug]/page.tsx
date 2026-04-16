import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug } from "@/actions/blog";
import { Calendar, ArrowLeft, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || "";

  return {
    title: `${title} — Blog Just-Tag`,
    description,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        fr: `/fr/blog/${slug}`,
        de: `/de/blog/${slug}`,
        en: `/en/blog/${slug}`,
        pt: `/pt/blog/${slug}`,
        es: `/es/blog/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/blog/${slug}`,
      type: "article",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      authors: [post.author],
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
  };
}

// Simple markdown to HTML (headings, bold, italic, links, lists, paragraphs)
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="mt-8 mb-3 text-xl font-bold text-gray-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-10 mb-4 text-2xl font-bold text-gray-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="mt-10 mb-4 text-3xl font-bold text-gray-900">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[var(--color-just-tag)] underline hover:no-underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-700">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-gray-700">$2</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="my-4 space-y-1">${match}</ul>`)
    .replace(/^(?!<[hulo])((?!<).+)$/gm, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>')
    .replace(/<p class="mb-4 text-gray-700 leading-relaxed"><\/p>/g, "");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const htmlContent = markdownToHtml(post.content);

  // JSON-LD Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    author: { "@type": "Person", name: post.author },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    publisher: {
      "@type": "Organization",
      name: "Just-Tag",
      url: baseUrl,
    },
    mainEntityOfPage: `${baseUrl}/${locale}/blog/${slug}`,
    image: post.cover_image || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <Link href={`/${locale}`} className="hover:text-gray-900">Just-Tag</Link>
          <span className="mx-2">›</span>
          <Link href={`/${locale}/blog`} className="hover:text-gray-900">Blog</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{post.title}</span>
        </nav>

        {/* Back link */}
        <Link
          href={`/${locale}/blog`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Tous les articles
        </Link>

        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <Badge variant="secondary" className="mb-3 capitalize">{post.category}</Badge>
          )}
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">{post.excerpt}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> {post.author}
            </span>
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString("fr-CH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  <Tag className="h-3 w-3" /> {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Cover image */}
        {post.cover_image && (
          <div className="relative mb-10 h-64 overflow-hidden rounded-2xl sm:h-96">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose-just-tag"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-[var(--color-just-tag)] p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Trouvez votre prochain restaurant</h2>
          <p className="mt-2 text-white/80">
            Explorez plus de 11 000 restaurants en Suisse Romande.
          </p>
          <Link
            href={`/${locale}/restaurants`}
            className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-[var(--color-just-tag)] transition hover:bg-gray-100"
          >
            Explorer les restaurants
          </Link>
        </div>
      </article>
    </>
  );
}
