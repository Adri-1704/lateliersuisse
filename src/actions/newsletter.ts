"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { newsletterWelcome } from "@/lib/email-templates";

interface NewsletterResult {
  success: boolean;
  error: string | null;
}

/**
 * Subscribe an email to the newsletter.
 * Upserts into Supabase and sends a welcome email.
 */
export async function subscribeToNewsletter(
  email: string,
  locale: string
): Promise<NewsletterResult> {
  // Validate
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, error: "Invalid email address" };
  }

  try {
    // Insert into Supabase (upsert to handle duplicates)
    try {
      const supabase = createAdminClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("newsletter_subscribers") as any)
        .upsert({ email, locale, is_active: true }, { onConflict: "email" });

      if (error) {
        console.error("Newsletter insert error:", error);
      }
    } catch {
      console.log("Newsletter subscription (fallback):", email, locale);
    }

    // Send welcome email
    const template = newsletterWelcome(email, locale);
    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, error: "Server error" };
  }
}
