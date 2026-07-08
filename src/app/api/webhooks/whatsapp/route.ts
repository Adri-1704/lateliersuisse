import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendWhatsAppBroadcast } from "@/lib/whatsapp/broadcast";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

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
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return handleMetaWebhook(request);
  }

  return handleTwilioWebhook(request);
}

async function handleMetaWebhook(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ok" });
    }

    const supabase = createAdminClient();

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue;
        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;

        for (const msg of value.messages || []) {
          if (msg.type !== "text") continue;

          const from = msg.from as string; // digits only, no +
          const text = (msg.text?.body || "") as string;

          if (text.trim().toUpperCase() === "STOP") {
            await (supabase.from("whatsapp_subscribers") as ReturnType<typeof supabase.from>)
              .update({ is_active: false } as Record<string, unknown>)
              .or(`phone.eq.${from},phone.eq.+${from}`);

            await sendFreeMetaMessage(
              phoneNumberId,
              from,
              "✅ Vous avez été désabonné. Vous ne recevrez plus de messages Just-Tag."
            );
          } else {
            await sendFreeMetaMessage(
              phoneNumberId,
              from,
              "Merci pour votre message ! 🍽️\n\nDécouvrez les meilleurs restaurants suisses sur just-tag.app"
            );
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Meta webhook error:", error);
    // Always return 200 to Meta to avoid retries
    return NextResponse.json({ status: "ok" });
  }
}

async function sendFreeMetaMessage(phoneNumberId: string, to: string, text: string) {
  const token = process.env.META_WHATSAPP_TOKEN;
  if (!token || !phoneNumberId) return;

  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  }).catch((err) => console.error("Meta reply error:", err));
}

async function handleTwilioWebhook(request: NextRequest) {
  try {
    const rawBody = await request.text();

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

    if (body.trim().toUpperCase() === "STOP") {
      await (supabase.from("whatsapp_subscribers") as ReturnType<typeof supabase.from>)
        .update({ is_active: false } as Record<string, unknown>)
        .eq("phone", normalizedPhone);
      return twimlResponse("✅ Vous avez été désabonné. Vous ne recevrez plus de messages Just-Tag.");
    }

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

    const priceMatch = body.match(/(\d+[.,]?\d*)\s*CHF|CHF\s*(\d+[.,]?\d*)/i);
    const price = priceMatch ? (priceMatch[1] || priceMatch[2]) + " CHF" : null;

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
