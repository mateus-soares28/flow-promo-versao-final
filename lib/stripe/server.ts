import Stripe from "stripe";

export type BillingCycle = "monthly" | "annual";
export type PlanCode = "essencial" | "pro" | "expert";
export type CheckoutPlanCode = PlanCode | "teste";

export const planCatalog: { id: PlanCode; name: string; audience: string }[] = [
  { id: "essencial", name: "Essencial", audience: "Para começar a organizar sua operação" },
  { id: "pro", name: "Pro", audience: "Para uma rotina recorrente de publicações" },
  { id: "expert", name: "Expert", audience: "Para operações de afiliados em expansão" },
];

const priceEnvironmentKeys: Record<PlanCode, Record<BillingCycle, string>> = {
  essencial: { monthly: "STRIPE_PRICE_ESSENCIAL", annual: "STRIPE_PRICE_ESSENCIAL_ANNUAL" },
  pro: { monthly: "STRIPE_PRICE_PRO", annual: "STRIPE_PRICE_PRO_ANNUAL" },
  expert: { monthly: "STRIPE_PRICE_EXPERT", annual: "STRIPE_PRICE_EXPERT_ANNUAL" },
};

export type PlanPrice = { id: string; amount: number; currency: string } | null;
export type PlanWithPrices = {
  id: CheckoutPlanCode;
  name: string;
  audience: string;
  monthly: PlanPrice;
  annual: PlanPrice;
};

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey ? new Stripe(secretKey) : null;
}

export function getPlanPriceId(plan: PlanCode, cycle: BillingCycle) {
  return process.env[priceEnvironmentKeys[plan][cycle]]?.trim() || null;
}

async function retrievePrice(stripe: Stripe | null, priceId: string | null, cycle: BillingCycle): Promise<PlanPrice> {
  if (!stripe || !priceId) return null;

  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!price.active || price.type !== "recurring" || !price.recurring || price.unit_amount === null) return null;
    const intervalMatches = cycle === "monthly"
      ? price.recurring.interval === "month" && price.recurring.interval_count === 1
      : price.recurring.interval === "year" || (price.recurring.interval === "month" && price.recurring.interval_count === 12);
    if (!intervalMatches) return null;
    return { id: price.id, amount: price.unit_amount, currency: price.currency };
  } catch {
    return null;
  }
}

async function retrieveTestPrice(stripe: Stripe | null): Promise<PlanPrice> {
  const priceId = process.env.STRIPE_PRICE_TESTE?.trim();
  if (!stripe || !priceId) return null;

  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!price.active || price.type !== "recurring" || price.unit_amount !== 100 || price.currency !== "brl") return null;
    if (price.recurring?.interval !== "month" || price.recurring.interval_count !== 1) return null;
    return { id: price.id, amount: price.unit_amount, currency: price.currency };
  } catch {
    return null;
  }
}

export async function getPlanPrice(plan: CheckoutPlanCode, cycle: BillingCycle) {
  const stripe = getStripeClient();
  if (plan === "teste") return cycle === "monthly" ? retrieveTestPrice(stripe) : null;
  return retrievePrice(stripe, getPlanPriceId(plan, cycle), cycle);
}

export async function getPlanCatalog() {
  const stripe = getStripeClient();
  const plans = await Promise.all(planCatalog.map(async (plan) => {
    const [monthly, annual] = await Promise.all([
      retrievePrice(stripe, getPlanPriceId(plan.id, "monthly"), "monthly"),
      retrievePrice(stripe, getPlanPriceId(plan.id, "annual"), "annual"),
    ]);
    return { ...plan, monthly, annual };
  }));

  if (!process.env.STRIPE_PRICE_TESTE?.trim()) return plans;
  return [...plans, {
    id: "teste" as const,
    name: "Pre\u00e7o teste",
    audience: "Valida\u00e7\u00e3o tempor\u00e1ria da compra e ativa\u00e7\u00e3o",
    monthly: await retrieveTestPrice(stripe),
    annual: null,
  }];
}
