"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Merchant, Subscription, DbRestaurant } from "@/lib/supabase/types";

export interface MerchantSession {
  merchant: Merchant;
  subscription: Subscription | null;
  restaurant: DbRestaurant | null;
  pendingClaim: { id: string; restaurant_id: string; created_at: string } | null;
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

    // If no restaurant linked, check for a pending claim request
    let pendingClaim: { id: string; restaurant_id: string; created_at: string } | null = null;
    if (!restaurant) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: claim } = await (admin.from("claim_requests") as any)
        .select("id, restaurant_id, created_at")
        .eq("merchant_id", merchant.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (claim) {
        pendingClaim = claim as { id: string; restaurant_id: string; created_at: string };
      }
    }

    return {
      merchant: merchant as Merchant,
      subscription: (subscription as Subscription) || null,
      restaurant: (restaurant as DbRestaurant) || null,
      pendingClaim,
    };
  } catch {
    return null;
  }
}

export async function resetMerchantPassword(email: string) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";
    const redirectTo = `${siteUrl}/fr/espace-client/reset-mot-de-passe`;

    // Always return success to the client to avoid email enumeration —
    // any actual error is logged server-side.
    const admin = createAdminClient();

    // 1. Verify the email belongs to a registered merchant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: merchant } = await (admin.from("merchants") as any)
      .select("id, email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (!merchant) {
      // Don't reveal that the email isn't registered
      return { success: true, error: null };
    }

    // 2. Generate a recovery link via Supabase admin API (bypasses SMTP)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: linkData, error: linkErr } = await (admin.auth.admin as any).generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (linkErr || !linkData?.properties?.action_link) {
      console.error("[resetMerchantPassword] generateLink failed:", linkErr);
      return { success: false, error: "Erreur lors de l'envoi du lien" };
    }

    const actionLink = linkData.properties.action_link as string;

    // 3. Send our own email via Resend (independent of Supabase SMTP)
    const { sendEmail } = await import("@/lib/email");
    const result = await sendEmail({
      to: email,
      subject: "Réinitialiser votre mot de passe Just-Tag",
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #111;">Réinitialisation de votre mot de passe</h2>
          <p style="color: #444; font-size: 14px; line-height: 1.6;">
            Bonjour,<br><br>
            Vous avez demandé la réinitialisation de votre mot de passe Just-Tag.
            Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
          </p>
          <p style="margin: 28px 0; text-align: center;">
            <a href="${actionLink}" style="display: inline-block; background: #e63946; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color: #777; font-size: 12px;">
            Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande,
            ignorez simplement ce message — votre mot de passe ne sera pas modifié.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 11px;">
            Just-Tag — L'annuaire des restaurants romands.
          </p>
        </div>
      `,
    });

    if (!result.success) {
      console.error("[resetMerchantPassword] Resend failed:", result.error);
      return { success: false, error: "Erreur lors de l'envoi du lien" };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("[resetMerchantPassword] Unexpected:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}

/**
 * Change the password for the currently logged-in merchant.
 */
export async function changeMerchantPassword(newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Le mot de passe doit contenir au moins 8 caractères." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Vous devez être connecté pour changer votre mot de passe." };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error("[changeMerchantPassword] updateUser failed:", error);
      return { success: false, error: "Impossible de changer le mot de passe." };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("[changeMerchantPassword] Unexpected:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}
