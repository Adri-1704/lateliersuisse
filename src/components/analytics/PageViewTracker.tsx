"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Tracks page views into Supabase `page_views` table.
 * Anti-bot: waits 2 seconds before sending (bots leave in <500ms).
 * Anti-duplicate: tracks sent paths to avoid double-counting on re-renders.
 * Privacy: no raw IP or PII, just anonymous session id per tab.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const sentPaths = useRef(new Set<string>());

  useEffect(() => {
    // Skip admin/api paths
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // Skip if admin is logged in
    if (document.cookie.includes("jt_admin=1")) return;

    // Skip if already sent for this path in this session (avoid re-render duplicates)
    const pageKey = `${pathname}_${Date.now().toString(36).slice(0, 4)}`;
    if (sentPaths.current.has(pathname)) return;

    // Wait 2 seconds — real humans stay on the page, bots leave immediately
    const timer = setTimeout(() => {
      // Double-check page is still visible (user didn't navigate away)
      if (document.hidden) return;

      // Generate or reuse anonymous session id (per tab)
      let sessionId = sessionStorage.getItem("jt_session_id");
      if (!sessionId) {
        sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem("jt_session_id", sessionId);
      }

      const referrer = document.referrer && !document.referrer.includes(window.location.host)
        ? document.referrer
        : null;

      sentPaths.current.add(pathname);

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
        // Silent fail
        sentPaths.current.delete(pathname);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
