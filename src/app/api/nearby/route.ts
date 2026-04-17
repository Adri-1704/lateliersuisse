import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");
  const radius = parseFloat(searchParams.get("radius") || "20");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  if (isNaN(lat) || isNaN(lon) || lat < 44 || lat > 49 || lon < 5 || lon > 11) {
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("nearby_restaurants", {
      user_lat: lat,
      user_lon: lon,
      max_distance_km: Math.min(radius, 100),
      result_limit: Math.min(limit, 100),
    });

    if (error) {
      console.error("Nearby query error:", error);
      return NextResponse.json({ error: "Erreur de recherche" }, { status: 500 });
    }

    return NextResponse.json({ restaurants: data || [] });
  } catch (err) {
    console.error("Nearby API error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
