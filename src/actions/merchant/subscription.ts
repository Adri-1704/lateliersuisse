"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import type { Subscription, Merchant } from "@/lib/supabase/types";

/**
 * Find merchant by auth_user_id first, then fallback to email.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findMerchant(supabase: any, userId: string, email: string): Promise<Merchant | null> {
  // Try auth_user_id first
  try {
    const { data } = await supabase
      .from("merchants")
      .select("*")
      .eq("auth_user_id", userId)
      .single();
    if (data) return data as Merchant;
  } catch {
    // Column may not exist yet — fallback to email
  }

  // Fallback: match by email (use admin client to bypass RLS)
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin.from("merchants") as any)
      .select("*")
      .eq("email", email)
      .single();
    return (data as Merchant) || null;
  } catch {
    return null;
  }
}

export async function getMerchantSubscription(): Promise<{
  success: boolean;
  error: string | null;
  data?: { subscription: Subscription; merchant: Merchant };
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    const merchant = await findMerchant(supabase, user.id, user.email || "");
    if (!merchant) return { success: false, error: "Marchand non trouvé" };

    // Use admin client to bypass RLS
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (admin.from("subscriptions") as any)
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) return { success: false, error: "Aucun abonnement trouvé" };

    return {
      success: true,
      error: null,
      data: { subscription: subscription as Subscription, merchant },
    };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function createBillingPortalSession(locale: string = "fr"): Promise<{
  url: string | null;
  error: string | null;
}> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { url: null, error: "Stripe non configuré" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { url: null, error: "Non authentifié" };

    const merchant = await findMerchant(supabase, user.id, user.email || "");
    if (!merchant?.stripe_customer_id) {
      return { url: null, error: "Client Stripe non trouvé" };
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: merchant.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch"}/${locale}/espace-client/abonnement`,
    });

    return { url: session.url, error: null };
  } catch {
    return { url: null, error: "Erreur lors de la création de la session" };
  }
}
