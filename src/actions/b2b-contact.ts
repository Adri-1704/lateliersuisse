"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import {
  b2bAdminNotification,
  b2bConfirmation,
} from "@/lib/email-templates";

interface B2BContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  restaurantName: string;
  city: string;
  message?: string;
  locale: string;
}

interface B2BContactResult {
  success: boolean;
  error: string | null;
}

/**
 * Submit a B2B contact request from a restaurant owner.
 * Stores the request in Supabase and sends notification emails.
 */
export async function submitB2BContactRequest(
  data: B2BContactData
): Promise<B2BContactResult> {
  // Basic validation
  if (
    !data.firstName ||
    !data.lastName ||
    !data.email ||
    !data.restaurantName ||
    !data.city
  ) {
    return { success: false, error: "Missing required fields" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, error: "Invalid email address" };
  }

  try {
    // Store in Supabase (with fallback if not configured)
    try {
      const supabase = createAdminClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("b2b_contact_requests") as any).insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || null,
        restaurant_name: data.restaurantName,
        city: data.city,
        message: data.message || null,
        locale: data.locale,
      });

      if (error) {
        console.error("B2B contact insert error:", error);
      }
    } catch {
      // Fallback: Supabase not configured
      console.log("B2B Contact Request (fallback):", {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        restaurant: data.restaurantName,
        city: data.city,
        message: data.message,
        locale: data.locale,
      });
    }

    // Send notification emails (non-blocking: errors don't fail the request)
    const adminEmailAddress = process.env.ADMIN_EMAIL || "admin@just-tag.ch";

    const adminTemplate = b2bAdminNotification(data);
    await sendEmail({
      to: adminEmailAddress,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      replyTo: data.email,
    });

    const confirmTemplate = b2bConfirmation(data, data.locale);
    await sendEmail({
      to: data.email,
      subject: confirmTemplate.subject,
      html: confirmTemplate.html,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("B2B contact submission error:", error);
    return { success: false, error: "Server error" };
  }
}
