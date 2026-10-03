"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getPlanPrice, getStripeClient, type BillingCycle, type CheckoutPlanCode, type PlanCode } from "@/lib/stripe/server";
import { isValidCpf, isValidEmail, normalizeCpf } from "@/lib/validation/signup";

function isPlanCode(value: string): value is PlanCode {
  return value === "essencial" || value === "pro" || value === "expert";
}

function isCheckoutPlanCode(value: string): value is CheckoutPlanCode {
  return isPlanCode(value);
}

function isBillingCycle(value: string): value is BillingCycle {
  return value === "monthly" || value === "annual";
}

async function removeUnpaidAccount(userId: string, stripeCustomerId?: string | null) {
  const stripe = getStripeClient();
  if (stripe && stripeCustomerId) {
    try {
      await stripe.customers.del(stripeCustomerId);
    } catch {
      // Keep cleaning up the Supabase user even if Stripe cleanup fails.
    }
  }

  try {
    await createAdminClient().auth.admin.deleteUser(userId);
  } catch {
    return;
  }
}

export async function registerAndCheckout(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const cpf = normalizeCpf(String(formData.get("cpf") || ""));
  const password = String(formData.get("password") || "");
  const passwordConfirmation = String(formData.get("password_confirmation") || "");
  const plan = String(formData.get("plan") || "");
  const cycle = String(formData.get("cycle") || "");
  const query = new URLSearchParams();
  if (isCheckoutPlanCode(plan)) query.set("plan", plan);
  if (isBillingCycle(cycle)) query.set("cycle", cycle);
  const signupUrl = `/cadastro?${query.toString()}`;

  if (!name || !email || !cpf || !password || !isCheckoutPlanCode(plan) || !isBillingCycle(cycle)) redirect(`${signupUrl}&error=missing_fields`);
  if (!isValidEmail(email)) redirect(`${signupUrl}&error=invalid_email`);
  if (!isValidCpf(cpf)) redirect(`${signupUrl}&error=invalid_cpf`);
  if (password.length < 12) redirect(`${signupUrl}&error=weak_password`);
  if (password !== passwordConfirmation) redirect(`${signupUrl}&error=password_mismatch`);

  const stripe = getStripeClient();
  const price = await getPlanPrice(plan, cycle);
  if (!stripe || !price) redirect(`${signupUrl}&error=checkout_unavailable`);
  const activatedPlan: PlanCode = plan;

  const requestHeaders = headers();
  const configuredOrigin = process.env.APP_URL?.trim();
  const requestOrigin = requestHeaders.get("origin");
  let origin: string;
  try {
    origin = new URL(configuredOrigin || requestOrigin || "http://localhost:3000").origin;
  } catch {
    redirect(`${signupUrl}&error=checkout_unavailable`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${origin}/login?confirmed=1`,
    },
  });

  if (error) {
    const duplicateAccount = error.code === "user_already_exists";
    const emailLimit = error.status === 429
      || error.code === "over_email_send_rate_limit"
      || error.code === "email_address_not_authorized"
      || error.message.toLowerCase().includes("email rate limit");
    const errorCode = duplicateAccount ? "account_exists" : emailLimit ? "signup_email_limited" : "signup_unavailable";
    redirect(`${signupUrl}&error=${errorCode}`);
  }
  if (!data.user) redirect(`${signupUrl}&error=signup_unavailable`);
  if (data.user.identities?.length === 0) redirect(`${signupUrl}&error=account_exists`);

  let checkoutUrl: string | null = null;
  let stripeCustomerId: string | null = null;

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { user_id: data.user.id },
    });
    stripeCustomerId = customer.id;
    await stripe.customers.createTaxId(customer.id, { type: "br_cpf", value: cpf });

    const cancelPayload = `${data.user.id}.${customer.id}.${Date.now() + 25 * 60 * 60 * 1000}`;
    const cancelSignature = createHmac("sha256", process.env.STRIPE_SECRET_KEY!).update(cancelPayload).digest("hex");

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      client_reference_id: data.user.id,
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { user_id: data.user.id, plan_id: activatedPlan, billing_cycle: cycle },
      subscription_data: { metadata: { user_id: data.user.id, plan_id: activatedPlan, billing_cycle: cycle } },
      expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelado?attempt=${encodeURIComponent(cancelPayload)}&signature=${cancelSignature}`,
    });
    checkoutUrl = checkout.url;
  } catch {
    await removeUnpaidAccount(data.user.id, stripeCustomerId);
    redirect(`${signupUrl}&error=checkout_unavailable`);
  }

  if (!checkoutUrl) {
    await removeUnpaidAccount(data.user.id, stripeCustomerId);
    redirect(`${signupUrl}&error=checkout_unavailable`);
  }
  redirect(checkoutUrl);
}
