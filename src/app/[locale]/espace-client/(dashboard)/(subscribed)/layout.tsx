import { redirect } from "next/navigation";
import { getMerchantSubscription } from "@/actions/merchant/subscription";

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

export default async function SubscribedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    let hasAccess = false;
    try {
      const sub = await getMerchantSubscription();
      hasAccess =
        sub.success &&
        !!sub.data &&
        ACTIVE_STATUSES.includes(sub.data.subscription.status);
    } catch {
      hasAccess = false;
    }

    if (!hasAccess) {
      redirect(`/${locale}/espace-client/abonnement`);
    }
  }

  return <>{children}</>;
}
