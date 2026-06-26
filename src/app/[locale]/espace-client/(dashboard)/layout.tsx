import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getMerchantSession } from "@/actions/merchant/auth";
import { getMerchantSubscription } from "@/actions/merchant/subscription";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { MerchantSidebar } from "@/components/merchant/MerchantSidebar";
import { MerchantHeader } from "@/components/merchant/MerchantHeader";

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

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

  try {
    const session = await getMerchantSession();
    if (session) {
      email = session.merchant.email;
      restaurantName = session.restaurant?.name_fr || undefined;
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      redirect(`/${locale}/espace-client/connexion`);
    }
  } catch {
    // Supabase error — continue in demo mode
  }

  // Subscription gate — skip on the abonnement page itself to avoid redirect loop
  try {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    const isAbonnementPage = pathname.endsWith("/abonnement");

    if (!isAbonnementPage && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const sub = await getMerchantSubscription();
      const hasAccess =
        sub.success &&
        sub.data &&
        ACTIVE_STATUSES.includes(sub.data.subscription.status);

      if (!hasAccess) {
        redirect(`/${locale}/espace-client/abonnement`);
      }
    }
  } catch {
    // Subscription check error — allow access rather than locking out
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
