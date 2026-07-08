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
  imageUrl?: string | null;
}

export async function sendWhatsAppBroadcast({
  restaurantId,
  restaurantName,
  message,
  imageUrl,
}: BroadcastOptions): Promise<number> {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.META_WHATSAPP_PHONE_ID;
  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME || "message_restaurant";

  if (!token || !phoneId) {
    console.warn("WhatsApp broadcast skipped: missing META_WHATSAPP_TOKEN or META_WHATSAPP_PHONE_ID");
    return 0;
  }

  const supabase = createAdminClient();

  // The message_restaurant template always requires a header image.
  // Use the user-provided image, fall back to the restaurant cover image.
  let resolvedImageUrl = imageUrl ?? null;
  if (!resolvedImageUrl) {
    const { data: resto } = await (supabase
      .from("restaurants") as ReturnType<typeof supabase.from>)
      .select("cover_image")
      .eq("id", restaurantId)
      .single() as { data: { cover_image: string | null } | null };
    resolvedImageUrl = resto?.cover_image ?? null;
  }

  if (!resolvedImageUrl) {
    throw new Error("Une image est requise (ajoutez-en une ou configurez la photo de couverture du restaurant).");
  }

  const { data: subscribers, error } = await (supabase
    .from("whatsapp_subscribers") as ReturnType<typeof supabase.from>)
    .select("phone")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true) as { data: { phone: string }[] | null; error: unknown };

  if (error || !subscribers || subscribers.length === 0) {
    return 0;
  }

  const apiUrl = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

  const results = await Promise.allSettled(
    subscribers.map(({ phone }) =>
      sendMetaMessage({ apiUrl, token, to: phone, restaurantName, message, imageUrl: resolvedImageUrl, templateName })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  if (failed > 0) {
    console.error(`WhatsApp broadcast: ${failed}/${results.length} failed for restaurant ${restaurantId}`);
  }

  return sent;
}

async function sendMetaMessage({
  apiUrl,
  token,
  to,
  restaurantName,
  message,
  imageUrl,
  templateName,
}: {
  apiUrl: string;
  token: string;
  to: string;
  restaurantName: string;
  message: string;
  imageUrl?: string | null;
  templateName: string;
}): Promise<void> {
  // Strip non-digits and leading + for Meta API format
  const toClean = to.replace(/[^0-9]/g, "");

  const body = buildTemplatePayload({ to: toClean, restaurantName, message, imageUrl, templateName });

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meta API error ${res.status}: ${text}`);
  }
}

function buildTemplatePayload({
  to,
  restaurantName,
  message,
  imageUrl,
  templateName,
}: {
  to: string;
  restaurantName: string;
  message: string;
  imageUrl?: string | null;
  templateName: string;
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
  const sanitizedMessage = message.replace(/[\r\n\t]/g, " ").replace(/ {5,}/g, "    ").slice(0, 1024);
  components.push({
    type: "body",
    parameters: [
      { type: "text", text: restaurantName },
      { type: "text", text: sanitizedMessage },
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
