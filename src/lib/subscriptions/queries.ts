import { createAdminClient } from "@/lib/supabase/server";
import { EARLY_BIRD_LIMIT } from "@/lib/stripe";

/**
 * Count active + trialing Early Bird subscriptions only.
 * Legacy subscriptions (is_early_bird = false) are excluded so they
 * don't consume Early Bird slots. Returns spots remaining (max 100).
 */
export async function getEarlyBirdSpotsRemaining(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("is_early_bird", true)
      .in("status", ["active", "trialing"]);

    const subscriberCount = count ?? 0;
    return Math.max(0, EARLY_BIRD_LIMIT - subscriberCount);
  } catch {
    // Fallback: assume spots available if DB is unreachable
    return EARLY_BIRD_LIMIT;
  }
}

/**
 * Check if Early Bird offer is still available.
 */
export async function isEarlyBirdStillAvailable(): Promise<boolean> {
  const remaining = await getEarlyBirdSpotsRemaining();
  return remaining > 0;
}
