import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isPlausiblePhoneNumber, normalizePhoneNumber } from "@/lib/phone";

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id, phone, source, first_name } = await request.json();

    if (!restaurant_id || !phone) {
      return NextResponse.json({ error: "restaurant_id et phone requis" }, { status: 400 });
    }

    // Normalize phone: keep only digits and +
    const normalizedPhone = normalizePhoneNumber(phone);
    // Renforcement #36 : la validation client peut être contournée (appel
    // direct à l'API) — on revalide le format plausible côté serveur pour
    // éviter de créer des abonnés WhatsApp inexploitables (quota Meta facturé).
    if (!isPlausiblePhoneNumber(normalizedPhone)) {
      return NextResponse.json({ error: "Numéro invalide" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await (supabase.from("whatsapp_subscribers") as ReturnType<typeof supabase.from>).upsert(
      {
        restaurant_id,
        phone: normalizedPhone,
        source: source || "website",
        is_active: true,
        first_name: first_name || null,
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
