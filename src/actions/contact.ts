"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import {
  contactAdminNotification,
  contactConfirmation,
} from "@/lib/email-templates";

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  subject?: string;
  message: string;
  locale: string;
}

interface ContactResult {
  success: boolean;
  error: string | null;
}

/**
 * Submit a contact form message.
 * Stores in Supabase and sends notification emails.
 */
export async function submitContactForm(
  data: ContactData
): Promise<ContactResult> {
  // Validation
  if (!data.firstName || !data.lastName || !data.email || !data.message) {
    return { success: false, error: "Missing required fields" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, error: "Invalid email address" };
  }

  try {
    // Insert into Supabase
    try {
      const supabase = createAdminClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("contact_submissions") as any).insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
      });

      if (error) {
        console.error("Contact insert error:", error);
      }
    } catch {
      console.log("Contact submission (fallback):", {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });
    }

    // Send notification emails
    const adminEmailAddress = process.env.ADMIN_EMAIL || "admin@just-tag.ch";

    const adminTemplate = contactAdminNotification(data);
    await sendEmail({
      to: adminEmailAddress,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      replyTo: data.email,
    });

    const userTemplate = contactConfirmation(data, data.locale);
    await sendEmail({
      to: data.email,
      subject: userTemplate.subject,
      html: userTemplate.html,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Contact submission error:", error);
    return { success: false, error: "Server error" };
  }
}
