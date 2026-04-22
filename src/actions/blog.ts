"use server";

import { createAdminClient } from "@/lib/supabase/server";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  tags: string[];
  author: string;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Public queries
// ---------------------------------------------------------------------------

export async function getPublishedPosts(limit = 20, offset = 0): Promise<{ posts: BlogPost[]; total: number }> {
  const supabase = createAdminClient();
  const { data, count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("site", "just-tag")
    .eq("is_published", true)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1) as { data: BlogPost[] | null; count: number | null };
  return { posts: data || [], total: count ?? 0 };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("site", "just-tag")
    .eq("is_published", true)
    .single() as { data: BlogPost | null };
  return data;
}

// ---------------------------------------------------------------------------
// Admin CRUD
// ---------------------------------------------------------------------------

export async function getAllPosts(): Promise<BlogPost[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("site", "just-tag")
    .order("created_at", { ascending: false }) as { data: BlogPost[] | null };
  return data || [];
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .eq("site", "just-tag")
    .single() as { data: BlogPost | null };
  return data;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);
}

export async function createPost(formData: FormData): Promise<{ success: boolean; error?: string; id?: string }> {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string | null;
  const cover_image = formData.get("cover_image") as string | null;
  const category = formData.get("category") as string | null;
  const tagsRaw = formData.get("tags") as string | null;
  const meta_title = formData.get("meta_title") as string | null;
  const meta_description = formData.get("meta_description") as string | null;
  const is_published = formData.get("is_published") === "on";

  if (!title || !content) return { success: false, error: "Titre et contenu requis" };

  const slug = generateSlug(title);
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("blog_posts") as ReturnType<typeof supabase.from>)
    .insert({
      slug,
      title,
      content,
      excerpt: excerpt || null,
      cover_image: cover_image || null,
      category: category || null,
      tags,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      is_published,
      site: "just-tag",
      published_at: is_published ? new Date().toISOString() : null,
    } as Record<string, unknown>)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, id: (data as Record<string, unknown>)?.id as string };
}

export async function updatePost(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string | null;
  const cover_image = formData.get("cover_image") as string | null;
  const category = formData.get("category") as string | null;
  const tagsRaw = formData.get("tags") as string | null;
  const meta_title = formData.get("meta_title") as string | null;
  const meta_description = formData.get("meta_description") as string | null;
  const is_published = formData.get("is_published") === "on";

  if (!title || !content) return { success: false, error: "Titre et contenu requis" };

  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const supabase = createAdminClient();

  // Check current publish state to set published_at on first publish
  const { data: current } = await supabase.from("blog_posts").select("is_published, published_at").eq("id", id).eq("site", "just-tag").single() as { data: { is_published: boolean; published_at: string | null } | null };
  const published_at = is_published && !current?.published_at ? new Date().toISOString() : current?.published_at || null;

  const { error } = await (supabase.from("blog_posts") as ReturnType<typeof supabase.from>)
    .update({
      title,
      content,
      excerpt: excerpt || null,
      cover_image: cover_image || null,
      category: category || null,
      tags,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      is_published,
      published_at,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq("id", id)
    .eq("site", "just-tag");

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deletePost(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id)
    .eq("site", "just-tag");
  if (error) return { success: false, error: error.message };
  return { success: true };
}
