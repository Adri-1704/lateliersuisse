"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
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

  const anthropic = new Anthropic({ apiKey });

  const prompt = `Tu es un chef cuisinier expert en ${cuisineType}. Tu aides le restaurant "${restaurantName}" à trouver des idées de plats du jour créatifs et cohérents avec leur identité culinaire.

Ingrédients disponibles aujourd'hui : ${ingredients}${recentContext}

Propose exactement ${validCount} idées de plats. Retourne uniquement un objet JSON valide avec une clé "idees" contenant un tableau d'objets, chacun avec :
- "name" : nom court et accrocheur du plat (max 6 mots)
- "description" : description appétissante pour le menu (max 25 mots)
- "tip" : astuce de préparation ou de présentation (max 15 mots)

Réponds uniquement avec le JSON, sans texte autour.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || "{}");
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
    console.error("Anthropic inspiration error:", err);
    return { ideas: [], error: "Erreur lors de la génération. Réessayez dans un moment." };
  }
}
