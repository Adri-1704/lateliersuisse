"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Merchant, Subscription, DbRestaurant } from "@/lib/supabase/types";

export interface MerchantSession {
  merchant: Merchant;
  subscription: Subscription | null;
  restaurant: DbRestaurant | null;
}

/**
 * Find merchant by auth_user_id first, then fallback to email.
 * This allows the portal to work even before the auth_user_id migration is run.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findMerchantByUser(supabase: any, userId: string, email: string) {
  // Try auth_user_id first
  try {
    const { data } = await supabase
      .from("merchants")
      .select("*")
      .eq("auth_user_id", userId)
      .single();
    if (data) return data;
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
    return data || null;
  } catch {
    return null;
  }
}

export async function loginMerchant(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: "Email ou mot de passe incorrect" };
  }

  // Verify the user is a merchant
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Erreur d'authentification" };
  }

  // Check merchant record exists (auth_user_id or email fallback)
  const merchant = await findMerchantByUser(supabase, user.id, user.email || email);

  if (!merchant) {
    await supabase.auth.signOut();
    return { success: false, error: "Ce compte n'est pas un compte marchand" };
  }

  return { success: true, error: null };
}

export async function logoutMerchant(locale: string = "fr") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/espace-client/connexion`);
}

export async function getMerchantSession(): Promise<MerchantSession | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Get merchant data (auth_user_id or email fallback)
    const merchant = await findMerchantByUser(supabase, user.id, user.email || "");

    if (!merchant) return null;

    // Get subscription (use admin client to bypass RLS if auth_user_id not set)
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (admin.from("subscriptions") as any)
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get restaurant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: restaurant } = await (admin.from("restaurants") as any)
      .select("*")
      .eq("merchant_id", merchant.id)
      .limit(1)
      .single();

    return {
      merchant: merchant as Merchant,
      subscription: (subscription as Subscription) || null,
      restaurant: (restaurant as DbRestaurant) || null,
    };
  } catch {
    return null;
  }
}

export async function resetMerchantPassword(email: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch"}/fr/espace-client/connexion`,
    });

    if (error) {
      return { success: false, error: "Erreur lors de l'envoi du lien" };
    }

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}
