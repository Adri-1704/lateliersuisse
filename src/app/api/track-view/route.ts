import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, source } = await request.json();

    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Hash the IP for privacy (GDPR compliant - we never store the raw IP)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const ipHash = crypto.createHash("sha256").update(ip + "just-tag-salt").digest("hex").slice(0, 16);

    const userAgent = request.headers.get("user-agent")?.slice(0, 200) || null;

    await (supabase.from("restaurant_views") as ReturnType<typeof supabase.from>).insert({
      restaurant_id: restaurantId,
      source: source || null,
      user_agent: userAgent,
      ip_hash: ipHash,
    } as Record<string, unknown>);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Track view error:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
