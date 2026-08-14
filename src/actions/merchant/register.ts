"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { claimRequestAdminNotification, claimApprovedNotification, newSignupAdminNotification } from "@/lib/email-templates";
import { logConversionEvent } from "@/lib/analytics/conversion-events";
import { isPlausiblePhoneNumber } from "@/lib/phone";

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
  // Le numéro WhatsApp est optionnel, mais s'il est renseigné il doit être
  // plausible (#36) : la validation client peut être contournée.
  if (phone && !isPlausiblePhoneNumber(phone)) {
    return { success: false, error: "Numéro de téléphone invalide" };
  }

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

  // Log signup_completed event (non-blocking)
  void logConversionEvent({
    eventType: "signup_completed",
    merchantId,
    metadata: { has_restaurant_claim: !!restaurantSlug },
  });

  // 4. If restaurant selected, create a claim request (manual validation by admin)
  //
  // Délègue à `createClaimRequestCore` (le même cœur durci que
  // `claimExistingRestaurant`) pour bénéficier du verrou atomique anti-course,
  // du nettoyage des demandes rejetées et du relâchement du verrou en cas
  // d'échec — au lieu de dupliquer cette logique ici sans ces garanties.
  // `forceManualReview: true` conserve le comportement historique de ce
  // parcours (toujours `pending`/`manual`, jamais d'auto-approbation par
  // correspondance d'email).
  if (restaurantSlug) {
    const claimResult = await createClaimRequestCore({
      merchantId,
      merchantName: name,
      merchantEmail: email,
      merchantPhone: phone || "",
      restaurantSlug,
      forceManualReview: true,
    });

    if (!claimResult.success) {
      // Le compte marchand a bel et bien été créé (étape 3 ci-dessus) : on
      // ne le supprime pas. En revanche, on ne renvoie JAMAIS
      // `success: true` / `claim_status: 'pending'` si aucun claim n'existe
      // réellement (cf. F1) — on propage l'échec du claim de façon honnête,
      // cohérente avec la gestion d'erreurs du reste de la fonction.
      console.error("Claim request creation failed during registerMerchant:", claimResult.error);
      return {
        success: false,
        error: claimResult.error || "Le compte a été créé, mais la revendication de la fiche a échoué. Vous pouvez la revendiquer depuis votre espace client.",
      };
    }

    return {
      success: true,
      error: null,
      claim_request_id: claimResult.claimId,
      claim_status: "pending",
    };
  }

  // No restaurant selected — merchant created without claim
  // Notifier l'admin de la nouvelle inscription
  try {
    const adminEmailAddress = process.env.ADMIN_EMAIL || "contact@just-tag.app";
    const template = newSignupAdminNotification({
      merchantName: name,
      merchantEmail: email,
      merchantPhone: phone || "Non renseigné",
    });
    await sendEmail({
      to: adminEmailAddress,
      subject: template.subject,
      html: template.html,
      replyTo: email,
    });
  } catch (emailErr) {
    console.error("Failed to send signup admin notification:", emailErr);
  }

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
 * Cœur partagé de création d'une demande de revendication (claim_request).
 *
 * ⚠️ `merchantId` DOIT avoir été validé par l'appelant (dérivé de la session
 * authentifiée) — cette fonction ne fait AUCUNE vérification d'identité.
 *
 * `forceManualReview: true` désactive complètement l'auto-approbation par
 * correspondance d'email (`method='email_domain'`) : le claim est TOUJOURS
 * créé en `pending` / `method='manual'`, quelle que soit la correspondance
 * d'email. Utilisé par le parcours "revendiquer une fiche existante" depuis
 * l'espace-client, où la validation admin manuelle est obligatoire.
 */
export async function createClaimRequestCore(params: {
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  merchantPhone: string;
  restaurantSlug: string;
  forceManualReview?: boolean;
  /**
   * Restaurant déjà chargé par l'appelant (évite une relecture en base —
   * ex: `claimExistingRestaurant` a déjà lu la fiche pour ses propres
   * vérifications). Doit correspondre à `restaurantSlug`. Si absent, la
   * fonction charge elle-même le restaurant.
   */
  preloadedRestaurant?: {
    id: string;
    name_fr: string;
    email: string | null;
    merchant_id: string | null;
  };
}): Promise<{ success: boolean; error: string | null; claimId?: string; status?: "pending" | "approved" }> {
  const { merchantId, merchantName, merchantEmail, merchantPhone, restaurantSlug, forceManualReview = false, preloadedRestaurant } = params;

  const supabase = createAdminClient();

  // Get restaurant (sauf si déjà chargé par l'appelant)
  let restaurant = preloadedRestaurant ?? null;
  if (!restaurant) {
    const { data } = await supabase
      .from("restaurants")
      .select("id, name_fr, email, merchant_id")
      .eq("slug", restaurantSlug)
      .single() as { data: { id: string; name_fr: string; email: string | null; merchant_id: string | null } | null; error: unknown };
    restaurant = data;
  }

  if (!restaurant) {
    return { success: false, error: "Restaurant introuvable" };
  }

  if (restaurant.merchant_id) {
    return { success: false, error: "Ce restaurant est déjà revendiqué par un autre compte" };
  }

  // Auto-approve si l'email du merchant correspond à l'email du restaurant en base
  // (preuve de propriété : seul le vrai proprio a accès à cet email)
  // — sauf si `forceManualReview` est demandé : dans ce cas la validation
  // admin manuelle est systématique, sans aucune exception.
  const emailMatch = !forceManualReview
    && restaurant.email
    && merchantEmail
    && restaurant.email.toLowerCase().trim() === merchantEmail.toLowerCase().trim();

  const claimStatus: "pending" | "approved" = emailMatch ? "approved" : "pending";
  const claimMethod = emailMatch ? "email_domain" : "manual";

  // ── Verrou atomique anti-vol de fiche (race condition) ────────────────
  // On ne réserve la fiche QUE si elle est encore libre (claim_status
  // 'unclaimed' ET merchant_id NULL). L'UPDATE conditionnel est atomique
  // au niveau PostgreSQL : si deux marchands tentent de revendiquer la
  // même fiche en même temps, un seul verra `lockedRows.length > 0`.
  // Le claim n'est créé QUE si ce verrou a réussi.
  const normalizedPhone = merchantPhone ? merchantPhone.replace(/[^0-9+]/g, "") : null;
  const lockUpdate: Record<string, unknown> = emailMatch
    ? {
        merchant_id: merchantId,
        claim_status: "claimed",
        claimed_at: new Date().toISOString(),
        whatsapp_phone: normalizedPhone,
      }
    : { claim_status: "pending" };

  const { data: lockedRows, error: lockError } = await (supabase
    .from("restaurants") as ReturnType<typeof supabase.from>)
    .update(lockUpdate)
    .eq("id", restaurant.id)
    .eq("claim_status", "unclaimed")
    .is("merchant_id", null)
    .select("id");

  if (lockError) {
    console.error("Failed to lock restaurant for claim:", lockError);
    return { success: false, error: "Erreur lors de la revendication" };
  }

  if (!lockedRows || lockedRows.length === 0) {
    // Une autre demande a gagné la course entre-temps.
    return { success: false, error: "Cette fiche est déjà en cours de revendication" };
  }

  // ── F3 : verrou → (delete) → insert sous try/catch ─────────────────────
  // À partir d'ici, la fiche est verrouillée (lockedRows.length > 0). Toute
  // exception non gérée dans cette séquence doit relâcher le verrou pour ne
  // pas laisser la fiche bloquée sans aucune demande associée.
  let claimId: string | undefined;
  try {
    // Nettoyage retry : si une précédente demande de ce marchand pour ce
    // restaurant a été rejetée, on la supprime — sinon la contrainte
    // UNIQUE(restaurant_id, merchant_id) bloquerait définitivement tout
    // nouvel essai de ce marchand sur cette fiche.
    const { error: deleteRejectedError } = await (supabase
      .from("claim_requests") as ReturnType<typeof supabase.from>)
      .delete()
      .eq("restaurant_id", restaurant.id)
      .eq("merchant_id", merchantId)
      .eq("status", "rejected");

    // F2 : si ce nettoyage échoue, on le mémorise pour ne pas afficher un
    // message trompeur en cas de 23505 juste après (le duplicate pourrait
    // alors venir de la ligne "rejected" non supprimée, pas d'une demande
    // réellement en cours).
    const rejectedCleanupFailed = !!deleteRejectedError;
    if (deleteRejectedError) {
      console.error("Failed to clean up previous rejected claim:", deleteRejectedError);
      // Non bloquant : on tente quand même l'insert ci-dessous.
    }

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

      // Code Postgres 23505 = violation de contrainte unique (duplicate key)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isDuplicateKey = (claimError as any)?.code === "23505";
      if (isDuplicateKey && rejectedCleanupFailed) {
        // F2 : le nettoyage des demandes rejetées a échoué juste avant — on
        // ne peut pas affirmer qu'une demande est "déjà en cours" (il peut
        // s'agir d'un reliquat rejeté non supprimé). Message honnête plutôt
        // que trompeur.
        throw Object.assign(new Error("rejected_cleanup_failed"), {
          userMessage: "Une erreur technique empêche de traiter votre demande pour cette fiche. Veuillez réessayer dans quelques instants.",
        });
      }
      if (isDuplicateKey) {
        throw Object.assign(new Error("duplicate_claim"), {
          userMessage: "Une demande est déjà en cours pour cette fiche",
        });
      }
      throw Object.assign(new Error("claim_insert_failed"), {
        userMessage: "Erreur lors de la revendication",
      });
    }

    claimId = claimRequest ? (claimRequest as Record<string, unknown>).id as string : undefined;
  } catch (err) {
    // Le verrou ci-dessus vient de modifier la fiche (claim_status et,
    // pour l'auto-approbation, merchant_id) : que l'échec vienne d'une
    // erreur gérée (claimError) ou d'une exception inattendue, on relâche
    // le verrou pour ne pas laisser une fiche bloquée sans aucune demande
    // associée (on sait que merchant_id était NULL avant le verrou, cf.
    // vérification `restaurant.merchant_id` ci-dessus — la fiche n'a été
    // verrouillée QUE par cet appel).
    await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
      .update({
        claim_status: "unclaimed",
        merchant_id: null,
        claimed_at: null,
      } as Record<string, unknown>)
      .eq("id", restaurant.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMessage = (err as any)?.userMessage as string | undefined;
    return { success: false, error: userMessage || "Erreur lors de la revendication" };
  }

  if (emailMatch) {
    // Auto-approve : le restaurant est déjà lié au merchant (verrou ci-dessus).
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
    // Claim en attente : le restaurant est déjà en claim_status='pending'
    // (verrou ci-dessus). Validation manuelle par l'admin.
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

  return { success: true, error: null, claimId, status: claimStatus as "pending" | "approved" };
}

/**
 * Create a claim request for an existing merchant (already created via registerMerchant).
 * This is the separated claim step in the multi-step flow.
 *
 * ⚠️ Historique : cette fonction reste utilisable telle quelle (elle applique
 * l'auto-approbation `email_domain` quand l'email correspond). Elle N'EST PAS
 * utilisée par le parcours "revendiquer une fiche depuis l'espace-client"
 * (voir `claimExistingRestaurant` dans `merchant/restaurant.ts`), qui exige
 * une validation admin manuelle systématique via `createClaimRequestCore(...,
 * { forceManualReview: true })`.
 */
export async function createClaimRequest(params: {
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  merchantPhone: string;
  restaurantSlug: string;
}): Promise<{ success: boolean; error: string | null }> {
  const { success, error } = await createClaimRequestCore(params);
  return { success, error };
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

  // Get merchant phone for WhatsApp
  const { data: merchantData } = await supabase
    .from("merchants")
    .select("phone")
    .eq("id", merchantId)
    .single() as { data: { phone: string | null } | null; error: unknown };
  const whatsappPhone = merchantData?.phone ? merchantData.phone.replace(/[^0-9+]/g, "") : null;

  const { data: restaurant, error } = await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
    .insert({
      merchant_id: merchantId,
      name_fr: name,
      name_de: name,
      name_en: name,
      slug: `${slug}-${Date.now().toString(36)}`,
      cuisine_type: cuisine || null,
      canton: "",
      city,
      is_published: false,
      claim_status: "claimed",
      whatsapp_phone: whatsappPhone,
    } as Record<string, unknown>)
    .select("id")
    .single();

  if (error) {
    console.error("Create restaurant error:", error);
    return { success: false, error: "Erreur lors de la création du restaurant" };
  }

  const restaurantId = restaurant ? (restaurant as Record<string, unknown>).id as string : undefined;
  return { success: true, error: null, restaurantId };
}
