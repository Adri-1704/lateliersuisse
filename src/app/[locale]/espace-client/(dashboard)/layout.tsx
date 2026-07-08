import { redirect } from "next/navigation";
import { getMerchantSession } from "@/actions/merchant/auth";
import { MerchantLayoutClient } from "@/components/merchant/MerchantLayoutClient";

export default async function MerchantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let email = "marchand@just-tag.app";
  let restaurantName: string | undefined;
  let isAuthenticated = false;

  try {
    const session = await getMerchantSession();
    if (session) {
      email = session.merchant.email;
      restaurantName = session.restaurant?.name_fr || undefined;
      isAuthenticated = true;
    }
  } catch {
    // Supabase error — continue in demo mode
  }

  if (!isAuthenticated && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    redirect(`/${locale}/espace-client/connexion`);
  }

  return (
    <MerchantLayoutClient email={email} restaurantName={restaurantName}>
      {children}
    </MerchantLayoutClient>
  );
}
