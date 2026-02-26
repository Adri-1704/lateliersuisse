import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

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

    try {
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
        error,
      } = await supabase.auth.getUser();

      if (error) {
        // Supabase unreachable or auth error — allow access in dev mode
        if (process.env.NODE_ENV === "development") {
          return response;
        }
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      if (!user) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      // Network error — allow access in dev mode
      if (process.env.NODE_ENV === "development") {
        return response;
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return response;
  }

  // Merchant dashboard routes - protect with auth
  const espaceClientMatch = pathname.match(/^\/(\w{2})\/espace-client(?!\/connexion|\/mot-de-passe-oublie)/);
  if (espaceClientMatch) {
    const locale = espaceClientMatch[1];

    // If Supabase is not configured, allow access (dev/demo mode)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return intlMiddleware(request);
    }

    const response = intlMiddleware(request);

    try {
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
        error,
      } = await supabase.auth.getUser();

      if (error) {
        if (process.env.NODE_ENV === "development") {
          return response;
        }
        return NextResponse.redirect(new URL(`/${locale}/espace-client/connexion`, request.url));
      }

      if (!user) {
        return NextResponse.redirect(new URL(`/${locale}/espace-client/connexion`, request.url));
      }
    } catch {
      if (process.env.NODE_ENV === "development") {
        return response;
      }
      return NextResponse.redirect(new URL(`/${locale}/espace-client/connexion`, request.url));
    }

    return response;
  }

  // All other routes - next-intl
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
