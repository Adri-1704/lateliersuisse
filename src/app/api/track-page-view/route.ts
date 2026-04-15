import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

// Classifie le type de page à partir du pathname (pour agrégations rapides côté admin)
function classifyPath(pathname: string): { page_type: string; locale: string | null; canton: string | null } {
  // Enlève le préfixe locale si présent
  const locales = ["fr", "de", "en", "pt", "es"];
  const parts = pathname.split("/").filter(Boolean);
  const locale = parts[0] && locales.includes(parts[0]) ? parts[0] : null;
  const rest = locale ? parts.slice(1) : parts;

  if (rest.length === 0) return { page_type: "home", locale, canton: null };

  const [first, second, third] = rest;

  if (first === "restaurants" && second === "canton" && third) {
    return { page_type: "canton", locale, canton: third };
  }
  if (first === "restaurants" && second) {
    return { page_type: "restaurant", locale, canton: null };
  }
  if (first === "restaurants") {
    return { page_type: "listing", locale, canton: null };
  }
  if (first === "collections" && second) {
    return { page_type: "collection_detail", locale, canton: null };
  }
  if (first === "collections") {
    return { page_type: "collections", locale, canton: null };
  }
  if (first === "pour-restaurateurs") return { page_type: "b2b", locale, canton: null };
  if (first === "parrainage") return { page_type: "referral", locale, canton: null };
  if (first === "a-propos") return { page_type: "about", locale, canton: null };
  if (first === "contact") return { page_type: "contact", locale, canton: null };
  if (first === "faq") return { page_type: "faq", locale, canton: null };

  return { page_type: "other", locale, canton: null };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, restaurantId, sessionId, referrer } = body || {};

    if (!path || typeof path !== "string" || path.length > 500) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Skip admin paths (on ne track pas l'admin)
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true, skipped: "admin" });
    }

    const { page_type, locale, canton } = classifyPath(path);

    // Privacy : hash l'IP, jamais brute
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const ipHash = crypto
      .createHash("sha256")
      .update(ip + "just-tag-salt")
      .digest("hex")
      .slice(0, 16);

    const userAgent = request.headers.get("user-agent")?.slice(0, 200) || null;
    const country = request.headers.get("x-vercel-ip-country") || null;

    const supabase = createAdminClient();

    // Resolve restaurant_id from slug if restaurant detail page and no id provided
    let resolvedRestaurantId: string | null = restaurantId || null;
    if (!resolvedRestaurantId && page_type === "restaurant") {
      const locales = ["fr", "de", "en", "pt", "es"];
      const parts = path.split("/").filter(Boolean);
      const slugIdx = locales.includes(parts[0]) ? 2 : 1;
      const slug = parts[slugIdx];
      if (slug && slug.length < 200) {
        const { data: rest } = await supabase
          .from("restaurants")
          .select("id")
          .eq("slug", slug)
          .maybeSingle() as { data: { id: string } | null; error: unknown };
        if (rest?.id) resolvedRestaurantId = rest.id;
      }
    }

    await (supabase.from("page_views") as ReturnType<typeof supabase.from>).insert({
      path: path.slice(0, 500),
      locale,
      page_type,
      restaurant_id: resolvedRestaurantId,
      canton,
      referrer: referrer ? String(referrer).slice(0, 500) : null,
      country,
      ip_hash: ipHash,
      user_agent: userAgent,
      session_id: sessionId ? String(sessionId).slice(0, 64) : null,
    } as Record<string, unknown>);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Track page view error:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
