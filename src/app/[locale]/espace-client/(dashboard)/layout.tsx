import { redirect } from "next/navigation";
import { getMerchantSession } from "@/actions/merchant/auth";
import { MerchantSidebar } from "@/components/merchant/MerchantSidebar";
import { MerchantHeader } from "@/components/merchant/MerchantHeader";

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
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]">
      <MerchantSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MerchantHeader email={email} restaurantName={restaurantName} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
