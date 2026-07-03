"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface SavedRecipe {
  id: string;
  name: string;
  description: string | null;
  tip: string | null;
  cooked: boolean;
  created_at: string;
}

interface SavedRecipeRow {
  id: string;
  name: string;
  description: string | null;
  tip: string | null;
  cooked: boolean;
  created_at: string;
}

async function getRestaurantId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from("merchants")
    .select("id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .single() as { data: { id: string } | null };

  if (!merchant) return null;

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id")
    .eq("merchant_id", merchant.id)
    .limit(1)
    .single() as { data: { id: string } | null };

  return restaurant?.id ?? null;
}

export async function getSavedRecipes(): Promise<{ recipes: SavedRecipe[]; error: string | null }> {
  const restaurantId = await getRestaurantId();
  if (!restaurantId) return { recipes: [], error: "Non authentifié." };

  const admin = createAdminClient();
  const { data, error } = await (admin.from("saved_recipes") as ReturnType<typeof admin.from>)
    .select("id, name, description, tip, cooked, created_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false }) as { data: SavedRecipeRow[] | null; error: unknown };

  if (error) return { recipes: [], error: "Erreur lors du chargement." };
  return { recipes: data ?? [], error: null };
}

export async function saveRecipe(recipe: {
  name: string;
  description: string;
  tip: string;
}): Promise<{ id: string | null; error: string | null }> {
  const restaurantId = await getRestaurantId();
  if (!restaurantId) return { id: null, error: "Non authentifié." };

  const admin = createAdminClient();
  const { data, error } = await (admin.from("saved_recipes") as ReturnType<typeof admin.from>)
    .insert({
      restaurant_id: restaurantId,
      name: recipe.name,
      description: recipe.description,
      tip: recipe.tip,
      cooked: false,
    } as Record<string, unknown>)
    .select("id")
    .single() as { data: { id: string } | null; error: unknown };

  if (error) return { id: null, error: "Erreur lors de la sauvegarde." };
  return { id: data?.id ?? null, error: null };
}

export async function toggleRecipeCooked(id: string, cooked: boolean): Promise<{ error: string | null }> {
  const restaurantId = await getRestaurantId();
  if (!restaurantId) return { error: "Non authentifié." };

  const admin = createAdminClient();
  const { error } = await (admin.from("saved_recipes") as ReturnType<typeof admin.from>)
    .update({ cooked } as Record<string, unknown>)
    .eq("id", id)
    .eq("restaurant_id", restaurantId);

  if (error) return { error: "Erreur lors de la mise à jour." };
  return { error: null };
}

export async function deleteRecipe(id: string): Promise<{ error: string | null }> {
  const restaurantId = await getRestaurantId();
  if (!restaurantId) return { error: "Non authentifié." };

  const admin = createAdminClient();
  const { error } = await (admin.from("saved_recipes") as ReturnType<typeof admin.from>)
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurantId);

  if (error) return { error: "Erreur lors de la suppression." };
  return { error: null };
}
