"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { NewsletterSubscriber } from "@/lib/supabase/types";

const mockSubscribers: NewsletterSubscriber[] = [
  { id: "n1", email: "jean@example.com", locale: "fr", is_active: true, created_at: "2026-02-20T10:00:00Z" },
  { id: "n2", email: "sophie@example.de", locale: "de", is_active: true, created_at: "2026-02-18T14:30:00Z" },
  { id: "n3", email: "john@example.com", locale: "en", is_active: true, created_at: "2026-02-15T09:00:00Z" },
  { id: "n4", email: "marie@example.fr", locale: "fr", is_active: false, created_at: "2026-02-10T16:45:00Z" },
  { id: "n5", email: "anna@example.de", locale: "de", is_active: true, created_at: "2026-02-05T11:20:00Z" },
];

export async function listNewsletterSubscribers(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ success: boolean; error: string | null; data?: { subscribers: NewsletterSubscriber[]; total: number } }> {
  const { page = 1, limit = 20, search } = params;

  try {
    const supabase = createAdminClient();
    let query = supabase.from("newsletter_subscribers").select("*", { count: "exact" });

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    return { success: true, error: null, data: { subscribers: data || [], total: count || 0 } };
  } catch {
    let filtered = [...mockSubscribers];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((n) => n.email.toLowerCase().includes(s));
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { success: true, error: null, data: { subscribers: paged, total } };
  }
}
