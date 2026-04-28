import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id, phone, source } = await request.json();

    if (!restaurant_id || !phone) {
      return NextResponse.json({ error: "restaurant_id et phone requis" }, { status: 400 });
    }

    // Normalize phone: keep only digits and +
    const normalizedPhone = phone.replace(/[^0-9+]/g, "");
    if (normalizedPhone.length < 10) {
      return NextResponse.json({ error: "Numéro invalide" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await (supabase.from("whatsapp_subscribers") as ReturnType<typeof supabase.from>).upsert(
      {
        restaurant_id,
        phone: normalizedPhone,
        source: source || "website",
        is_active: true,
      } as Record<string, unknown>,
      { onConflict: "restaurant_id,phone" }
    );

    if (error) {
      console.error("WhatsApp subscribe error:", error);
      return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
