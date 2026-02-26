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
  try {
    const supabase = await createClient();

    // First attempt: direct sign-in
    let { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If sign-in fails, check if merchant exists in DB and try to repair Auth account
    if (error) {
      console.log("[loginMerchant] Initial sign-in failed:", error.message);

      let admin;
      try {
        admin = createAdminClient();
      } catch (adminErr) {
        console.error("[loginMerchant] Cannot create admin client:", adminErr);
        return { success: false, error: "Email ou mot de passe incorrect" };
      }

      // Check if merchant exists in DB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: merchantExists } = await (admin.from("merchants") as any)
        .select("id, auth_user_id")
        .eq("email", email)
        .single();

      if (!merchantExists) {
        return { success: false, error: "Email ou mot de passe incorrect" };
      }

      // Merchant exists in DB but sign-in failed - attempt repair
      let repaired = false;

      // Try updating existing auth user's password
      if (merchantExists.auth_user_id) {
        const { error: updateError } = await admin.auth.admin.updateUserById(
          merchantExists.auth_user_id,
          { password }
        );
        repaired = !updateError;
        if (updateError) {
          console.log("[loginMerchant] Password update failed:", updateError.message);
        }
      }

      // If no auth user or update failed, create a new auth user
      if (!repaired) {
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (!createError && newUser?.user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin.from("merchants") as any)
            .update({ auth_user_id: newUser.user.id })
            .eq("id", merchantExists.id);
          repaired = true;
        } else {
          console.log("[loginMerchant] Auth user creation failed:", createError?.message);
        }
      }

      // Retry sign-in after repair
      if (repaired) {
        const retry = await supabase.auth.signInWithPassword({ email, password });
        error = retry.error;
      }

      if (error) {
        return { success: false, error: "Email ou mot de passe incorrect" };
      }
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
  } catch (e) {
    console.error("[loginMerchant] Unexpected error:", e);
    return { success: false, error: "Erreur serveur inattendue" };
  }
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

export async function resetMerchantPassword(email: string, locale: string = "fr") {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch"}/${locale}/espace-client/connexion`,
    });

    if (error) {
      return { success: false, error: "Erreur lors de l'envoi du lien" };
    }

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}
