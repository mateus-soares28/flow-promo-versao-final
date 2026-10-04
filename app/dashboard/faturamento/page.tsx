import Link from "next/link";
import { ArrowUpRight, ReceiptText } from "lucide-react";
import { openBillingPortal } from "@/app/actions/billing";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import SubmitButton from "@/components/dashboard/SubmitButton";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: { searchParams: { error?: string } }) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: customerRow } = await supabase.from("subscriptions").select("stripe_customer_id,plan_id,billing_cycle,status,amount,start_date,end_date").eq("user_id", user.id).not("stripe_customer_id", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const stripe = getStripeClient();
  let invoices: Awaited<ReturnType<NonNullable<typeof stripe>["invoices"]["list"]>>["data"] = [];
  if (stripe && customerRow?.stripe_customer_id) {
    try { invoices = (await stripe.invoices.list({ customer: customerRow.stripe_customer_id, limit: 12 })).data; } catch { invoices = []; }
  }
  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9"><div className="mx-auto max-w-6xl">
      <DashboardPageHeader eyebrow="Conta" title="Faturamento e recibos" description="Consulte pagamentos e gerencie os detalhes da assinatura no Stripe." action={<form action={openBillingPortal}><SubmitButton pendingText="Abrindo portal…" className="bg-slate-950 text-white hover:bg-slate-800"><ArrowUpRight size={15} aria-hidden="true" /> Gerenciar assinatura</SubmitButton></form>} />
      {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Não foi possível abrir o portal. Confira a configuração do Stripe ou escolha um plano.</p>}
      {customerRow && <section className="mt-6 grid gap-4 sm:grid-cols-3"><article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-medium text-slate-600">Plano</p><p className="mt-2 text-lg font-bold capitalize">{customerRow.plan_id}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-medium text-slate-600">Ciclo</p><p className="mt-2 text-lg font-bold">{customerRow.billing_cycle === "annual" ? "Anual" : "Mensal"}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-medium text-slate-600">Status</p><p className="mt-2 text-lg font-bold capitalize">{customerRow.status === "active" ? "Ativo" : customerRow.status}</p></article></section>}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold">Histórico de pagamentos</h2></div>{invoices.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600"><tr><th className="px-5 py-3 font-semibold">Descrição</th><th className="px-5 py-3 font-semibold">Valor</th><th className="px-5 py-3 font-semibold">Data</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Recibo</th></tr></thead><tbody className="divide-y divide-slate-100">{invoices.map((invoice) => <tr key={invoice.id}><td className="px-5 py-4">{invoice.description || "Assinatura FlowPromos"}</td><td className="px-5 py-4">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: invoice.currency.toUpperCase() }).format((invoice.amount_paid || invoice.total) / 100)}</td><td className="px-5 py-4">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Sao_Paulo" }).format(new Date(invoice.created * 1000))}</td><td className="px-5 py-4 capitalize">{invoice.status === "paid" ? "Pago" : invoice.status === "open" ? "Em aberto" : invoice.status || "Pendente"}</td><td className="px-5 py-4">{invoice.hosted_invoice_url || invoice.invoice_pdf ? <a href={invoice.hosted_invoice_url || invoice.invoice_pdf || "#"} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-emerald-800 hover:underline">Abrir <ArrowUpRight size={14} aria-hidden="true" /></a> : <span className="text-slate-500">—</span>}</td></tr>)}</tbody></table></div> : <div className="px-5 py-14 text-center"><ReceiptText className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" /><p className="mt-3 text-sm text-slate-600">{stripe ? "Nenhum comprovante encontrado." : "O Stripe ainda não está configurado."}</p><Link href="/planos" className="mt-3 inline-flex min-h-11 items-center font-semibold text-emerald-800 hover:underline">Ver planos</Link></div>}</section>
    </div></main>
  );
}
