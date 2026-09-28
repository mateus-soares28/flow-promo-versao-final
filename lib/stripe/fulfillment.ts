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

  const { error: profileError } = await admin.from("profiles").update({
    plan,
    plan_status: "active",
    expires_at: endDate,
  }).eq("id", userId);

  if (profileError) throw profileError;
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

  const { error: profileError } = await admin.from("profiles").update({
    plan: status === "cancelled" ? "none" : plan,
    plan_status: status === "cancelled" ? "cancelled" : status === "pending" ? "trial" : "active",
    expires_at: status === "cancelled" ? null : endDate,
  }).eq("id", userId);
  if (profileError) throw profileError;
}