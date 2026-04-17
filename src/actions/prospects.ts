"use server";

import { createAdminClient } from "@/lib/supabase/server";

export interface Prospect {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  website: string | null;
  city: string | null;
  canton: string | null;
  type: string;
  source: string;
  status: string;
  priority: string;
  notes: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  follow_up_action: string | null;
  restaurant_id: string | null;
  affiliate_ref: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProspects(filters?: {
  status?: string;
  type?: string;
  priority?: string;
}): Promise<Prospect[]> {
  const supabase = createAdminClient();
  let query = supabase.from("prospects").select("*").order("next_follow_up_at", { ascending: true, nullsFirst: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.priority) query = query.eq("priority", filters.priority);

  const { data } = await query as { data: Prospect[] | null };
  return data || [];
}

export async function getTodayFollowUps(): Promise<Prospect[]> {
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const { data } = await supabase
    .from("prospects")
    .select("*")
    .lte("next_follow_up_at", today.toISOString())
    .not("status", "in", '("paying","lost")')
    .order("priority", { ascending: true })
    .order("next_follow_up_at", { ascending: true }) as { data: Prospect[] | null };

  return data || [];
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("prospects").select("*").eq("id", id).single() as { data: Prospect | null };
  return data;
}

export async function createProspect(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const nextFollowUp = formData.get("next_follow_up_at") as string;
  const lastContact = formData.get("last_contact_at") as string;

  const { error } = await (supabase.from("prospects") as ReturnType<typeof supabase.from>).insert({
    name: formData.get("name") as string,
    contact_name: formData.get("contact_name") as string || null,
    email: formData.get("email") as string || null,
    phone: formData.get("phone") as string || null,
    instagram: formData.get("instagram") as string || null,
    website: formData.get("website") as string || null,
    city: formData.get("city") as string || null,
    canton: formData.get("canton") as string || null,
    type: formData.get("type") as string || "restaurant",
    source: formData.get("source") as string || "manual",
    status: formData.get("status") as string || "new",
    priority: formData.get("priority") as string || "normal",
    notes: formData.get("notes") as string || null,
    last_contact_at: lastContact || null,
    next_follow_up_at: nextFollowUp || null,
    follow_up_action: formData.get("follow_up_action") as string || null,
  } as Record<string, unknown>);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateProspect(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const nextFollowUp = formData.get("next_follow_up_at") as string;
  const lastContact = formData.get("last_contact_at") as string;

  const { error } = await (supabase.from("prospects") as ReturnType<typeof supabase.from>)
    .update({
      name: formData.get("name") as string,
      contact_name: formData.get("contact_name") as string || null,
      email: formData.get("email") as string || null,
      phone: formData.get("phone") as string || null,
      instagram: formData.get("instagram") as string || null,
      website: formData.get("website") as string || null,
      city: formData.get("city") as string || null,
      canton: formData.get("canton") as string || null,
      type: formData.get("type") as string,
      source: formData.get("source") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      notes: formData.get("notes") as string || null,
      last_contact_at: lastContact || null,
      next_follow_up_at: nextFollowUp || null,
      follow_up_action: formData.get("follow_up_action") as string || null,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateProspectStatus(id: string, status: string): Promise<{ success: boolean }> {
  const supabase = createAdminClient();
  await (supabase.from("prospects") as ReturnType<typeof supabase.from>)
    .update({ status, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq("id", id);
  return { success: true };
}

export async function deleteProspect(id: string): Promise<{ success: boolean }> {
  const supabase = createAdminClient();
  await supabase.from("prospects").delete().eq("id", id);
  return { success: true };
}

export async function getPipelineStats(): Promise<Record<string, number>> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("prospects").select("status") as { data: { status: string }[] | null };
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.status] = (counts[row.status] || 0) + 1;
  }
  return counts;
}
