"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { B2BContactRequest, B2BContactStatus } from "@/lib/supabase/types";

const mockB2BRequests: B2BContactRequest[] = [
  { id: "1", first_name: "Marco", last_name: "Bernasconi", email: "marco@trattoria.ch", phone: "+41 91 123 45 67", restaurant_name: "Trattoria da Marco", city: "Lugano", message: "Nous aimerions rejoindre votre plateforme.", status: "new", locale: "fr", notes: null, created_at: "2026-02-20T10:00:00Z" },
  { id: "2", first_name: "Sophie", last_name: "Mueller", email: "sophie@gasthof.ch", phone: "+41 31 234 56 78", restaurant_name: "Gasthof zum Baeren", city: "Bern", message: null, status: "contacted", locale: "de", notes: null, created_at: "2026-02-18T14:30:00Z" },
  { id: "3", first_name: "Antoine", last_name: "Girard", email: "antoine@lecomptoir.ch", phone: "+41 21 345 67 89", restaurant_name: "Le Comptoir du Lac", city: "Lausanne", message: "Interesse par le plan annuel.", status: "new", locale: "fr", notes: null, created_at: "2026-02-15T09:00:00Z" },
  { id: "4", first_name: "Hans", last_name: "Weber", email: "hans@alpenstube.ch", phone: "+41 44 456 78 90", restaurant_name: "Alpenstube", city: "Zurich", message: "Comment fonctionne le badge verifie ?", status: "new", locale: "de", notes: null, created_at: "2026-02-14T16:45:00Z" },
  { id: "5", first_name: "Claire", last_name: "Dupont", email: "claire@labrasserie.ch", phone: null, restaurant_name: "La Brasserie", city: "Geneve", message: null, status: "converted", locale: "fr", notes: null, created_at: "2026-02-10T11:20:00Z" },
];

export async function listB2BRequests(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<{ success: boolean; error: string | null; data?: { requests: B2BContactRequest[]; total: number } }> {
  const { page = 1, limit = 20, search, status } = params;

  try {
    const supabase = createAdminClient();
    let query = supabase.from("b2b_contact_requests").select("*", { count: "exact" });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,restaurant_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status && status !== "all") query = query.eq("status", status);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return { success: true, error: null, data: { requests: data || [], total: count || 0 } };
  } catch {
    let filtered = [...mockB2BRequests];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.first_name.toLowerCase().includes(s) ||
          r.last_name.toLowerCase().includes(s) ||
          r.restaurant_name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s)
      );
    }
    if (status && status !== "all") filtered = filtered.filter((r) => r.status === status);

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { success: true, error: null, data: { requests: paged, total } };
  }
}

export async function updateB2BRequestStatus(
  id: string,
  newStatus: B2BContactStatus
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("b2b_contact_requests").update({ status: newStatus }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/b2b-requests");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Impossible de mettre a jour le statut (mode demo)" };
  }
}
