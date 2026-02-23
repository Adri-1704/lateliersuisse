import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Outfit } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SwissTrustBanner } from "@/components/layout/SwissTrustBanner";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const title = t("title");
  const description = t("description");

  return {
    title: {
      default: title,
      template: `%s | Just-Tag.ch`,
    },
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fr: "/fr",
        de: "/de",
        en: "/en",
        pt: "/pt",
        es: "/es",
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: "Just-Tag.ch",
      locale: locale === "fr" ? "fr_CH" : locale === "de" ? "de_CH" : locale === "pt" ? "pt_PT" : locale === "es" ? "es_ES" : "en",
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Just-Tag - Les meilleurs restaurants de Suisse",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Structured data - Organization
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Just-Tag",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "Plateforme de decouverte des meilleurs restaurants en Suisse",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CH",
    },
    sameAs: [],
  };

  // Structured data - WebSite with search
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Just-Tag",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/${locale}/restaurants?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} className={outfit.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider>
          <Header />
          <main>{children}</main>
          <SwissTrustBanner />
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
