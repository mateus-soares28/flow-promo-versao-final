"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, CircleHelp, CreditCard, Zap } from "lucide-react";

type BillingCycle = "monthly" | "annual";
type Plan = {
  id: "essencial" | "pro" | "expert";
  name: string;
  audience: string;
  monthly: { id: string; amount: number; currency: string } | null;
  annual: { id: string; amount: number; currency: string } | null;
};

const benefits = ["Painel para organizar promoções", "Ofertas com cupons e links afiliados", "Acesso ao workspace FlowPromos"];

function formatPrice(price: NonNullable<Plan[BillingCycle]>) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: price.currency.toUpperCase() }).format(price.amount / 100);
}

export default function PricingPlans({ plans, checkoutCancelled, subscriptionRequired }: { plans: Plan[]; checkoutCancelled: boolean; subscriptionRequired: boolean }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const anyPriceAvailable = plans.some((plan) => plan.monthly || plan.annual);

  return <>
    {checkoutCancelled && <div role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">A compra foi cancelada. Seus dados não foram cobrados.</div>}
    {subscriptionRequired && <div role="status" className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-800">Confirme seu e-mail e conclua uma assinatura ativa para liberar o acesso à plataforma.</div>}
    {!anyPriceAvailable && <div role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">Os preços ainda não estão disponíveis. Confira a chave Stripe e os Price IDs recorrentes neste ambiente; na Vercel, salve as variáveis do ambiente de deploy e publique uma nova versão.</div>}
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
      <div><h2 className="text-sm font-extrabold">Planos FlowPromos</h2><p className="mt-1 text-xs text-slate-500">Escolha o ciclo de cobrança para comparar os valores.</p></div>
      <div aria-label="Ciclo de cobrança" className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1">
        <button type="button" aria-pressed={cycle === "monthly"} onClick={() => setCycle("monthly")} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${cycle === "monthly" ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-950"}`}>Mensal</button>
        <button type="button" aria-pressed={cycle === "annual"} onClick={() => setCycle("annual")} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${cycle === "annual" ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-950"}`}>Anual</button>
      </div>
    </div>
    <section className="mt-5 grid gap-4 lg:grid-cols-3">
      {plans.map((plan, index) => {
        const price = plan[cycle];
        const highlighted = index === 1;
        return <article key={plan.id} className={`flex min-h-[390px] flex-col rounded-2xl border bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)] ${highlighted ? "border-slate-950 ring-1 ring-slate-950" : "border-slate-200"}`}>
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">{plan.name}</p><h3 className="mt-2 text-lg font-extrabold">{plan.audience}</h3></div>{highlighted && <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Mais escolhido</span>}</div>
          <div className="mt-6 min-h-[56px]">{price ? <><p className="text-3xl font-extrabold tracking-tight">{formatPrice(price)}</p><p className="mt-1 text-[11px] font-medium text-slate-400">por {cycle === "monthly" ? "mês" : "ano"}</p></> : <><p className="text-lg font-extrabold text-slate-700">Preço indisponível</p><p className="mt-1 text-[11px] text-slate-400">Este ciclo ainda não foi cadastrado</p></>}</div>
          <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5">{benefits.map((benefit) => <li key={benefit} className="flex items-start gap-2.5 text-xs leading-5 text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{benefit}</li>)}</ul>
          <Link href={`/cadastro?plan=${plan.id}&cycle=${cycle}`} className={`mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition ${price ? highlighted ? "bg-slate-950 text-white hover:bg-slate-800" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950" : "border border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-400 hover:text-slate-800"}`}>Ver etapa de cadastro <ArrowRight className="h-4 w-4" /></Link>
        </article>;
      })}
    </section>
    <div className="mt-5 flex items-start gap-2 border-t border-slate-200 pt-4 text-[11px] leading-5 text-slate-400"><CreditCard className="mt-0.5 h-4 w-4 shrink-0" /><p>O pagamento é processado com segurança pelo Stripe. A ativação do acesso acontece após a confirmação do pagamento.</p><CircleHelp className="ml-auto mt-0.5 hidden h-4 w-4 shrink-0 sm:block" /></div>
    <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5 text-[11px] text-slate-400"><Link href="/" className="inline-flex items-center gap-1.5 hover:text-slate-700"><Zap className="h-3.5 w-3.5" /> FlowPromos</Link><span>Já comprou? <Link href="/login" className="font-bold text-slate-700 hover:text-slate-950">Acesse sua conta</Link></span></div>
  </>;
}
