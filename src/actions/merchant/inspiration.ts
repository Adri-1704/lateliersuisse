"use server";

import OpenAI from "openai";
import { createClient, createAdminClient } from "@/lib/supabase/server";
// v2

export interface RecipeIdea {
  name: string;
  description: string;
  tip: string;
}

export async function generateRecipeIdeas(
  ingredients: string,
  count: number
): Promise<{ ideas: RecipeIdea[]; error: string | null }> {
  if (!ingredients.trim()) {
    return { ideas: [], error: "Veuillez saisir au moins un ingrédient." };
  }

  const validCount = [3, 5, 10].includes(count) ? count : 5;

  const apiKey = process.env.OPENAI_API_KEY;
  console.log("[inspiration] OPENAI_API_KEY present:", !!apiKey, "length:", apiKey?.length ?? 0);
  if (!apiKey) return { ideas: [], error: "Service IA non configuré." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ideas: [], error: "Non authentifié." };

  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from("merchants")
    .select("id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .single() as { data: { id: string } | null };

  if (!merchant) return { ideas: [], error: "Restaurant introuvable." };

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, name_fr, cuisine_type")
    .eq("merchant_id", merchant.id)
    .limit(1)
    .single() as { data: { id: string; name_fr: string | null; cuisine_type: string | null } | null };

  if (!restaurant) return { ideas: [], error: "Restaurant introuvable." };

  const cuisineType = restaurant.cuisine_type || "cuisine générale";
  const restaurantName = restaurant.name_fr || "votre restaurant";

  // Recent plats du jour to avoid repetition
  const { data: recentPlats } = await (admin.from("plat_du_jour") as ReturnType<typeof admin.from>)
    .select("text")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(5) as { data: { text: string }[] | null };

  const recentContext = recentPlats?.length
    ? `\nPlats récemment publiés (éviter la répétition) : ${recentPlats.map((p) => p.text).join(" | ")}`
    : "";

  const openai = new OpenAI({ apiKey });

  const prompt = `Tu es un chef cuisinier expert en ${cuisineType}. Tu aides le restaurant "${restaurantName}" à trouver des idées de plats du jour créatifs et cohérents avec leur identité culinaire.

Ingrédients disponibles aujourd'hui : ${ingredients}${recentContext}

Propose exactement ${validCount} idées de plats. Retourne un objet JSON avec une clé "idees" contenant un tableau d'objets, chacun avec :
- "name" : nom court et accrocheur du plat (max 6 mots)
- "description" : description appétissante pour le menu (max 25 mots)
- "tip" : astuce de préparation ou de présentation (max 15 mots)`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    const raw: Record<string, string>[] = Array.isArray(parsed)
      ? parsed
      : (parsed.idees || parsed.ideas || []);

    const ideas: RecipeIdea[] = raw.slice(0, validCount).map((i) => ({
      name: i.name || "",
      description: i.description || "",
      tip: i.tip || "",
    }));

    return { ideas, error: null };
  } catch (err) {
    console.error("OpenAI inspiration error:", err);
    return { ideas: [], error: "Erreur lors de la génération. Réessayez dans un moment." };
  }
}
