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
      <Header />
      <main>{children}</main>
      <SwissTrustBanner />
      <Footer locale={locale} />
    </>
  );
}
