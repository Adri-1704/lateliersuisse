/**
 * WhatsApp broadcast via Meta Cloud API.
 *
 * Sends a message to all active subscribers of a restaurant.
 * Returns the number of successfully sent messages.
 *
 * Required env vars:
 *   META_WHATSAPP_TOKEN       — access token from Meta Developer Console
 *   META_WHATSAPP_PHONE_ID    — phone number ID (e.g. 1180493548484374)
 *   META_WHATSAPP_TEMPLATE_NAME — template name approved by Meta (e.g. "plat_du_jour")
 *
 * Note: business-initiated messages require an approved Meta template.
 * The test token expires after 24h — replace with a permanent system user token for production.
 */

import { createAdminClient } from "@/lib/supabase/server";

interface BroadcastOptions {
  restaurantId: string;
  restaurantName: string;
  message: string;
  selectedPhones?: string[]; // if provided, only send to these numbers
  tierLimit?: number;         // max subscribers allowed by subscription
}

export async function sendWhatsAppBroadcast({
  restaurantId,
  restaurantName,
  message,
  selectedPhones,
  tierLimit,
}: BroadcastOptions): Promise<{ sent: number; wamids: string[] }> {
  const token = process.env.META_WHATSAPP_TOKEN?.trim();
  const phoneId = process.env.META_WHATSAPP_PHONE_ID?.trim();
  const templateName = (process.env.META_WHATSAPP_TEMPLATE_NAME || "message_restaurant").trim();

  if (!token || !phoneId) {
    throw new Error("Configuration WhatsApp manquante (token ou phone ID absent)");
  }

  const supabase = createAdminClient();

  let resolvedImageUrl: string | null = null;
  let reservationPhone: string | null = null;

  const { data: resto } = await (supabase
    .from("restaurants") as ReturnType<typeof supabase.from>)
    .select("phone")
    .eq("id", restaurantId)
    .single() as { data: { phone: string | null } | null };

  reservationPhone = resto?.phone ?? null;

  // Use the first uploaded photo from the gallery (position 0)
  const { data: firstPhoto } = await (supabase
    .from("restaurant_images") as ReturnType<typeof supabase.from>)
    .select("url")
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: true })
    .limit(1)
    .single() as { data: { url: string } | null };

  resolvedImageUrl = firstPhoto?.url ?? null;

  if (!resolvedImageUrl) {
    throw new Error("Ajoutez au moins une photo dans la section « Photos » pour envoyer des messages WhatsApp.");
  }

  let subscribers: { phone: string }[] | null;
  let fetchError: unknown;

  if (selectedPhones && selectedPhones.length > 0) {
    // Respect tier limit even on manual selection
    subscribers = tierLimit ? selectedPhones.slice(0, tierLimit).map((phone) => ({ phone })) : selectedPhones.map((phone) => ({ phone }));
    fetchError = null;
  } else {
    let query = (supabase
      .from("whatsapp_subscribers") as ReturnType<typeof supabase.from>)
      .select("phone")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("subscribed_at", { ascending: true }); // oldest subscribers first when capped
    if (tierLimit) query = query.limit(tierLimit);
    const result = await query as { data: { phone: string }[] | null; error: unknown };
    subscribers = result.data;
    fetchError = result.error;
  }

  if (fetchError || !subscribers || subscribers.length === 0) {
    return { sent: 0, wamids: [] };
  }

  const apiUrl = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

  const results = await Promise.allSettled(
    subscribers.map(({ phone }) =>
      sendMetaMessage({ apiUrl, token, to: phone, restaurantName, message, imageUrl: resolvedImageUrl, templateName, reservationPhone })
    )
  );

  const wamids: string[] = [];
  let sent = 0;
  const errors: string[] = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      wamids.push(r.value);
      sent++;
    } else if (r.status === "rejected") {
      errors.push(r.reason instanceof Error ? r.reason.message : String(r.reason));
    }
  }

  if (errors.length > 0) {
    console.error(`WhatsApp broadcast errors for restaurant ${restaurantId}:`, errors);
  }

  if (sent === 0 && errors.length > 0) {
    throw new Error(errors[0]);
  }

  return { sent, wamids };
}

async function sendMetaMessage({
  apiUrl,
  token,
  to,
  restaurantName,
  message,
  imageUrl,
  templateName,
  reservationPhone,
}: {
  apiUrl: string;
  token: string;
  to: string;
  restaurantName: string;
  message: string;
  imageUrl?: string | null;
  templateName: string;
  reservationPhone?: string | null;
}): Promise<string | null> {
  let toClean = to.replace(/[^0-9+]/g, "");
  if (toClean.startsWith("+")) toClean = toClean.slice(1);
  else if (toClean.startsWith("00")) toClean = toClean.slice(2);
  else if (toClean.startsWith("0") && toClean.length === 10) toClean = "41" + toClean.slice(1);

  const body = buildTemplatePayload({ to: toClean, restaurantName, message, imageUrl, templateName, reservationPhone });

  console.log(`[WA] Sending to ${toClean}, template: ${templateName}, payload:`, JSON.stringify(body));

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();
  console.log(`[WA] Meta API response ${res.status}:`, responseText);

  if (!res.ok) {
    throw new Error(`Meta API ${res.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  const wamid = (data?.messages?.[0]?.id as string) ?? null;
  if (!wamid) {
    throw new Error(`Meta API réponse inattendue (pas de message ID): ${responseText}`);
  }
  return wamid;
}

function buildTemplatePayload({
  to,
  restaurantName,
  message,
  imageUrl,
  templateName,
  reservationPhone,
}: {
  to: string;
  restaurantName: string;
  message: string;
  imageUrl?: string | null;
  templateName: string;
  reservationPhone?: string | null;
}) {
  const components: object[] = [];

  // Header with image if available
  if (imageUrl) {
    components.push({
      type: "header",
      parameters: [{ type: "image", image: { link: imageUrl } }],
    });
  }

  // Body with restaurant name + message
  // Meta template params forbid newlines, tabs, and 4+ consecutive spaces
  const sanitizedMessage = message.replace(/[\r\n\t]/g, " ").replace(/ {5,}/g, "    ");
  const phoneSuffix = reservationPhone ? ` | Pour réserver : 📞 ${reservationPhone}` : "";
  const finalMessage = (sanitizedMessage + phoneSuffix).slice(0, 1024);
  components.push({
    type: "body",
    parameters: [
      { type: "text", text: restaurantName },
      { type: "text", text: finalMessage },
    ],
  });

  return {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: "fr" },
      components,
    },
  };
}
