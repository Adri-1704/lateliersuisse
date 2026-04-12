"use server";

import { createAdminClient } from "@/lib/supabase/server";

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

  // 4. Link restaurant if selected
  if (restaurantSlug) {
    // Get restaurant
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id, email, merchant_id")
      .eq("slug", restaurantSlug)
      .single() as { data: { id: string; email: string | null; merchant_id: string | null } | null; error: unknown };

    if (restaurant && !restaurant.merchant_id) {
      // Link restaurant to merchant
      await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
        .update({ merchant_id: (merchant as Record<string, unknown>).id } as Record<string, unknown>)
        .eq("id", restaurant.id);
    }
  }

  return { success: true, error: null };
}

/**
 * Search restaurants available for claiming (no merchant_id set)
 */
export async function searchAvailableRestaurants(query: string): Promise<{ slug: string; name: string; city: string }[]> {
  if (!query || query.length < 2) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("slug, name_fr, city")
    .is("merchant_id", null)
    .eq("is_published", true)
    .ilike("name_fr", `%${query}%`)
    .limit(10) as { data: { slug: string; name_fr: string; city: string }[] | null; error: unknown };

  if (error || !data) return [];
  return data.map((r) => ({ slug: r.slug, name: r.name_fr, city: r.city }));
}
