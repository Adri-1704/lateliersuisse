"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import {
  claimApprovedNotification,
  claimRejectedNotification,
} from "@/lib/email-templates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClaimRequestWithDetails {
  id: string;
  restaurant_id: string;
  merchant_id: string;
  method: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  restaurant_name: string;
  restaurant_city: string;
  restaurant_slug: string;
  merchant_name: string;
  merchant_email: string;
  merchant_phone: string | null;
}

// ---------------------------------------------------------------------------
// listClaimRequests
// ---------------------------------------------------------------------------

export async function listClaimRequests(params?: {
  status?: string;
}): Promise<{
  success: boolean;
  error: string | null;
  data?: ClaimRequestWithDetails[];
}> {
  try {
    const supabase = createAdminClient();
    const statusFilter = params?.status || "pending";

    // We need to join claim_requests with restaurants and merchants
    // Supabase JS client supports foreign key joins
    let query = (supabase.from("claim_requests") as ReturnType<typeof supabase.from>)
      .select(`
        id,
        restaurant_id,
        merchant_id,
        method,
        status,
        admin_notes,
        created_at,
        resolved_at,
        restaurants!inner(name_fr, city, slug),
        merchants!inner(name, email, phone)
      `)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped: ClaimRequestWithDetails[] = (data || []).map((row: any) => ({
      id: row.id,
      restaurant_id: row.restaurant_id,
      merchant_id: row.merchant_id,
      method: row.method,
      status: row.status,
      admin_notes: row.admin_notes,
      created_at: row.created_at,
      resolved_at: row.resolved_at,
      restaurant_name: row.restaurants?.name_fr || "—",
      restaurant_city: row.restaurants?.city || "—",
      restaurant_slug: row.restaurants?.slug || "",
      merchant_name: row.merchants?.name || "—",
      merchant_email: row.merchants?.email || "—",
      merchant_phone: row.merchants?.phone || null,
    }));

    return { success: true, error: null, data: mapped };
  } catch (err) {
    console.error("listClaimRequests error:", err);
    return { success: false, error: "Impossible de charger les demandes de claim" };
  }
}

// ---------------------------------------------------------------------------
// getClaimRequest (single)
// ---------------------------------------------------------------------------

export async function getClaimRequest(id: string): Promise<{
  success: boolean;
  error: string | null;
  data?: ClaimRequestWithDetails;
}> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await (supabase.from("claim_requests") as ReturnType<typeof supabase.from>)
      .select(`
        id,
        restaurant_id,
        merchant_id,
        method,
        status,
        admin_notes,
        created_at,
        resolved_at,
        restaurants!inner(name_fr, city, slug),
        merchants!inner(name, email, phone)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any;
    const mapped: ClaimRequestWithDetails = {
      id: row.id,
      restaurant_id: row.restaurant_id,
      merchant_id: row.merchant_id,
      method: row.method,
      status: row.status,
      admin_notes: row.admin_notes,
      created_at: row.created_at,
      resolved_at: row.resolved_at,
      restaurant_name: row.restaurants?.name_fr || "—",
      restaurant_city: row.restaurants?.city || "—",
      restaurant_slug: row.restaurants?.slug || "",
      merchant_name: row.merchants?.name || "—",
      merchant_email: row.merchants?.email || "—",
      merchant_phone: row.merchants?.phone || null,
    };

    return { success: true, error: null, data: mapped };
  } catch (err) {
    console.error("getClaimRequest error:", err);
    return { success: false, error: "Demande de claim non trouvée" };
  }
}

// ---------------------------------------------------------------------------
// approveClaim
// ---------------------------------------------------------------------------

export async function approveClaim(
  claimId: string,
  adminNotes?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();

    // 1. Get the claim request
    const { data: claim, error: claimError } = await (supabase
      .from("claim_requests") as ReturnType<typeof supabase.from>)
      .select("id, restaurant_id, merchant_id, status")
      .eq("id", claimId)
      .single();

    if (claimError || !claim) {
      return { success: false, error: "Demande de claim non trouvée" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const claimData = claim as any;

    if (claimData.status !== "pending") {
      return { success: false, error: "Cette demande a déjà été traitée" };
    }

    // 2. Link restaurant to merchant
    await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
      .update({
        merchant_id: claimData.merchant_id,
        claimed_at: new Date().toISOString(),
        claim_status: "claimed",
      } as Record<string, unknown>)
      .eq("id", claimData.restaurant_id);

    // 3. Update claim request
    await (supabase.from("claim_requests") as ReturnType<typeof supabase.from>)
      .update({
        status: "approved",
        resolved_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      } as Record<string, unknown>)
      .eq("id", claimId);

    // 4. Get merchant info for email
    const { data: merchant } = await supabase
      .from("merchants")
      .select("name, email")
      .eq("id", claimData.merchant_id)
      .single() as { data: { name: string; email: string } | null; error: unknown };

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("name_fr")
      .eq("id", claimData.restaurant_id)
      .single() as { data: { name_fr: string } | null; error: unknown };

    // 5. Send approval email to merchant
    if (merchant?.email) {
      try {
        const template = claimApprovedNotification({
          merchantName: merchant.name,
          restaurantName: restaurant?.name_fr || "votre restaurant",
        });
        await sendEmail({
          to: merchant.email,
          subject: template.subject,
          html: template.html,
        });
      } catch (emailErr) {
        console.error("Failed to send claim approval email:", emailErr);
      }
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("approveClaim error:", err);
    return { success: false, error: "Erreur lors de l'approbation" };
  }
}

// ---------------------------------------------------------------------------
// rejectClaim
// ---------------------------------------------------------------------------

export async function rejectClaim(
  claimId: string,
  adminNotes: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();

    // 1. Get the claim request
    const { data: claim, error: claimError } = await (supabase
      .from("claim_requests") as ReturnType<typeof supabase.from>)
      .select("id, restaurant_id, merchant_id, status")
      .eq("id", claimId)
      .single();

    if (claimError || !claim) {
      return { success: false, error: "Demande de claim non trouvée" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const claimData = claim as any;

    if (claimData.status !== "pending") {
      return { success: false, error: "Cette demande a déjà été traitée" };
    }

    // 2. Update claim request
    await (supabase.from("claim_requests") as ReturnType<typeof supabase.from>)
      .update({
        status: "rejected",
        resolved_at: new Date().toISOString(),
        admin_notes: adminNotes,
      } as Record<string, unknown>)
      .eq("id", claimId);

    // 3. Release the restaurant (reset claim_status to unclaimed)
    await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
      .update({
        claim_status: "unclaimed",
      } as Record<string, unknown>)
      .eq("id", claimData.restaurant_id);

    // 4. Get merchant info for email
    const { data: merchant } = await supabase
      .from("merchants")
      .select("name, email")
      .eq("id", claimData.merchant_id)
      .single() as { data: { name: string; email: string } | null; error: unknown };

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("name_fr")
      .eq("id", claimData.restaurant_id)
      .single() as { data: { name_fr: string } | null; error: unknown };

    // 5. Send rejection email to merchant
    if (merchant?.email) {
      try {
        const template = claimRejectedNotification({
          merchantName: merchant.name,
          restaurantName: restaurant?.name_fr || "votre restaurant",
        });
        await sendEmail({
          to: merchant.email,
          subject: template.subject,
          html: template.html,
        });
      } catch (emailErr) {
        console.error("Failed to send claim rejection email:", emailErr);
      }
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("rejectClaim error:", err);
    return { success: false, error: "Erreur lors du rejet" };
  }
}
