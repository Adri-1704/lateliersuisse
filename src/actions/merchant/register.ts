"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { claimRequestAdminNotification, claimApprovedNotification } from "@/lib/email-templates";

interface RegisterParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  restaurantSlug: string | null;
}

interface RegisterResult {
  success: boolean;
  error: string | null;
  claim_request_id?: string;
  claim_status?: "pending";
}

export async function registerMerchant(params: RegisterParams): Promise<RegisterResult> {
  const { name, email, password, phone, restaurantSlug } = params;

  // Validation
  if (!name || name.length < 2) return { success: false, error: "Nom requis (2 caractères minimum)" };
  if (!email || !email.includes("@")) return { success: false, error: "Email invalide" };
  if (!password || password.length < 6) return { success: false, error: "Mot de passe requis (6 caractères minimum)" };

  const supabase = createAdminClient();

  // 1. Check if merchant email already exists
  const { data: existingMerchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("email", email)
    .single() as { data: { id: string } | null; error: unknown };

  if (existingMerchant) {
    return { success: false, error: "Un compte existe déjà avec cet email" };
  }

  // 2. Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message?.includes("already been registered")) {
      return { success: false, error: "Un compte existe déjà avec cet email" };
    }
    return { success: false, error: "Erreur lors de la création du compte" };
  }

  const authUserId = authData.user?.id;
  if (!authUserId) {
    return { success: false, error: "Erreur lors de la création du compte" };
  }

  // 3. Create merchant record
  const { data: merchant, error: merchantError } = await (supabase
    .from("merchants") as ReturnType<typeof supabase.from>)
    .insert({
      email,
      name,
      phone: phone || null,
      auth_user_id: authUserId,
    } as Record<string, unknown>)
    .select("id")
    .single();

  if (merchantError || !merchant) {
    return { success: false, error: "Erreur lors de la création du profil" };
  }

  const merchantId = (merchant as Record<string, unknown>).id as string;

  // 4. If restaurant selected, create a claim request (manual validation by admin)
  if (restaurantSlug) {
    // Get restaurant
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id, name_fr, city, email, merchant_id")
      .eq("slug", restaurantSlug)
      .single() as { data: { id: string; name_fr: string; city: string; email: string | null; merchant_id: string | null } | null; error: unknown };

    if (restaurant && !restaurant.merchant_id) {
      // Create claim request (pending manual approval)
      const { data: claimRequest, error: claimError } = await (supabase
        .from("claim_requests") as ReturnType<typeof supabase.from>)
        .insert({
          restaurant_id: restaurant.id,
          merchant_id: merchantId,
          method: "manual",
          status: "pending",
        } as Record<string, unknown>)
        .select("id")
        .single();

      if (claimError) {
        console.error("Claim request insert error:", claimError);
        // Non-blocking: merchant is created, claim just failed
      }

      // Update restaurant claim_status to 'pending' to block concurrent claims
      await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
        .update({ claim_status: "pending" } as Record<string, unknown>)
        .eq("id", restaurant.id);

      // Send admin notification email
      const claimId = claimRequest ? (claimRequest as Record<string, unknown>).id as string : undefined;
      try {
        const adminEmailAddress = process.env.ADMIN_EMAIL || "contact@just-tag.app";
        const template = claimRequestAdminNotification({
          restaurantName: restaurant.name_fr,
          merchantName: name,
          merchantEmail: email,
          merchantPhone: phone || "Non renseigné",
          claimId: claimId || "unknown",
        });
        await sendEmail({
          to: adminEmailAddress,
          subject: template.subject,
          html: template.html,
          replyTo: email,
        });
      } catch (emailErr) {
        console.error("Failed to send claim admin notification:", emailErr);
      }

      return {
        success: true,
        error: null,
        claim_request_id: claimId,
        claim_status: "pending",
      };
    }
  }

  // No restaurant selected — merchant created without claim
  return { success: true, error: null };
}

/**
 * Search restaurants available for claiming (no merchant_id set and not already pending)
 */
export async function searchAvailableRestaurants(query: string): Promise<{ slug: string; name: string; city: string }[]> {
  if (!query || query.length < 2) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("slug, name_fr, city")
    .is("merchant_id", null)
    .neq("claim_status", "pending")
    .eq("is_published", true)
    .ilike("name_fr", `%${query}%`)
    .limit(10) as { data: { slug: string; name_fr: string; city: string }[] | null; error: unknown };

  if (error || !data) return [];
  return data.map((r) => ({ slug: r.slug, name: r.name_fr, city: r.city }));
}

// ────────────────────────────────────────────────────────────────────────────
// PR 2: Additional actions for multi-step signup flow
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get a merchant's ID by their email. Used by the signup flow to retrieve
 * the merchant ID after account creation (registerMerchant doesn't return it).
 */
export async function getMerchantIdByEmail(email: string): Promise<string | null> {
  if (!email) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("merchants")
    .select("id")
    .eq("email", email)
    .single() as { data: { id: string } | null; error: unknown };

  return data?.id || null;
}

/**
 * Create a claim request for an existing merchant (already created via registerMerchant).
 * This is the separated claim step in the multi-step flow.
 */
export async function createClaimRequest(params: {
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  merchantPhone: string;
  restaurantSlug: string;
}): Promise<{ success: boolean; error: string | null }> {
  const { merchantId, merchantName, merchantEmail, merchantPhone, restaurantSlug } = params;

  const supabase = createAdminClient();

  // Get restaurant
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name_fr, city, email, merchant_id")
    .eq("slug", restaurantSlug)
    .single() as { data: { id: string; name_fr: string; city: string; email: string | null; merchant_id: string | null } | null; error: unknown };

  if (!restaurant) {
    return { success: false, error: "Restaurant introuvable" };
  }

  if (restaurant.merchant_id) {
    return { success: false, error: "Ce restaurant est deja revendique par un autre compte" };
  }

  // Auto-approve si l'email du merchant correspond à l'email du restaurant en base
  // (preuve de propriété : seul le vrai proprio a accès à cet email)
  const emailMatch = restaurant.email
    && merchantEmail
    && restaurant.email.toLowerCase().trim() === merchantEmail.toLowerCase().trim();

  const claimStatus = emailMatch ? "approved" : "pending";
  const claimMethod = emailMatch ? "email_domain" : "manual";

  // Create claim request
  const { data: claimRequest, error: claimError } = await (supabase
    .from("claim_requests") as ReturnType<typeof supabase.from>)
    .insert({
      restaurant_id: restaurant.id,
      merchant_id: merchantId,
      method: claimMethod,
      status: claimStatus,
      resolved_at: emailMatch ? new Date().toISOString() : null,
      admin_notes: emailMatch ? "Auto-approuvé : email du merchant correspond à l'email du restaurant en base" : null,
    } as Record<string, unknown>)
    .select("id")
    .single();

  if (claimError) {
    console.error("Claim request insert error:", claimError);
    return { success: false, error: "Erreur lors de la revendication" };
  }

  const claimId = claimRequest ? (claimRequest as Record<string, unknown>).id as string : undefined;

  if (emailMatch) {
    // Auto-approve : lier le restaurant au merchant immédiatement
    await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
      .update({
        merchant_id: merchantId,
        claim_status: "claimed",
        claimed_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq("id", restaurant.id);

    // Notifier le merchant que sa fiche est validée
    try {
      const template = claimApprovedNotification({
        restaurantName: restaurant.name_fr,
        merchantName,
      });
      await sendEmail({
        to: merchantEmail,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailErr) {
      console.error("Failed to send auto-approval email:", emailErr);
    }

    // Notifier aussi l'admin (pour info)
    try {
      const adminEmailAddress = process.env.ADMIN_EMAIL || "contact@just-tag.app";
      const template = claimRequestAdminNotification({
        restaurantName: restaurant.name_fr,
        merchantName,
        merchantEmail,
        merchantPhone: merchantPhone || "Non renseigné",
        claimId: claimId || "unknown",
      });
      await sendEmail({
        to: adminEmailAddress,
        subject: `[AUTO-APPROUVÉ] ${template.subject}`,
        html: template.html,
        replyTo: merchantEmail,
      });
    } catch (emailErr) {
      console.error("Failed to send admin notification:", emailErr);
    }
  } else {
    // Claim en attente : validation manuelle par l'admin
    await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
      .update({ claim_status: "pending" } as Record<string, unknown>)
      .eq("id", restaurant.id);

    // Notifier l'admin pour validation
    try {
      const adminEmailAddress = process.env.ADMIN_EMAIL || "contact@just-tag.app";
      const template = claimRequestAdminNotification({
        restaurantName: restaurant.name_fr,
        merchantName,
        merchantEmail,
        merchantPhone: merchantPhone || "Non renseigné",
        claimId: claimId || "unknown",
      });
      await sendEmail({
        to: adminEmailAddress,
        subject: template.subject,
        html: template.html,
        replyTo: merchantEmail,
      });
    } catch (emailErr) {
      console.error("Failed to send claim admin notification:", emailErr);
    }
  }

  return { success: true, error: null };
}

/**
 * Create a new restaurant record linked to a merchant (is_published = false).
 * Used when the merchant's restaurant is not found in the search.
 */
export async function createRestaurantForMerchant(params: {
  merchantId: string;
  name: string;
  city: string;
  cuisine: string;
}): Promise<{ success: boolean; error: string | null; restaurantId?: string }> {
  const { merchantId, name, city, cuisine } = params;

  if (!name || !city) {
    return { success: false, error: "Nom et ville requis" };
  }

  const supabase = createAdminClient();

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: restaurant, error } = await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
    .insert({
      merchant_id: merchantId,
      name_fr: name,
      name_de: name,
      name_en: name,
      slug: `${slug}-${Date.now().toString(36)}`, // Append timestamp hash to avoid slug conflicts
      cuisine_type: cuisine || null,
      canton: "", // Will be filled in later by the merchant
      city,
      is_published: false,
      claim_status: "claimed",
    } as Record<string, unknown>)
    .select("id")
    .single();

  if (error) {
    console.error("Create restaurant error:", error);
    return { success: false, error: "Erreur lors de la creation du restaurant" };
  }

  const restaurantId = restaurant ? (restaurant as Record<string, unknown>).id as string : undefined;
  return { success: true, error: null, restaurantId };
}
