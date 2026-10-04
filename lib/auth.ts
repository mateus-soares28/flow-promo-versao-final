import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { hasActivePlan } from "@/lib/access";

const getRequestUserContext = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null, reason: "login" as const };
  if (!user.email_confirmed_at) return { user: null, profile: null, reason: "email" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,plan,plan_status,expires_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!hasActivePlan(profile)) return { user: null, profile, reason: "plan" as const };
  return { user, profile, reason: null };
});

export async function requireUserContext() {
  const context = await getRequestUserContext();
  if (context.reason === "login") redirect("/login");
  if (context.reason === "email") redirect("/login?error=email_not_confirmed");
  if (context.reason === "plan") redirect("/planos?access=subscription_required");
  if (!context.user) redirect("/login");
  return context as { user: NonNullable<typeof context.user>; profile: NonNullable<typeof context.profile>; reason: null };
}

export async function requireUser() {
  return (await requireUserContext()).user;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/login?error=email_not_confirmed");
  const { data: profile } = await supabase.from("profiles").select("id,email,role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");
  return profile;
}
