import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtected) return NextResponse.redirect(new URL("/login?setup=supabase", request.url));
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  // Public pages without a session need no authentication round trip.
  if (!isProtected && !request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"))) {
    return response;
  }
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (isProtected && (!user || !user.email_confirmed_at)) {
    const destination = user ? "/login?error=email_not_confirmed" : "/login";
    const redirect = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  // Pages and actions enforce plan/role access in lib/auth; middleware only refreshes cookies.
  return response;
}
