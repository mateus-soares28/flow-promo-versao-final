import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = { pending: "Na fila", processing: "Enviando", sent: "Enviado", failed: "Falhou" };

export default async function DispatchesPage({ searchParams }: { searchParams: { scheduled?: string } }) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: dispatches } = await supabase.from("dispatches").select("id,group_id,message_content,status,scheduled_for,sent_at,error_message").eq("user_id", user.id).order("scheduled_for", { ascending: false }).limit(100);
  const groupIds = [...new Set((dispatches || []).map((item) => item.group_id).filter((id): id is number => id !== null))];
  const { data: groups } = groupIds.length ? await supabase.from("affiliate_groups").select("id,name").in("id", groupIds) : { data: [] };
  const groupNames = new Map((groups || []).map((group) => [group.id, group.name]));

  return <main className="min-h-screen bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8"><div className="mx-auto max-w-5xl">
    <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-950">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-extrabold">Fila de disparos</h1><p className="mt-2 text-sm text-slate-500">Acompanhe mensagens agendadas e entregas.</p>
    {searchParams.scheduled && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">Disparo adicionado à fila.</p>}
    <section className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-5">
      {dispatches?.length ? dispatches.map((dispatch) => <article key={dispatch.id} className="py-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold">{groupNames.get(dispatch.group_id || 0) || "Grupo removido"}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${dispatch.status === "sent" ? "bg-emerald-50 text-emerald-700" : dispatch.status === "failed" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{labels[dispatch.status] || dispatch.status}</span></div><p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-600">{dispatch.message_content}</p><p className="mt-2 text-[10px] text-slate-400">Agendado: {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(dispatch.scheduled_for))}{dispatch.sent_at ? ` · Enviado: ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(dispatch.sent_at))}` : ""}</p>{dispatch.error_message && <p className="mt-2 text-xs text-rose-700">{dispatch.error_message}</p>}</article>) : <p className="py-12 text-center text-sm text-slate-500">Nenhum disparo na fila.</p>}
    </section>
  </div></main>;
}
