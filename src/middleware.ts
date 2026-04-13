import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Parse the ADMIN_EMAILS env var into a Set of lowercase emails.
 * Duplicated here because middleware runs at the Edge and cannot import
 * from lib/admin.ts which may use Node-only APIs (createAdminClient).
 */
function getAdminEmailWhitelist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || "";
  if (!raw.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes - handle auth protection
  if (pathname.startsWith("/admin")) {
    // Login page is public
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // If Supabase is not configured, allow access (dev/demo mode)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.next();
    }

    // Check Supabase auth session
    const response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // ── Admin role check (C1 fix) ──
    // At the Edge we can only check the email whitelist.
    // The Server Component layout performs a deeper check (profiles.is_admin).
    const adminEmails = getAdminEmailWhitelist();
    const userEmail = (user.email || "").toLowerCase();

    if (adminEmails.size > 0 && !adminEmails.has(userEmail)) {
      // User is authenticated but not an admin — redirect to homepage
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  // Espace client routes - handle merchant auth protection
  // Match /XX/espace-client where XX is a locale prefix
  const espaceClientMatch = pathname.match(/^\/([a-z]{2})\/espace-client/);
  if (espaceClientMatch) {
    const locale = espaceClientMatch[1];
    // Connexion and password reset pages are public
    if (
      pathname.endsWith("/espace-client/connexion") ||
      pathname.endsWith("/espace-client/mot-de-passe-oublie")
    ) {
      return intlMiddleware(request);
    }

    // If Supabase is not configured, allow access (dev/demo mode)
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return intlMiddleware(request);
    }

    // Check Supabase auth session
    const response = intlMiddleware(request);
    // Tag merchant dashboard requests so the locale layout can skip Header/Footer
    response.headers.set("x-pathname", pathname);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL(`/${locale}/espace-client/connexion`, request.url)
      );
    }

    return response;
  }

  // All other routes - next-intl
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
