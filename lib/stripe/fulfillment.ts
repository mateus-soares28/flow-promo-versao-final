import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient, type BillingCycle, type PlanCode } from "./server";

function isPlanCode(value: string | undefined): value is PlanCode {
  return value === "essencial" || value === "pro" || value === "expert";
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  const plan = session.metadata?.plan_id;
  const cycle = session.metadata?.billing_cycle;
  const userId = session.metadata?.user_id;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  if (session.mode !== "subscription" || !userId || !subscriptionId || !isPlanCode(plan) || (cycle !== "monthly" && cycle !== "annual")) {
    throw new Error("Checkout session metadata is incomplete.");
  }
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    throw new Error("Checkout session has not been paid.");
  }

  const admin = createAdminClient();
  const stripe = getStripeClient();
  if (!stripe) throw new Error("Stripe is not configured.");
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription.status !== "active" && subscription.status !== "trialing") {
    throw new Error(`Stripe subscription is not active: ${subscription.status}.`);
  }
  const periodEnd = subscription.items.data[0]?.current_period_end;
  if (!periodEnd) throw new Error("Stripe subscription has no billing period.");
  const endDate = new Date(periodEnd * 1000).toISOString();
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  const { error: subscriptionError } = await admin.from("subscriptions").upsert({
    user_id: userId,
    plan_id: plan,
    billing_cycle: cycle as BillingCycle,
    status: "active",
    amount: session.amount_total ?? 0,
    payment_method: "stripe_card",
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    start_date: new Date(session.created * 1000).toISOString(),
    end_date: endDate,
  }, { onConflict: "stripe_subscription_id" });

  if (subscriptionError) throw subscriptionError;

  const { data: updatedProfile, error: profileError } = await admin.from("profiles").update({
    plan,
    plan_status: "active",
    expires_at: endDate,
  }).eq("id", userId).select("id").maybeSingle();

  if (profileError) throw profileError;
  if (!updatedProfile) throw new Error("Profile was not found while activating the subscription.");
}

export async function cleanupExpiredCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") return;
  if (!userId) throw new Error("Expired Checkout Session is missing its user metadata.");

  const admin = createAdminClient();
  const [{ data: profile, error: profileError }, { data: subscriptions, error: subscriptionsError }] = await Promise.all([
    admin.from("profiles").select("role,plan_status").eq("id", userId).maybeSingle(),
    admin.from("subscriptions").select("id,status").eq("user_id", userId).in("status", ["active", "past_due"]).limit(1),
  ]);
  if (profileError) throw profileError;
  if (subscriptionsError) throw subscriptionsError;
  if (profile?.role === "admin" || profile?.plan_status === "active" || subscriptions?.length) return;

  const stripe = getStripeClient();
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (stripe && customerId) {
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (["active", "trialing", "past_due"].includes(subscription.status)) return;
      if (subscription.status !== "canceled" && subscription.status !== "incomplete_expired") {
        await stripe.subscriptions.cancel(subscriptionId);
      }
    }

    try {
      await stripe.customers.del(customerId);
    } catch (error) {
      const stripeError = error as { code?: string };
      if (stripeError.code !== "resource_missing") throw error;
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError && deleteError.status !== 404) throw deleteError;
}

export async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  const plan = subscription.metadata.plan_id;
  const cycle = subscription.metadata.billing_cycle;
  const periodEnd = subscription.items.data[0]?.current_period_end;
  if (!userId || !isPlanCode(plan) || (cycle !== "monthly" && cycle !== "annual") || !periodEnd) {
    throw new Error("Subscription metadata is incomplete.");
  }

  const status = subscription.status === "canceled"
    ? "cancelled"
    : subscription.status === "active" || subscription.status === "trialing"
      ? "active"
      : subscription.status === "past_due"
        ? "past_due"
        : "pending";
  const endDate = new Date(periodEnd * 1000).toISOString();
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const admin = createAdminClient();
  const { error: subscriptionError } = await admin.from("subscriptions").upsert({
    user_id: userId,
    plan_id: plan,
    billing_cycle: cycle as BillingCycle,
    status,
    amount: subscription.items.data[0]?.price.unit_amount ?? 0,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    start_date: new Date(subscription.created * 1000).toISOString(),
    end_date: endDate,
  }, { onConflict: "stripe_subscription_id" });
  if (subscriptionError) throw subscriptionError;

  const { data: updatedProfile, error: profileError } = await admin.from("profiles").update({
    plan: status === "cancelled" ? "none" : plan,
    plan_status: status === "cancelled" ? "cancelled" : status === "past_due" ? "expired" : status === "pending" ? "trial" : "active",
    expires_at: status === "cancelled" ? null : endDate,
  }).eq("id", userId).select("id").maybeSingle();
  if (profileError) throw profileError;
  if (!updatedProfile) throw new Error("Profile was not found while syncing the subscription.");
}
