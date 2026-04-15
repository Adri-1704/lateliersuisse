"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tracks every page view into Supabase `page_views` table.
 * Non-blocking : fires after hydration, silently fails if API down.
 * Privacy : no raw IP or PII, just anonymous session id per tab.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin paths
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // Generate or reuse anonymous session id (per tab)
    let sessionId = sessionStorage.getItem("jt_session_id");
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("jt_session_id", sessionId);
    }

    const referrer = document.referrer && !document.referrer.includes(window.location.host)
      ? document.referrer
      : null;

    // Fire and forget (keepalive ensures it completes even if user navigates away)
    fetch("/api/track-page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        path: pathname,
        sessionId,
        referrer,
      }),
    }).catch(() => {
      // Silent fail — tracking ne doit jamais casser l'UX
    });
  }, [pathname]);

  return null;
}
