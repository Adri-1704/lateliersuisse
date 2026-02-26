import { redirect } from "next/navigation";
import { getMerchantSession } from "@/actions/merchant/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
  let email = "marchand@just-tag.ch";
  let restaurantName: string | undefined;

  try {
    const session = await getMerchantSession();
    if (session) {
      email = session.merchant.email;
      restaurantName = session.restaurant?.name_fr || undefined;
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      redirect(`/${locale}/espace-client/connexion`);
    }
  } catch (e) {
    // Re-throw redirect errors (Next.js uses exceptions for redirects)
    if (e && typeof e === "object" && "digest" in e) {
      throw e;
    }
    // Supabase error — continue in demo mode
  }

  return (
    <SidebarProvider>
      <MerchantSidebar />
      <SidebarInset>
        <MerchantHeader email={email} restaurantName={restaurantName} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
