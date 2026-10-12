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

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!isValidEmail(email)) redirect("/recuperar-senha?error=invalid_email");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/recuperar-senha?setup=supabase");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  // Keep the same response for known and unknown accounts.
  if (error) console.error("Supabase password recovery request failed", { code: error.code, status: error.status });
  redirect("/recuperar-senha?sent=1");
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("password_confirmation") || "");

  if (!isValidEmail(email) || !/^\d{6}$/.test(token)) redirect("/redefinir-senha?error=invalid_code");
  if (password.length < 12) redirect("/redefinir-senha?error=weak_password");
  if (password !== confirmation) redirect("/redefinir-senha?error=password_mismatch");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/redefinir-senha?setup=supabase");
  }

  const supabase = await createClient();
  const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
  if (verifyError || !verified.session || verified.user?.email?.toLowerCase() !== email) {
    if (!verifyError) await supabase.auth.signOut();
    redirect("/redefinir-senha?error=invalid_code");
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    await supabase.auth.signOut();
    console.error("Supabase password recovery update failed", { code: updateError.code, status: updateError.status });
    redirect("/redefinir-senha?error=update_failed");
  }

  await supabase.auth.signOut();
  redirect("/login?password=updated");
}
