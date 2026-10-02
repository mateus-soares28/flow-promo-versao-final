import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActivePlan } from "@/lib/access";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/login?error=email_not_confirmed");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,plan_status,expires_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!hasActivePlan(profile)) redirect("/planos?access=subscription_required");
  return user;
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
