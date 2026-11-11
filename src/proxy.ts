// Factory for a Supabase client that reads/writes the session through cookies.
import { createServerClient } from "@supabase/ssr";
// next-intl's request handler: locale detection and redirects (/ -> /fr).
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
// Reads the public Supabase URL and publishable key from .env.
import { getSupabaseEnv } from "./lib/supabase/env";

// Next.js 16 calls this file "proxy" (formerly "middleware"). It runs on every
// matched request, before the page is rendered.

// Handles the locale part of the routing (fr / en / vi).
const handleI18n = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Let next-intl build the response first (it may be a redirect or a rewrite).
  // We keep it so that we can attach refreshed auth cookies to it below.
  const response = handleI18n(request);

  // Keeps the Supabase session alive. The access token (JWT) is short-lived;
  // Server Components cannot write cookies, so this is the one place where an
  // expired token can be swapped for a fresh one before the page renders.
  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      // Read the tokens the browser sent with this request.
      getAll: () => request.cookies.getAll(),
      // When Supabase issues new tokens, store them on the outgoing response
      // so the browser saves them.
      setAll: (toSet) =>
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        ),
    },
  });

  // Verifies the JWT signature and expiry. If the token has expired, the
  // refresh token is used to get a new pair, which triggers `setAll` above.
  // The returned claims are ignored: access control is done in the layouts
  // (via getSession) and, ultimately, by the database's RLS policies.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
