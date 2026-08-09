import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendWhatsAppBroadcast } from "@/lib/whatsapp/broadcast";
import {
  getMonthlyBroadcastUsage,
  getWhatsAppPlanTier,
  recordBroadcast,
} from "@/actions/merchant/whatsapp-broadcast";
import { monthlyQuotaForTier } from "@/lib/whatsapp/quota";

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

/**
 * Vérifie la signature HMAC-SHA256 envoyée par Meta dans le header
 * `X-Hub-Signature-256` (format `sha256=<hex>`), calculée sur le corps brut
 * de la requête avec l'app secret Meta comme clé.
 * Doc: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
 */
function validateMetaSignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const providedHex = signatureHeader.slice("sha256=".length);
  const expectedHex = crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  try {
    const provided = Buffer.from(providedHex, "hex");
    const expected = Buffer.from(expectedHex, "hex");
    if (provided.length !== expected.length) return false;
    return crypto.timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}

/**
 * Normalise un numéro de téléphone brut avant toute utilisation dans un
 * filtre PostgREST (.or(...)). N'autorise que les chiffres et le signe '+',
 * et renvoie null si la valeur est vide ou anormalement longue — de quoi
 * empêcher toute injection de filtre PostgREST (ex: "0,phone.not.is.null").
 */
function sanitizePhoneForFilter(raw: string): string | null {
  const cleaned = (raw || "").replace(/[^0-9+]/g, "");
  if (!cleaned || cleaned.length > 20) return null;
  return cleaned;
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
    const rawBody = await request.text();

    const appSecret = process.env.META_APP_SECRET;
    const signatureHeader = request.headers.get("x-hub-signature-256");
    if (!appSecret || !validateMetaSignature(rawBody, signatureHeader, appSecret)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ok" });
    }

    const supabase = createAdminClient();

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue;
        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;

        // Handle incoming messages (STOP, replies)
        for (const msg of value.messages || []) {
          if (msg.type !== "text") continue;

          const from = msg.from as string;
          const text = (msg.text?.body || "") as string;
          const safeFrom = sanitizePhoneForFilter(from);

          if (!safeFrom) {
            // Numéro d'expéditeur anormal : on ignore ce message plutôt que
            // de risquer une injection de filtre PostgREST.
            continue;
          }

          if (text.trim().toUpperCase() === "STOP") {
            await (supabase.from("whatsapp_subscribers") as ReturnType<typeof supabase.from>)
              .update({ is_active: false } as Record<string, unknown>)
              .or(`phone.eq.${safeFrom},phone.eq.+${safeFrom}`);

            await sendFreeMetaMessage(
              phoneNumberId,
              from,
              "✅ Vous avez été désabonné. Vous ne recevrez plus de messages Just-Tag."
            );
          } else {
            await sendFreeMetaMessage(
              phoneNumberId,
              from,
              await buildIncomingReplyMessage(supabase, safeFrom)
            );
          }
        }

        // Handle message status updates (delivered, read)
        for (const statusUpdate of value.statuses || []) {
          const wamid = statusUpdate.id as string;
          const status = statusUpdate.status as string;

          if (status !== "delivered" && status !== "read") continue;

          try {
            const { data: tracking } = await (supabase.from("whatsapp_message_tracking") as ReturnType<typeof supabase.from>)
              .select("broadcast_id")
              .eq("wamid", wamid)
              .single() as { data: { broadcast_id: string } | null };

            if (tracking?.broadcast_id) {
              const field = status === "read" ? "read_count" : "delivered_count";
              await (supabase.rpc as Function)("increment_broadcast_stat", {
                p_broadcast_id: tracking.broadcast_id,
                p_field: field,
              });
            }
          } catch {
            // Non-blocking — tracking table may not exist yet
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

/**
 * Un client qui répond directement au broadcast WhatsApp d'un restaurant
 * arrive sur le numéro Just-Tag partagé, pas sur le restaurant — s'il
 * pensait réserver via ce message, sa demande ne sera jamais vue. On
 * identifie le(s) restaurant(s) auquel ce numéro est abonné pour donner
 * une réponse précise avec le vrai numéro de réservation, plutôt qu'un
 * message générique qui n'aide pas à corriger la confusion.
 */
async function buildIncomingReplyMessage(
  supabase: ReturnType<typeof createAdminClient>,
  from: string
): Promise<string> {
  const genericReply =
    "Ce numéro sert uniquement à recevoir des actus WhatsApp des restaurants abonnés — il n'est pas surveillé pour les réservations. Pour réserver, contactez directement le restaurant via le numéro affiché sur sa fiche just-tag.app.";

  // Défense en profondeur : re-valide même si l'appelant a déjà sanitizé.
  const safeFrom = sanitizePhoneForFilter(from);
  if (!safeFrom) return genericReply;

  try {
    const { data: subs } = await (supabase.from("whatsapp_subscribers") as ReturnType<typeof supabase.from>)
      .select("restaurant_id")
      .eq("is_active", true)
      .or(`phone.eq.${safeFrom},phone.eq.+${safeFrom}`) as { data: { restaurant_id: string }[] | null };

    const restaurantIds = [...new Set((subs || []).map((s) => s.restaurant_id))];
    if (restaurantIds.length !== 1) return genericReply;

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("name_fr, phone, slug")
      .eq("id", restaurantIds[0])
      .single() as { data: { name_fr: string; phone: string | null; slug: string } | null };

    if (!restaurant) return genericReply;

    const contactLine = restaurant.phone
      ? `📞 ${restaurant.phone}`
      : `just-tag.app/fr/restaurants/${restaurant.slug}`;

    return `Ce numéro sert uniquement à vous envoyer les actus WhatsApp de ${restaurant.name_fr} — il n'est pas surveillé pour les réservations.\n\nPour réserver, contactez directement le restaurant : ${contactLine}`;
  } catch (err) {
    console.error("[whatsapp webhook] Impossible d'identifier le restaurant pour la réponse auto:", err);
    return genericReply;
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

    // Sanitise avant toute utilisation dans un filtre PostgREST .or(...) — le
    // lot 1 n'avait corrigé que la branche Meta (handleMetaWebhook) ; `from`
    // provient directement du champ "From" fourni par Twilio et n'était pas
    // nettoyé ici, ouvrant la même faille d'injection de filtre.
    const safeNormalizedPhone = sanitizePhoneForFilter(normalizedPhone);
    const safeFrom = sanitizePhoneForFilter(from);

    if (!safeNormalizedPhone) {
      return twimlResponse(
        "❌ Numéro non reconnu. Contactez contact@just-tag.app pour lier votre numéro à votre restaurant."
      );
    }

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id, name_fr, merchant_id")
      .or(`whatsapp_phone.eq.${safeNormalizedPhone},phone.eq.${safeNormalizedPhone},phone.eq.${safeFrom ?? safeNormalizedPhone}`)
      .eq("is_published", true)
      .limit(1)
      .single() as { data: { id: string; name_fr: string; merchant_id: string | null } | null };

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

    // Ce webhook envoyait auparavant en appelant directement sendWhatsAppBroadcast(),
    // sans jamais vérifier ni enregistrer le quota mensuel — contrairement au flow
    // dashboard (broadcastWhatsApp). Un restaurateur pouvait donc envoyer des
    // messages WhatsApp réels (facturés par Meta) sans aucune limite, invisibles
    // dans le suivi d'usage. On applique désormais le même contrôle ici.
    const tier = restaurant.merchant_id ? await getWhatsAppPlanTier(restaurant.merchant_id) : null;
    const quota = monthlyQuotaForTier(tier);
    const used = await getMonthlyBroadcastUsage(restaurant.id);

    if (used >= quota) {
      return twimlResponse(
        `⚠️ Quota WhatsApp mensuel atteint (${quota} messages/mois) pour ${restaurant.name_fr}. Le plat du jour a bien été mis à jour sur just-tag.app, mais aucun message n'a été envoyé aux abonnés. Renouvellement le 1er du mois prochain.`
      );
    }

    const { sent, wamids } = await sendWhatsAppBroadcast({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name_fr,
      message: body,
      tierLimit: tier ?? 50,
    });

    await recordBroadcast(restaurant.id, body, sent, wamids);

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
