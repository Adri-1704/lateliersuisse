import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Get plat du jour for a restaurant or all active plats
export async function GET(request: NextRequest) {
  const restaurantId = request.nextUrl.searchParams.get("restaurant_id");
  const supabase = createAdminClient();

  if (restaurantId) {
    // Single restaurant
    const { data } = await supabase
      .from("plat_du_jour")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ platDuJour: data });
  }

  // All active plats du jour (for the feed page)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("plat_du_jour")
    .select("*, restaurants(name_fr, slug, city, canton, cuisine_type)")
    .eq("is_active", true)
    .gte("posted_at", today.toISOString())
    .order("posted_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ plats: data || [] });
}
