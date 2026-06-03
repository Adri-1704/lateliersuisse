import { redirect } from "next/navigation";

export default async function WhatsAppRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/fr/restaurants/${slug}#whatsapp`);
}
