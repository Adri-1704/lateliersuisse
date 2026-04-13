/**
 * Admin authorization helpers.
 *
 * An authenticated user is considered an admin if:
 *   1. Their email is in the ADMIN_EMAILS environment variable (comma-separated list), OR
 *   2. They have `is_admin = true` in the `profiles` table (future-proof, requires migration).
 *
 * The ADMIN_EMAILS env var acts as a bootstrap mechanism so Adrien can access the admin
 * panel immediately without needing a DB migration.
 */

import { createAdminClient } from "@/lib/supabase/server";

/**
 * Parse the ADMIN_EMAILS env var into a Set of lowercase emails.
 */
function getAdminEmailWhitelist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || "";
  if (!raw.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Check if a user email is in the admin whitelist.
 */
export function isEmailInAdminWhitelist(email: string): boolean {
  const whitelist = getAdminEmailWhitelist();
  return whitelist.has(email.toLowerCase());
}

/**
 * Check if a user has is_admin = true in the profiles table.
 * Returns false if the table/column doesn't exist yet (graceful fallback).
 */
async function isAdminInProfiles(userId: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles" as string)
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (error || !data) return false;
    return (data as Record<string, unknown>).is_admin === true;
  } catch {
    // Table or column may not exist yet — graceful fallback
    return false;
  }
}

/**
 * Determine if a Supabase auth user is an admin.
 * Checks whitelist first (fast, no DB call), then profiles table.
 */
export async function isAdminUser(userId: string, email: string): Promise<boolean> {
  // 1. Check email whitelist (env var — instant, no DB)
  if (isEmailInAdminWhitelist(email)) return true;

  // 2. Check profiles.is_admin (DB — future-proof)
  return isAdminInProfiles(userId);
}
