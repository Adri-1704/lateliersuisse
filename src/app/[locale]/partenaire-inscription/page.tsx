import { redirect } from "next/navigation";

export default async function MerchantSignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/pour-restaurateurs#b2b-pricing`);
}
