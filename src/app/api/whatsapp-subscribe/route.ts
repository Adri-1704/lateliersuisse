import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function toE164(raw: string): string | null {
  let digits = raw.replace(/[^0-9+]/g, "");
  // +41... → keep, strip +
  if (digits.startsWith("+")) digits = digits.slice(1);
  // 0041... → strip 00
  else if (digits.startsWith("00")) digits = digits.slice(2);
  // 07x... (Swiss local 10 digits) → replace leading 0 with 41
  else if (digits.startsWith("0") && digits.length === 10) digits = "41" + digits.slice(1);
  if (digits.length < 7) return null;
  return "+" + digits;
}

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id, phone, source, first_name } = await request.json();

    if (!restaurant_id || !phone) {
      return NextResponse.json({ error: "restaurant_id et phone requis" }, { status: 400 });
    }

    const normalizedPhone = toE164(phone);
    if (!normalizedPhone) {
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
