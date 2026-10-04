import Link from "next/link";
import { Activity, ArrowRight, Boxes, KeyRound, Radio, Send } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const cards = [
  { title: "Gateway WhatsApp", icon: Radio, href: "/dashboard/whatsapp", detail: "Conecte sua sessão para liberar sincronização e disparos." },
  { title: "Integrações de afiliado", icon: KeyRound, href: "/dashboard/integracoes", detail: "Cadastre credenciais. A autenticação ainda não foi validada." },
  { title: "Segmentos de ofertas", icon: Boxes, href: "/dashboard/segmentos", detail: "Configure palavras-chave para organizar sua operação." },
];

export default async function MonitoringPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [whatsapp, integrations, segments, queue] = await Promise.all([
    supabase.from("whatsapp_sessions").select("status").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("integration_connections").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("segments").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
    supabase.from("dispatches").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["pending", "processing"]),
  ]);
  const whatsappStatus = whatsapp.data?.status === "connected" ? "Conectado" : whatsapp.data?.status === "connecting" ? "Aguardando leitura" : "Não configurado";
  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9"><div className="mx-auto max-w-6xl">
      <DashboardPageHeader eyebrow="Operação" title="Monitoramento e automações" description="Acompanhe conexões, filtros ativos e mensagens na fila. Configure cada etapa pelas ações abaixo." />
      <section aria-label="Status das integrações" className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map(({ title, icon: Icon, href, detail }, index) => { const value = [whatsappStatus, `${integrations.count ?? 0} configurada(s)`, `${segments.count ?? 0} ativa(s)`][index]; return <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Icon size={18} aria-hidden="true" /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-600">{detail}</p></div><span className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium">{value}</span></div><Link href={href} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline">Configurar <ArrowRight size={15} aria-hidden="true" /></Link></article>; })}
      </section>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Activity size={17} className="text-emerald-700" aria-hidden="true" /><h2 className="font-semibold">Fila de disparos</h2></div><p className="mt-2 text-sm text-slate-600">{queue.count ?? 0} mensagem(ns) aguardando envio ou em processamento.</p><p className="mt-1 text-xs text-slate-500">A publicação automática exige um WhatsApp conectado e grupos cadastrados.</p></div><Link href="/dashboard/disparos" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Abrir fila <Send size={15} aria-hidden="true" /></Link></div></section>
    </div></main>
  );
}
