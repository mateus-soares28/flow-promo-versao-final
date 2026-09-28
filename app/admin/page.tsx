import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { Activity, ArrowUpRight, CreditCard, Database, MessageCircle, ShieldCheck, Users, Zap } from "lucide-react";

export default async function AdminPage() {
  const profile = await requireAdmin();
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const [users, offers, groups, dispatches] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("offers").select("id", { count: "exact", head: true }),
    supabase.from("affiliate_groups").select("id", { count: "exact", head: true }),
    supabase.from("dispatches").select("id", { count: "exact", head: true }),
  ]);
  const metrics = [
    { label: "Usuários", value: users.count ?? 0, icon: Users, color: "bg-sky-50 text-sky-700" },
    { label: "Promoções", value: offers.count ?? 0, icon: Zap, color: "bg-amber-50 text-amber-700" },
    { label: "Grupos", value: groups.count ?? 0, icon: MessageCircle, color: "bg-emerald-50 text-emerald-700" },
    { label: "Disparos", value: dispatches.count ?? 0, icon: Activity, color: "bg-rose-50 text-rose-700" },
  ];

  return <main className="min-h-screen bg-[#f8fafc] text-slate-950">
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8"><Link href="/" className="flex items-center gap-2.5 text-[17px] font-extrabold"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-950 text-white"><Zap className="h-4 w-4 fill-white" /></span>FlowPromos</Link><div className="flex items-center gap-3"><span className="hidden text-xs font-semibold text-slate-500 sm:block">{profile.email}</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Administrador</span></div></header>
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">Visão do sistema</p><h1 className="mt-2 text-3xl font-extrabold">Painel administrativo</h1><p className="mt-2 text-sm text-slate-500">Acompanhe a atividade e a configuração da plataforma.</p></div><Link href="/dashboard" className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-slate-400">Abrir workspace <ArrowUpRight className="h-4 w-4" /></Link></div>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)]"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{label}</p><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></span></div><p className="mt-3 text-3xl font-extrabold">{value}</p></article>)}</section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><ShieldCheck className="h-4 w-4" /></span><div><h2 className="text-sm font-extrabold">Ambiente e integrações</h2><p className="mt-1 text-xs text-slate-400">Estado das credenciais no servidor</p></div></div><div className="mt-5 divide-y divide-slate-100">{[{ label: "Supabase", ready: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), icon: Database }, { label: "Stripe", ready: Boolean(process.env.STRIPE_SECRET_KEY), icon: CreditCard }, { label: "WhatsApp · Evolution API", ready: Boolean(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY), icon: MessageCircle }].map(({ label, ready, icon: Icon }) => <div key={label} className="flex items-center gap-3 py-3"><Icon className="h-4 w-4 text-slate-400" /><span className="flex-1 text-xs font-semibold text-slate-700">{label}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{ready ? "Configurado" : "Pendente"}</span></div>)}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-sm font-extrabold">Próximas etapas</h2><p className="mt-1 text-xs text-slate-400">Conclua a configuração para liberar o fluxo.</p><ol className="mt-5 space-y-4 text-xs leading-5 text-slate-600"><li className="flex gap-3"><span className="font-bold text-slate-300">01</span> Aplicar a migração do banco no projeto Supabase.</li><li className="flex gap-3"><span className="font-bold text-slate-300">02</span> Provisionar o administrador com `npm run admin:create`.</li><li className="flex gap-3"><span className="font-bold text-slate-300">03</span> Configurar Stripe e Evolution API no ambiente server-side.</li></ol></div></section>
      <footer className="mt-10 border-t border-slate-200 py-5 text-[10px] text-slate-400">FlowPromos · Área restrita a administradores</footer>
    </div>
  </main>;
}
