import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/actions/admin/auth";

// Cet endpoint est appelé depuis le bouton "Publier" du dashboard admin
// (fetch authentifié par cookie de session), pas par un job cron — on
// vérifie donc la session admin plutôt que CRON_SECRET (contrairement à
// /api/blog/publish-next qui, lui, est appelé par un cron externe).
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await (supabase.from("blog_posts") as ReturnType<typeof supabase.from>)
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq("id", id)
      .eq("site", "just-tag");

    if (error) return NextResponse.json({ error: "Publication failed" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
