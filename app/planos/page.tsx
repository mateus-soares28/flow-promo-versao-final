import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Zap } from "lucide-react";
import PricingPlans from "./PricingPlans";
import { getPlanCatalog } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

type PlansPageProps = { searchParams: { checkout?: string; access?: string } };

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const plans = await getPlanCatalog();

  return <main className="min-h-screen bg-[#f8fafc] text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8"><Link href="/" className="flex items-center gap-2.5 text-[17px] font-extrabold"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-950 text-white"><Zap className="h-4 w-4 fill-white" /></span>FlowPromos</Link><Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950">Já sou cliente <ArrowRight className="h-4 w-4" /></Link></div></header>
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700"><ArrowLeft className="h-3.5 w-3.5" /> Início</Link>
      <section className="flex flex-col justify-between gap-5 border-b border-slate-200 py-7 md:flex-row md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">Planos e acesso</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Escolha como começar.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Selecione um plano, crie sua conta e finalize a assinatura pelo Stripe.</p></div><div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white">1</span> Plano <ArrowRight className="h-3.5 w-3.5 text-slate-300" /><span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white">2</span> Cadastro <ArrowRight className="h-3.5 w-3.5 text-slate-300" /><span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white">3</span> Pagamento</div></section>
      <PricingPlans plans={plans} checkoutCancelled={searchParams.checkout === "cancelled"} subscriptionRequired={searchParams.access === "subscription_required"} />
      <footer className="mt-10 border-t border-slate-200 py-5 text-[10px] font-medium text-slate-400">FlowPromos · Assinatura processada pelo Stripe</footer>
    </div>
  </main>;
}
