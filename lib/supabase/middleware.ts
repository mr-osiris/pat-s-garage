import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const { pathname } = request.nextUrl;

  // ──────────────────────────────────────────────────────────────
  // DEV / no-Supabase fallback: use a simple session cookie only
  // when Supabase is not configured (placeholder values).
  // ──────────────────────────────────────────────────────────────
  const supabaseConfigured =
    !!supabaseUrl &&
    supabaseUrl !== "https://placeholder-project.supabase.co";

  if (!supabaseConfigured) {
    const isAdminCookie =
      request.cookies.get("vault_admin_auth")?.value === "true";
    if (pathname.startsWith("/admin") && !isAdminCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (pathname === "/login" && isAdminCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ──────────────────────────────────────────────────────────────
  // PRODUCTION: Supabase is configured — only real sessions grant
  // admin access. The cookie is NOT trusted here to prevent
  // cookie-forgery bypassing Supabase Auth.
  // ──────────────────────────────────────────────────────────────
  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
