import Link from "next/link";
import { ArrowRight, CreditCard, Settings2, Store } from "lucide-react";
import { openBillingPortal } from "@/app/actions/billing";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import SubmitButton from "@/components/dashboard/SubmitButton";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const providerNames: Record<string, string> = {
  shopee: "Shopee",
  amazon: "Amazon",
  mercadolivre: "Mercado Livre",
};

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: connections }, { data: subscription }] = await Promise.all([
    supabase.from("integration_connections").select("provider,status").eq("user_id", user.id),
    supabase.from("subscriptions").select("plan_id,status,end_date,stripe_customer_id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const configured = (connections || []).filter((connection) => connection.provider in providerNames);
  const planName = subscription?.plan_id ? subscription.plan_id.charAt(0).toUpperCase() + subscription.plan_id.slice(1) : null;
  const renewalDate = subscription?.end_date && subscription.status === "active"
    ? new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(subscription.end_date))
    : null;

  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <DashboardPageHeader eyebrow="Conta" title="Configurações" description="Gerencie integrações e assinatura da sua conta." />

        <section aria-labelledby="marketplaces-title" className="mt-8">
          <h2 id="marketplaces-title" className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-slate-600">Marketplaces</h2>
          <Link href="/dashboard/integracoes" className="group flex min-h-32 items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Store size={21} aria-hidden="true" /></span>
              <div>
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">Integrações de marketplace</h3><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{configured.length} de {Object.keys(providerNames).length} com credenciais</span></div>
                <p className="mt-1 text-sm text-slate-600">Credenciais de afiliado de cada loja.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">{Object.entries(providerNames).map(([id, name]) => <span key={id} className={`rounded-full border px-3 py-1.5 ${configured.some((connection) => connection.provider === id) ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}>{name}</span>)}</div>
                <p className="mt-3 text-xs text-slate-500">Credenciais salvas não significam conexão validada.</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700" aria-hidden="true" />
          </Link>
        </section>

        <section aria-labelledby="subscription-title" className="mt-8">
          <h2 id="subscription-title" className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-slate-600">Assinatura</h2>
          <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><CreditCard size={22} aria-hidden="true" /></span><div><h3 className="font-bold text-slate-950">{planName ? `Plano ${planName}` : "Nenhuma assinatura registrada"}</h3><p className="mt-1 text-sm text-slate-600">{renewalDate ? `Período atual termina em ${renewalDate}` : subscription ? `Status: ${subscription.status}` : "Confira os planos disponíveis para sua conta."}</p></div></div>
            {subscription?.stripe_customer_id ? <form action={openBillingPortal}><SubmitButton pendingText="Abrindo portal…" className="w-full bg-slate-950 text-white hover:bg-slate-800 sm:w-auto">Gerenciar assinatura</SubmitButton></form> : <Link href="/planos" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">Ver planos <ArrowRight size={16} aria-hidden="true" /></Link>}
          </div>
          <Link href="/dashboard/faturamento" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"><Settings2 size={16} aria-hidden="true" /> Ver faturamento e recibos</Link>
        </section>
      </div>
    </main>
  );
}
