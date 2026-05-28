import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DraftRow = { id: string; slug: string; title: string };

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: draft, error: selectErr } = (await supabase
    .from("blog_posts")
    .select("id, slug, title")
    .eq("site", "just-tag")
    .eq("is_published", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()) as { data: DraftRow | null; error: { message: string } | null };

  if (selectErr) {
    return NextResponse.json({ error: selectErr.message }, { status: 500 });
  }
  if (!draft) {
    return NextResponse.json({ ok: true, published: null, message: "No draft to publish" });
  }

  const now = new Date().toISOString();
  const { error: updateErr } = await (
    supabase.from("blog_posts") as ReturnType<typeof supabase.from>
  )
    .update({ is_published: true, published_at: now, updated_at: now } as Record<string, unknown>)
    .eq("id", draft.id)
    .eq("site", "just-tag");

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    published: { id: draft.id, slug: draft.slug, title: draft.title, published_at: now },
  });
}
