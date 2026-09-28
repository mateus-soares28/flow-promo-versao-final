"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getPlanPrice, getStripeClient, type BillingCycle, type PlanCode } from "@/lib/stripe/server";

function isPlanCode(value: string): value is PlanCode {
  return value === "essencial" || value === "pro" || value === "expert";
}

function isBillingCycle(value: string): value is BillingCycle {
  return value === "monthly" || value === "annual";
}

async function removeUnpaidAccount(userId: string) {
  try {
    await createAdminClient().auth.admin.deleteUser(userId);
  } catch {
    return;
  }
}

export async function registerAndCheckout(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const passwordConfirmation = String(formData.get("password_confirmation") || "");
  const plan = String(formData.get("plan") || "");
  const cycle = String(formData.get("cycle") || "");
  const query = new URLSearchParams();
  if (isPlanCode(plan)) query.set("plan", plan);
  if (isBillingCycle(cycle)) query.set("cycle", cycle);
  const signupUrl = `/cadastro?${query.toString()}`;

  if (!name || !email || !password || !isPlanCode(plan) || !isBillingCycle(cycle)) redirect(`${signupUrl}&error=missing_fields`);
  if (password.length < 12) redirect(`${signupUrl}&error=weak_password`);
  if (password !== passwordConfirmation) redirect(`${signupUrl}&error=password_mismatch`);

  const stripe = getStripeClient();
  const price = await getPlanPrice(plan, cycle);
  if (!stripe || !price) redirect(`${signupUrl}&error=checkout_unavailable`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error || !data.user || data.user.identities?.length === 0) redirect(`${signupUrl}&error=account_exists`);

  const requestHeaders = headers();
  const origin = process.env.APP_URL || requestHeaders.get("origin") || "http://localhost:3000";
  let checkoutUrl: string | null = null;

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      client_reference_id: data.user.id,
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { user_id: data.user.id, plan_id: plan, billing_cycle: cycle },
      subscription_data: { metadata: { user_id: data.user.id, plan_id: plan, billing_cycle: cycle } },
      success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/planos?checkout=cancelled`,
    });
    checkoutUrl = checkout.url;
  } catch {
    await removeUnpaidAccount(data.user.id);
    redirect(`${signupUrl}&error=checkout_unavailable`);
  }

  if (!checkoutUrl) {
    await removeUnpaidAccount(data.user.id);
    redirect(`${signupUrl}&error=checkout_unavailable`);
  }
  redirect(checkoutUrl);
}