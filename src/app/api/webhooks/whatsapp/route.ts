import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendWhatsAppBroadcast } from "@/lib/whatsapp/broadcast";

function validateTwilioSignature(
  url: string,
  rawBody: string,
  signature: string,
  authToken: string
): boolean {
  const params = new URLSearchParams(rawBody);
  const sortedKeys = [...params.keys()].sort();
  let signingString = url;
  for (const key of sortedKeys) {
    signingString += key + (params.get(key) ?? "");
  }
  const expected = crypto.createHmac("sha1", authToken).update(signingString).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Validate Twilio signature to reject spoofed requests
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const signature = request.headers.get("x-twilio-signature") ?? "";
    if (!authToken || !validateTwilioSignature(request.url, rawBody, signature, authToken)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formParams = new URLSearchParams(rawBody);
    const from = (formParams.get("From") || "").replace("whatsapp:", "");
    const body = formParams.get("Body") || "";
    const numMedia = parseInt(formParams.get("NumMedia") || "0", 10);
    const mediaUrl = numMedia > 0 ? (formParams.get("MediaUrl0") || null) : null;

    if (!from || !body) {
      return twimlResponse("❌ Message vide. Envoyez une photo + description de votre plat du jour.");
    }

    const normalizedPhone = from.replace(/[^0-9+]/g, "");
    const supabase = createAdminClient();

    // Handle STOP — deactivate this subscriber from all restaurants
    if (body.trim().toUpperCase() === "STOP") {
      await (supabase.from("whatsapp_subscribers") as ReturnType<typeof supabase.from>)
        .update({ is_active: false } as Record<string, unknown>)
        .eq("phone", normalizedPhone);
      return twimlResponse("✅ Vous avez été désabonné. Vous ne recevrez plus de messages Just-Tag.");
    }

    // Find restaurant by WhatsApp phone
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id, name_fr")
      .or(`whatsapp_phone.eq.${normalizedPhone},phone.eq.${normalizedPhone},phone.eq.${from}`)
      .eq("is_published", true)
      .limit(1)
      .single() as { data: { id: string; name_fr: string } | null };

    if (!restaurant) {
      return twimlResponse(
        "❌ Numéro non reconnu. Contactez contact@just-tag.app pour lier votre numéro à votre restaurant."
      );
    }

    // Download and re-upload image to Supabase Storage if media present
    let imageUrl: string | null = null;
    if (mediaUrl) {
      try {
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
        const headers: Record<string, string> = {};
        if (twilioSid && twilioAuth) {
          headers["Authorization"] = `Basic ${Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64")}`;
        }
        const imgRes = await fetch(mediaUrl, { headers });
        if (imgRes.ok) {
          const blob = await imgRes.blob();
          const ext = blob.type.includes("png") ? "png" : "jpg";
          const path = `plat-du-jour/${restaurant.id}/${Date.now()}.${ext}`;
          await supabase.storage.from("restaurants").upload(path, blob, { upsert: true });
          const { data: publicUrl } = supabase.storage.from("restaurants").getPublicUrl(path);
          imageUrl = publicUrl.publicUrl;
        }
      } catch {
        // Continue without image if upload fails
      }
    }

    // Extract price (pattern: XX CHF or CHF XX)
    const priceMatch = body.match(/(\d+[.,]?\d*)\s*CHF|CHF\s*(\d+[.,]?\d*)/i);
    const price = priceMatch ? (priceMatch[1] || priceMatch[2]) + " CHF" : null;

    // Deactivate previous plat du jour and insert new one
    await (supabase.from("plat_du_jour") as ReturnType<typeof supabase.from>)
      .update({ is_active: false } as Record<string, unknown>)
      .eq("restaurant_id", restaurant.id);

    await (supabase.from("plat_du_jour") as ReturnType<typeof supabase.from>)
      .insert({
        restaurant_id: restaurant.id,
        text: body,
        image_url: imageUrl,
        price,
        posted_by_phone: normalizedPhone,
      } as Record<string, unknown>);

    // Broadcast to all subscribers (non-blocking — errors are logged but don't fail the webhook)
    const sent = await sendWhatsAppBroadcast({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name_fr,
      message: body,
      imageUrl,
    });

    const subscriberLine = sent > 0
      ? `\n\n📲 Envoyé à ${sent} abonné${sent > 1 ? "s" : ""} WhatsApp.`
      : "";

    return twimlResponse(
      `✅ Plat du jour publié pour ${restaurant.name_fr} !\n\n"${body.slice(0, 80)}${body.length > 80 ? "..." : ""}"\n\nVisible sur just-tag.app${subscriberLine}`
    );
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return twimlResponse("❌ Erreur technique. Réessayez dans quelques minutes.");
  }
}

function twimlResponse(message: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
