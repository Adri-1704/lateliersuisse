"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SwissTrustBanner } from "./SwissTrustBanner";

export function PublicLayoutWrapper({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const isMerchantDashboard =
    pathname.includes("/espace-client") &&
    !pathname.endsWith("/connexion") &&
    !pathname.endsWith("/mot-de-passe-oublie");

  if (isMerchantDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Lien d'évitement (WCAG 2.4.1) : premier élément focusable de la
          page, permet de sauter les ~14 éléments interactifs du header
          (logo, nav, sélecteur de langue, recherche, connexion...) pour
          atteindre directement le contenu principal (#42). */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--color-just-tag)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        {locale === "de"
          ? "Zum Inhalt springen"
          : locale === "en"
            ? "Skip to content"
            : locale === "pt"
              ? "Ir para o conteúdo"
              : locale === "es"
                ? "Ir al contenido"
                : "Aller au contenu"}
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <SwissTrustBanner />
      <Footer locale={locale} />
    </>
  );
}
