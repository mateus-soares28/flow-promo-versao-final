import { createHmac, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { cleanupExpiredCheckout } from "@/lib/stripe/fulfillment";
import { getStripeClient } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CancelledCheckoutPageProps = { searchParams: { attempt?: string; signature?: string } };

function verifyAttempt(attempt: string, signature: string) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature)) return null;
  const expected = createHmac("sha256", secret).update(attempt).digest();
  const provided = Buffer.from(signature, "hex");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;

  const [userId, customerId, expiresAt] = attempt.split(".");
  if (!userId || !customerId || !/^\d+$/.test(expiresAt || "") || Number(expiresAt) < Date.now()) return null;
  return { userId, customerId };
}

export default async function CancelledCheckoutPage({ searchParams }: CancelledCheckoutPageProps) {
  const attempt = searchParams.attempt;
  const signature = searchParams.signature;
  const verified = attempt && signature ? verifyAttempt(attempt, signature) : null;
  const stripe = getStripeClient();

  if (verified && stripe) {
    try {
      const [openSessions, completeSessions, expiredSessions] = await Promise.all([
        stripe.checkout.sessions.list({ customer: verified.customerId, status: "open", limit: 100 }),
        stripe.checkout.sessions.list({ customer: verified.customerId, status: "complete", limit: 100 }),
        stripe.checkout.sessions.list({ customer: verified.customerId, status: "expired", limit: 100 }),
      ]);
      const session = [...completeSessions.data, ...openSessions.data, ...expiredSessions.data]
        .filter((item) => item.metadata?.user_id === verified.userId)
        .sort((left, right) => right.created - left.created)[0];

      if (session?.status === "complete") {
        redirect(`/checkout/sucesso?session_id=${encodeURIComponent(session.id)}`);
      }

      if (session?.status === "open") {
        const expired = await stripe.checkout.sessions.expire(session.id);
        await cleanupExpiredCheckout(expired);
      } else if (session?.status === "expired") {
        await cleanupExpiredCheckout(session);
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) throw error;
      console.error("Could not clean up cancelled checkout", error);
    }
  }

  redirect("/planos?checkout=cancelled");
}
