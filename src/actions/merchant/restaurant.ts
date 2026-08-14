"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { DbRestaurant, CuisineType } from "@/lib/supabase/types";
import { createClaimRequestCore, searchAvailableRestaurants as searchAvailableRestaurantsImpl } from "./register";
import { getMerchantSession } from "./auth";

// Wrapper (et non ré-export direct) pour que l'espace-client puisse importer
// la recherche de restaurants revendicables depuis ce même module — les
// fichiers "use server" ne supportent pas la syntaxe `export { x } from "..."`
// pour les server actions (le transform Next.js exige des déclarations de
// fonctions async explicites).
export async function searchAvailableRestaurants(query: string) {
  return searchAvailableRestaurantsImpl(query);
}

export interface UpdateRestaurantData {
  name_fr: string;
  name_de: string;
  name_en: string;
  description_fr: string;
  description_de: string;
  description_en: string;
  cuisine_type: string;
  cuisine_type_id?: string;
  address: string;
  city: string;
  canton: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  price_range: string;
  opening_hours: Record<string, { open: string; close: string; closed?: boolean }>;
  features: string[];
  video_url?: string;
}

/**
 * Find merchant by auth_user_id first, then fallback to email.
 * Uses admin client to bypass RLS when auth_user_id column doesn't exist.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findMerchantId(supabase: any, userId: string, email: string): Promise<string | null> {
  // Try auth_user_id first
  try {
    const { data } = await supabase
      .from("merchants")
      .select("id")
      .eq("auth_user_id", userId)
      .single();
    if (data) return data.id;
  } catch {
    // Column may not exist yet — fallback to email
  }

  // Fallback: match by email (use admin client to bypass RLS)
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin.from("merchants") as any)
      .select("id")
      .eq("email", email)
      .single();
    return data?.id || null;
  } catch {
    return null;
  }
}

export async function getMerchantRestaurant(): Promise<{
  success: boolean;
  error: string | null;
  data?: DbRestaurant;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    // Get merchant (with email fallback)
    const merchantId = await findMerchantId(supabase, user.id, user.email || "");
    if (!merchantId) return { success: false, error: "Marchand non trouvé" };

    // Get restaurant (use admin client to bypass RLS if auth_user_id not set)
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: restaurant, error } = await (admin.from("restaurants") as any)
      .select("*")
      .eq("merchant_id", merchantId)
      .limit(1)
      .single();

    if (error || !restaurant) return { success: false, error: "Restaurant non trouvé" };
    return { success: true, error: null, data: restaurant as DbRestaurant };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function updateMerchantRestaurant(data: UpdateRestaurantData): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    const merchantId = await findMerchantId(supabase, user.id, user.email || "");
    if (!merchantId) return { success: false, error: "Marchand non trouvé" };

    // Use admin client to bypass RLS when auth_user_id column doesn't exist
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurants") as any)
      .update({
        name_fr: data.name_fr,
        name_de: data.name_de,
        name_en: data.name_en,
        description_fr: data.description_fr,
        description_de: data.description_de,
        description_en: data.description_en,
        cuisine_type: data.cuisine_type,
        cuisine_type_id: data.cuisine_type_id || null,
        address: data.address,
        city: data.city,
        canton: data.canton,
        postal_code: data.postal_code,
        phone: data.phone,
        email: data.email,
        website: data.website,
        instagram: data.instagram || null,
        facebook: data.facebook || null,
        tiktok: data.tiktok || null,
        price_range: data.price_range,
        opening_hours: data.opening_hours,
        features: data.features,
        video_url: data.video_url || null,
      })
      .eq("merchant_id", merchantId);

    if (error) return { success: false, error: "Erreur lors de la mise à jour" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function updateRestaurantPhone(phone: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    const merchantId = await findMerchantId(supabase, user.id, user.email || "");
    if (!merchantId) return { success: false, error: "Marchand non trouvé" };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurants") as any)
      .update({ phone: phone.trim() || null })
      .eq("merchant_id", merchantId);

    if (error) return { success: false, error: "Erreur lors de la sauvegarde" };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function createMerchantRestaurant(data: {
  name_fr: string;
  name_de?: string;
  name_en?: string;
  cuisine_type?: string;
  canton: string;
  city: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  price_range?: string;
  description_fr?: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    const merchantId = await findMerchantId(supabase, user.id, user.email || "");
    if (!merchantId) return { success: false, error: "Marchand non trouvé" };

    const slug = data.name_fr
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const admin = createAdminClient();

    // Pull merchant phone to pre-fill whatsapp_phone
    const { data: merchantData } = await (admin.from("merchants") as any)
      .select("phone")
      .eq("id", merchantId)
      .single();
    const whatsappPhone = merchantData?.phone
      ? merchantData.phone.replace(/[^0-9+]/g, "")
      : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("restaurants") as any).insert({
      merchant_id: merchantId,
      name_fr: data.name_fr,
      name_de: data.name_de || data.name_fr,
      name_en: data.name_en || data.name_fr,
      slug,
      cuisine_type: data.cuisine_type || null,
      canton: data.canton,
      city: data.city,
      address: data.address || null,
      postal_code: data.postal_code || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      price_range: data.price_range || "2",
      description_fr: data.description_fr || null,
      is_published: false,
      whatsapp_phone: whatsappPhone,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function getCuisineTypes(): Promise<CuisineType[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cuisine_types")
      .select("*")
      .order("name_fr", { ascending: true });
    return (data || []) as CuisineType[];
  } catch {
    return [];
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Revendication d'une fiche restaurant EXISTANTE (catalogue déjà peuplé)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Permet à un marchand connecté de revendiquer une fiche restaurant déjà
 * présente dans le catalogue (au lieu d'en créer une nouvelle).
 *
 * Sécurité : le `merchantId` est TOUJOURS dérivé de la session authentifiée
 * (jamais reçu du client). La demande créée est SYSTÉMATIQUEMENT en
 * `pending` / `method='manual'` — l'auto-approbation par correspondance
 * d'email (`method='email_domain'`) est explicitement désactivée pour ce
 * parcours (`forceManualReview: true`), conformément à la décision sécurité
 * imposant une validation admin manuelle systématique.
 */
export async function claimExistingRestaurant(restaurantSlug: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    if (!restaurantSlug || typeof restaurantSlug !== "string") {
      return { success: false, error: "Restaurant invalide" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    // Le merchantId est dérivé de la session, jamais d'un paramètre client.
    const merchantId = await findMerchantId(supabase, user.id, user.email || "");
    if (!merchantId) return { success: false, error: "Marchand non trouvé" };

    const admin = createAdminClient();

    // Infos marchand pour l'email de notification admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: merchantData } = await (admin.from("merchants") as any)
      .select("name, email, phone")
      .eq("id", merchantId)
      .single();

    if (!merchantData) return { success: false, error: "Marchand non trouvé" };

    // Refuse si le marchand a déjà une fiche restaurant liée
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingRestaurant } = await (admin.from("restaurants") as any)
      .select("id")
      .eq("merchant_id", merchantId)
      .limit(1)
      .maybeSingle();

    if (existingRestaurant) {
      return { success: false, error: "Vous avez déjà une fiche restaurant associée à votre compte" };
    }

    // Refuse si le marchand a déjà une demande de revendication en attente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingPendingClaim } = await (admin.from("claim_requests") as any)
      .select("id")
      .eq("merchant_id", merchantId)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (existingPendingClaim) {
      return { success: false, error: "Vous avez déjà une demande de revendication en attente de validation" };
    }

    // Revérification serveur : le restaurant ciblé doit être bien revendicable
    // (on ne fait jamais confiance à ce que le client affichait dans la recherche).
    // On charge ici tous les champs nécessaires (y compris pour
    // `createClaimRequestCore`) afin d'éviter une relecture redondante.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: restaurant } = await (admin.from("restaurants") as any)
      .select("id, slug, is_published, merchant_id, claim_status, name_fr, email")
      .eq("slug", restaurantSlug)
      .single();

    if (!restaurant) return { success: false, error: "Restaurant introuvable" };
    if (!restaurant.is_published) return { success: false, error: "Ce restaurant n'est pas disponible à la revendication" };
    if (restaurant.merchant_id) return { success: false, error: "Ce restaurant est déjà revendiqué par un autre compte" };
    if (restaurant.claim_status === "pending") {
      return { success: false, error: "Une demande de revendication est déjà en cours pour ce restaurant" };
    }

    // Note : les vérifications ci-dessus sont des garde-fous "amicaux" pour
    // renvoyer un message clair au marchand le plus tôt possible. La garantie
    // d'absence de race condition (anti-vol de fiche) est assurée par le
    // verrou atomique DANS `createClaimRequestCore` (UPDATE conditionnel sur
    // `restaurants`), qui reste la seule source de vérité en cas de course
    // entre deux revendications concurrentes.
    const result = await createClaimRequestCore({
      merchantId,
      merchantName: merchantData.name || "",
      merchantEmail: merchantData.email || "",
      merchantPhone: merchantData.phone || "",
      restaurantSlug,
      preloadedRestaurant: {
        id: restaurant.id,
        name_fr: restaurant.name_fr,
        email: restaurant.email,
        merchant_id: restaurant.merchant_id,
      },
      // Décision sécurité impérative : validation admin manuelle systématique,
      // aucune auto-approbation même en cas de correspondance d'email.
      forceManualReview: true,
    });

    return { success: result.success, error: result.error };
  } catch (err) {
    console.error("[claimExistingRestaurant] Unexpected:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}

export type MerchantRestaurantOrClaimState =
  | { state: "restaurant"; restaurant: DbRestaurant }
  | { state: "pending_claim"; claim: { id: string; restaurant_id: string; created_at: string } }
  | { state: "none" };

/**
 * Détermine l'état "fiche restaurant" du marchand connecté, pour piloter
 * l'affichage de la page mon-restaurant sans logique métier côté client :
 * - `restaurant` : le marchand a déjà une fiche liée (créée ou revendiquée/approuvée)
 * - `pending_claim` : aucune fiche liée, mais une demande de revendication est
 *   en attente de validation admin
 * - `none` : ni fiche ni demande en cours (le marchand doit chercher/créer/revendiquer)
 */
export async function getMerchantRestaurantOrClaim(): Promise<MerchantRestaurantOrClaimState> {
  const session = await getMerchantSession();
  if (!session) return { state: "none" };

  if (session.restaurant) {
    return { state: "restaurant", restaurant: session.restaurant };
  }

  if (session.pendingClaim) {
    return { state: "pending_claim", claim: session.pendingClaim };
  }

  return { state: "none" };
}
