"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { HappyHour, HappyHourPromoType } from "@/lib/supabase/types";

// ============================================================
// Happy Hours — Server actions (V1 Light, zero cout WhatsApp)
// ============================================================
// Toutes les mutations passent par ces server actions.
// Ownership verifie cote serveur via merchants.auth_user_id -> restaurants.merchant_id.
// Lectures publiques (pour RSC) exposees egalement ici pour cohesion.
// ============================================================

const PROMO_TYPES: readonly HappyHourPromoType[] = [
  "percentage",
  "fixed_amount",
  "free_item",
  "special_menu",
] as const;

export interface HappyHourInput {
  title: string;
  description?: string | null;
  promo_type: HappyHourPromoType;
  promo_value?: string | null;
  starts_at: string; // ISO
  ends_at: string; // ISO
  places_total?: number | null;
  is_active?: boolean;
}

const happyHourInputSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(120),
  description: z.string().max(500).nullable().optional(),
  promo_type: z.enum(["percentage", "fixed_amount", "free_item", "special_menu"]),
  promo_value: z.string().max(80).nullable().optional(),
  starts_at: z.string().min(1),
  ends_at: z.string().min(1),
  places_total: z.number().int().positive().max(10000).nullable().optional(),
  is_active: z.boolean().optional(),
});

// ------------------------------------------------------------
// Helpers d'ownership
// ------------------------------------------------------------

async function findMerchantIdForCurrentUser(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: byAuth } = await (admin.from("merchants") as any)
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (byAuth?.id) return byAuth.id as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: byEmail } = await (admin.from("merchants") as any)
      .select("id")
      .eq("email", user.email || "")
      .maybeSingle();
    return (byEmail?.id as string) || null;
  } catch {
    return null;
  }
}

async function assertMerchantOwnsRestaurant(restaurantId: string): Promise<{
  ok: true;
  merchantId: string;
} | { ok: false; error: string }> {
  const merchantId = await findMerchantIdForCurrentUser();
  if (!merchantId) return { ok: false, error: "Non authentifie" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin.from("restaurants") as any)
    .select("id")
    .eq("id", restaurantId)
    .eq("merchant_id", merchantId)
    .maybeSingle();

  if (!data) return { ok: false, error: "Acces refuse" };
  return { ok: true, merchantId };
}

async function assertMerchantOwnsHappyHour(id: string): Promise<{
  ok: true;
  merchantId: string;
  restaurantId: string;
} | { ok: false; error: string }> {
  const merchantId = await findMerchantIdForCurrentUser();
  if (!merchantId) return { ok: false, error: "Non authentifie" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: hh } = await (admin.from("happy_hours") as any)
    .select("restaurant_id")
    .eq("id", id)
    .maybeSingle();
  if (!hh) return { ok: false, error: "Happy Hour introuvable" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: resto } = await (admin.from("restaurants") as any)
    .select("id, slug")
    .eq("id", hh.restaurant_id)
    .eq("merchant_id", merchantId)
    .maybeSingle();
  if (!resto) return { ok: false, error: "Acces refuse" };

  return { ok: true, merchantId, restaurantId: hh.restaurant_id as string };
}

async function getRestaurantSlug(restaurantId: string): Promise<string | null> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin.from("restaurants") as any)
    .select("slug")
    .eq("id", restaurantId)
    .maybeSingle();
  return (data?.slug as string) || null;
}

function revalidateAfterMutation(slug?: string | null) {
  // Page listing publique + homepage
  revalidatePath("/[locale]/happy-hours", "page");
  revalidatePath("/[locale]", "page");
  if (slug) {
    revalidatePath(`/[locale]/restaurants/${slug}`, "page");
  }
}

function validateWindow(starts_at: string, ends_at: string): string | null {
  const s = new Date(starts_at);
  const e = new Date(ends_at);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return "Dates invalides";
  }
  if (e.getTime() <= s.getTime()) {
    return "La fin doit etre posterieure au debut";
  }
  // On autorise une HH commencant jusqu'a 2 min dans le passe (decalage horloge)
  if (s.getTime() < Date.now() - 2 * 60 * 1000) {
    return "La date de debut doit etre dans le futur";
  }
  return null;
}

// ------------------------------------------------------------
// Mutations merchant
// ------------------------------------------------------------

export async function createHappyHour(
  restaurantId: string,
  input: HappyHourInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const parsed = happyHourInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Donnees invalides" };
    }
    const windowError = validateWindow(parsed.data.starts_at, parsed.data.ends_at);
    if (windowError) return { success: false, error: windowError };

    const auth = await assertMerchantOwnsRestaurant(restaurantId);
    if (!auth.ok) return { success: false, error: auth.error };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin.from("happy_hours") as any)
      .insert({
        restaurant_id: restaurantId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        promo_type: parsed.data.promo_type,
        promo_value: parsed.data.promo_value || null,
        starts_at: parsed.data.starts_at,
        ends_at: parsed.data.ends_at,
        places_total: parsed.data.places_total ?? null,
        is_active: parsed.data.is_active !== false,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: "Erreur lors de la creation" };
    }

    const slug = await getRestaurantSlug(restaurantId);
    revalidateAfterMutation(slug);

    return { success: true, id: data.id as string };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function updateHappyHour(
  id: string,
  patch: Partial<HappyHourInput>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const auth = await assertMerchantOwnsHappyHour(id);
    if (!auth.ok) return { success: false, error: auth.error };

    // Validation partielle : on ne valide que les champs fournis
    const partial: Record<string, unknown> = {};
    if (patch.title !== undefined) partial.title = patch.title;
    if (patch.description !== undefined) partial.description = patch.description || null;
    if (patch.promo_type !== undefined) {
      if (!PROMO_TYPES.includes(patch.promo_type)) {
        return { success: false, error: "Type de promo invalide" };
      }
      partial.promo_type = patch.promo_type;
    }
    if (patch.promo_value !== undefined) partial.promo_value = patch.promo_value || null;
    if (patch.starts_at !== undefined) partial.starts_at = patch.starts_at;
    if (patch.ends_at !== undefined) partial.ends_at = patch.ends_at;
    if (patch.places_total !== undefined) partial.places_total = patch.places_total ?? null;
    if (patch.is_active !== undefined) partial.is_active = patch.is_active;

    // Si les dates sont modifiees, on re-valide la fenetre
    if (partial.starts_at && partial.ends_at) {
      const err = validateWindow(String(partial.starts_at), String(partial.ends_at));
      if (err) return { success: false, error: err };
    }

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("happy_hours") as any)
      .update(partial)
      .eq("id", id);

    if (error) return { success: false, error: "Erreur lors de la mise a jour" };

    const slug = await getRestaurantSlug(auth.restaurantId);
    revalidateAfterMutation(slug);
    return { success: true };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function deleteHappyHour(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const auth = await assertMerchantOwnsHappyHour(id);
    if (!auth.ok) return { success: false, error: auth.error };

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("happy_hours") as any)
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: "Erreur lors de la suppression" };

    const slug = await getRestaurantSlug(auth.restaurantId);
    revalidateAfterMutation(slug);
    return { success: true };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

// ------------------------------------------------------------
// Lectures (publiques ou merchant)
// ------------------------------------------------------------

export interface HappyHourWithRestaurant extends HappyHour {
  restaurant: {
    slug: string;
    name_fr: string;
    city: string;
    canton: string;
    cuisine_type: string | null;
    phone: string | null;
    cover_image: string | null;
  };
}

interface HHListFilters {
  canton?: string;
  city?: string;
  cuisine?: string;
  timing?: "now" | "today" | "week";
  limit?: number;
}

export async function getActiveHappyHoursForRestaurant(
  restaurantId: string,
): Promise<HappyHour[]> {
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin.from("happy_hours") as any)
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .gt("ends_at", nowIso)
    .order("starts_at", { ascending: true });
  return (data || []) as HappyHour[];
}

export async function getMerchantHappyHours(restaurantId: string): Promise<{
  success: boolean;
  error?: string;
  data?: HappyHour[];
}> {
  const auth = await assertMerchantOwnsRestaurant(restaurantId);
  if (!auth.ok) return { success: false, error: auth.error };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin.from("happy_hours") as any)
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("starts_at", { ascending: false });

  if (error) return { success: false, error: "Erreur de chargement" };
  return { success: true, data: (data || []) as HappyHour[] };
}

export async function getHappyHourById(id: string): Promise<{
  success: boolean;
  error?: string;
  data?: HappyHour;
}> {
  const auth = await assertMerchantOwnsHappyHour(id);
  if (!auth.ok) return { success: false, error: auth.error };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin.from("happy_hours") as any)
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return { success: false, error: "Introuvable" };
  return { success: true, data: data as HappyHour };
}

export async function getActiveHappyHoursAllCantons(
  filters: HHListFilters = {},
): Promise<HappyHourWithRestaurant[]> {
  const admin = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();

  let endBoundaryIso: string | null = null;
  let startBoundaryIso: string | null = null;
  if (filters.timing === "now") {
    // HH deja commencee et pas encore terminee
    endBoundaryIso = null;
  } else if (filters.timing === "today") {
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    startBoundaryIso = endOfDay.toISOString();
  } else if (filters.timing === "week") {
    const inAWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    startBoundaryIso = inAWeek.toISOString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = admin
    .from("happy_hours")
    .select(
      "*, restaurants(slug, name_fr, city, canton, cuisine_type, phone, cover_image, is_published)",
    )
    .eq("is_active", true)
    .gt("ends_at", nowIso);

  if (filters.timing === "now") {
    query = query.lte("starts_at", nowIso);
  } else if (startBoundaryIso) {
    query = query.lte("starts_at", startBoundaryIso);
  }
  if (endBoundaryIso) {
    query = query.lte("ends_at", endBoundaryIso);
  }

  query = query.order("starts_at", { ascending: true }).limit(filters.limit || 60);

  const { data } = await query;
  if (!data) return [];

  type Row = HappyHour & {
    restaurants:
      | {
          slug: string;
          name_fr: string;
          city: string;
          canton: string;
          cuisine_type: string | null;
          phone: string | null;
          cover_image: string | null;
          is_published: boolean;
        }
      | null;
  };

  return (data as Row[])
    .filter((row) => row.restaurants && row.restaurants.is_published)
    .filter((row) => {
      const r = row.restaurants!;
      if (filters.canton && r.canton !== filters.canton) return false;
      if (filters.city && r.city !== filters.city) return false;
      if (filters.cuisine && r.cuisine_type !== filters.cuisine) return false;
      return true;
    })
    .map((row) => ({
      id: row.id,
      restaurant_id: row.restaurant_id,
      title: row.title,
      description: row.description,
      promo_type: row.promo_type,
      promo_value: row.promo_value,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      places_total: row.places_total,
      is_active: row.is_active,
      views_count: row.views_count,
      clicks_count: row.clicks_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      restaurant: {
        slug: row.restaurants!.slug,
        name_fr: row.restaurants!.name_fr,
        city: row.restaurants!.city,
        canton: row.restaurants!.canton,
        cuisine_type: row.restaurants!.cuisine_type,
        phone: row.restaurants!.phone,
        cover_image: row.restaurants!.cover_image,
      },
    }));
}

// ------------------------------------------------------------
// Tracking public
// ------------------------------------------------------------

export async function trackHappyHourClick(id: string): Promise<{ success: boolean }> {
  try {
    const admin = createAdminClient();
    // Fetch + increment (pas de RPC disponible, on fait un lire-puis-ecrire minimaliste)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin.from("happy_hours") as any)
      .select("clicks_count")
      .eq("id", id)
      .maybeSingle();
    const current = (data?.clicks_count as number) || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from("happy_hours") as any)
      .update({ clicks_count: current + 1 })
      .eq("id", id);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function trackHappyHourView(id: string): Promise<{ success: boolean }> {
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin.from("happy_hours") as any)
      .select("views_count")
      .eq("id", id)
      .maybeSingle();
    const current = (data?.views_count as number) || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from("happy_hours") as any)
      .update({ views_count: current + 1 })
      .eq("id", id);
    return { success: true };
  } catch {
    return { success: false };
  }
}
