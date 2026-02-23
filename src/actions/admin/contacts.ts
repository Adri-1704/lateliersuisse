"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { ContactSubmission } from "@/lib/supabase/types";

const mockContacts: ContactSubmission[] = [
  { id: "c1", first_name: "Jean", last_name: "Dupont", email: "jean@example.com", subject: "Question sur la plateforme", message: "Bonjour, je voudrais en savoir plus sur vos services.", is_read: false, created_at: "2026-02-21T10:00:00Z" },
  { id: "c2", first_name: "Marie", last_name: "Curie", email: "marie@example.com", subject: "Suggestion", message: "Ce serait bien d'ajouter un filtre par prix.", is_read: true, created_at: "2026-02-19T14:30:00Z" },
  { id: "c3", first_name: "Pierre", last_name: "Martin", email: "pierre@example.com", subject: null, message: "Comment puis-je modifier mon avis ?", is_read: false, created_at: "2026-02-17T09:00:00Z" },
];

export async function listContacts(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ success: boolean; error: string | null; data?: { contacts: ContactSubmission[]; total: number } }> {
  const { page = 1, limit = 20, search } = params;

  try {
    const supabase = createAdminClient();
    let query = supabase.from("contact_submissions").select("*", { count: "exact" });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return { success: true, error: null, data: { contacts: data || [], total: count || 0 } };
  } catch {
    let filtered = [...mockContacts];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((c) => c.first_name.toLowerCase().includes(s) || c.last_name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s));
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { success: true, error: null, data: { contacts: paged, total } };
  }
}

export async function markContactAsRead(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("contact_submissions").update({ is_read: true }).eq("id", id);
    if (error) throw error;
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Impossible de marquer comme lu (mode demo)" };
  }
}
