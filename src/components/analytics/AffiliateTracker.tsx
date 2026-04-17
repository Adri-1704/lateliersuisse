"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Captures ?ref=xxx from URL and stores it in a cookie (30 days).
 * When a restaurant subscribes via Stripe, the ref code is attached to the checkout metadata.
 */
export function AffiliateTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.length >= 2 && ref.length <= 50) {
      // Store in cookie for 30 days
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `jt_ref=${encodeURIComponent(ref)};path=/;expires=${expires};SameSite=Lax`;
    }
  }, [searchParams]);

  return null;
}

/**
 * Helper: read the affiliate ref code from cookie (used server-side or client-side).
 */
export function getAffiliateRef(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/jt_ref=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
