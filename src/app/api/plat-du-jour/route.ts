import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { startOfTodayZurich } from "@/lib/timezone";

// Get plat du jour for a restaurant or all active plats
export async function GET(request: NextRequest) {
  const restaurantId = request.nextUrl.searchParams.get("restaurant_id");
  const supabase = createAdminClient();

  if (restaurantId) {
    // Single restaurant
    const { data } = await supabase
      .from("plat_du_jour")
      .select("id, restaurant_id, text, image_url, price, posted_at, is_active")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ platDuJour: data });
  }

  // All active plats du jour (for the feed page).
  // "Aujourd'hui" doit s'entendre en heure suisse (Europe/Zurich), pas dans
  // le fuseau du process serveur (UTC en production Vercel) — #39b.
  const startOfDay = startOfTodayZurich();

  const { data } = await supabase
    .from("plat_du_jour")
    .select("id, restaurant_id, text, image_url, price, posted_at, is_active, restaurants(name_fr, slug, city, canton, cuisine_type)")
    .eq("is_active", true)
    .gte("posted_at", startOfDay.toISOString())
    .order("posted_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ plats: data || [] });
}
