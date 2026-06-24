/**
 * WhatsApp broadcast via Twilio REST API.
 *
 * Sends a message to all active subscribers of a restaurant.
 * Returns the number of successfully sent messages.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM  — e.g. "whatsapp:+14155238886" (Twilio sandbox)
 *                           or your approved WhatsApp Business number
 *
 * Production note: Meta requires approved message templates for business-initiated
 * messages outside a 24h session window. Configure templates in Twilio Console and
 * use twilio.messages.create({ contentSid: "...", ... }) instead of Body.
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
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!twilioSid || !twilioAuth || !fromNumber) {
    console.warn("WhatsApp broadcast skipped: missing Twilio env vars");
    return 0;
  }

  const supabase = createAdminClient();

  // Fetch active subscribers for this restaurant
  const { data: subscribers, error } = await (supabase
    .from("whatsapp_subscribers") as ReturnType<typeof supabase.from>)
    .select("phone")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true) as { data: { phone: string }[] | null; error: unknown };

  if (error || !subscribers || subscribers.length === 0) {
    return 0;
  }

  const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");
  const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

  const broadcastMessage = formatBroadcastMessage(restaurantName, message);

  // Send to all subscribers in parallel, tolerating individual failures
  const results = await Promise.allSettled(
    subscribers.map(({ phone }) =>
      sendSingleMessage({ apiUrl, auth, from: fromNumber, to: `whatsapp:${phone}`, body: broadcastMessage, mediaUrl: imageUrl ?? undefined })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  if (failed > 0) {
    console.error(`WhatsApp broadcast: ${failed}/${results.length} messages failed for restaurant ${restaurantId}`);
  }

  return sent;
}

function formatBroadcastMessage(restaurantName: string, message: string): string {
  return `🍽️ *${restaurantName}*\n\n${message}\n\n_Répondre STOP pour se désabonner_`;
}

async function sendSingleMessage({
  apiUrl,
  auth,
  from,
  to,
  body,
  mediaUrl,
}: {
  apiUrl: string;
  auth: string;
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
}): Promise<void> {
  const params = new URLSearchParams({ From: from, To: to, Body: body });
  if (mediaUrl) {
    params.append("MediaUrl", mediaUrl);
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio error ${res.status}: ${text}`);
  }
}
