import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Outfit } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SwissTrustBanner } from "@/components/layout/SwissTrustBanner";
import { PublicLayoutWrapper } from "@/components/layout/PublicLayoutWrapper";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

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
      template: `%s | Just-Tag.app`,
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
      siteName: "Just-Tag.app",
      locale: locale === "fr" ? "fr_CH" : locale === "de" ? "de_CH" : locale === "pt" ? "pt_PT" : locale === "es" ? "es_ES" : "en",
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Just-Tag - Les meilleurs restaurants de Suisse Romande",
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
      icon: "/icon.svg",
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
    name: "Just-Tag.app",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "Just-Tag.app est l'annuaire de reference pour decouvrir les meilleurs restaurants de Suisse Romande. Trouvez des restaurants par ville, cuisine et avis.",
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
    name: "Just-Tag.app",
    url: baseUrl,
    description:
      "Annuaire des meilleurs restaurants de Suisse Romande — recherche par ville, type de cuisine et avis clients.",
    inLanguage: ["fr", "de", "en", "pt", "es"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/fr/restaurants?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} className={outfit.variable}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://odbkdijcmwqdxctukjmh.supabase.co" />
        <link rel="dns-prefetch" href="https://odbkdijcmwqdxctukjmh.supabase.co" />
        <script async defer src="https://www.googletagmanager.com/gtag/js?id=G-WMX94S9LR7" />
        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-WMX94S9LR7');`,
          }}
        />
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
          <PublicLayoutWrapper locale={locale}>
            {children}
          </PublicLayoutWrapper>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
        <PageViewTracker />
      </body>
    </html>
  );
}
