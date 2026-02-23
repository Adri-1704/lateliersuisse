import { Resend } from "resend";

/**
 * Email sending utility using Resend.
 * Gracefully degrades when RESEND_API_KEY is not configured.
 */
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  error?: string;
}

export async function sendEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  if (!resend) {
    console.warn(
      `[Email] RESEND_API_KEY not configured. Skipping email to: ${params.to} — Subject: "${params.subject}"`
    );
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Just-Tag <noreply@just-tag.ch>",
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[Email] Send failed:", err);
    return { success: false, error: "Email send failed" };
  }
}
