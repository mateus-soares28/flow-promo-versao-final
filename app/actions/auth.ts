"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isValidEmail } from "@/lib/validation/signup";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) redirect("/login?error=missing_credentials");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) redirect("/login?setup=supabase");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") redirect("/login?error=email_not_confirmed");
  if (error) redirect("/login?error=invalid_credentials");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resendConfirmation(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!isValidEmail(email)) redirect("/login?error=invalid_email");

  const origin = process.env.APP_URL?.trim() || headers().get("origin") || "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${new URL(origin).origin}/login?confirmed=1` },
  });
  if (error) console.error("Supabase confirmation resend failed", { code: error.code, message: error.message });
  redirect("/login?confirmation=sent");
}
