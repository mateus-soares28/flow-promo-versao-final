import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasActivePlan } from "@/lib/access";

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
  if (isProtected && !user) return NextResponse.redirect(new URL("/login", request.url));
  if (isProtected && user) {
    if (!user.email_confirmed_at) return NextResponse.redirect(new URL("/login?error=email_not_confirmed", request.url));
    const { data: profile } = await supabase.from("profiles").select("role,plan_status,expires_at").eq("id", user.id).maybeSingle();
    if (pathname.startsWith("/admin")) {
      if (profile?.role !== "admin") return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (!hasActivePlan(profile)) {
      return NextResponse.redirect(new URL("/planos?access=subscription_required", request.url));
    }
  }
  return response;
}
