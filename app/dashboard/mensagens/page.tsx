import { MessageSquareText, Trash2 } from "lucide-react";
import { deleteMessageTemplate } from "@/app/actions/workspace";
import SubmitButton from "@/components/dashboard/SubmitButton";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import SubmitButton from "@/components/dashboard/SubmitButton";
import TemplateEditor from "@/components/dashboard/TemplateEditor";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }: { searchParams: { error?: string; saved?: string; deleted?: string } }) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: templates } = await supabase.from("message_templates").select("id,title,message,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9"><div className="mx-auto max-w-6xl">
      <DashboardPageHeader eyebrow="Comunicação" title="Templates de mensagens" description="Crie, visualize e reutilize mensagens para seus disparos." />
      {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{searchParams.error === "invalid" ? "Informe título e mensagem dentro dos limites." : "Não foi possível salvar. Confira se a migração de templates foi aplicada no Supabase."}</p>}
      {(searchParams.saved || searchParams.deleted) && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Alteração salva.</p>}
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.5fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2 border-b border-slate-100 pb-4"><MessageSquareText size={18} className="text-emerald-700" aria-hidden="true" /><h2 className="font-semibold">Seus templates</h2></div>
          {templates?.length ? <ul className="divide-y divide-slate-100">{templates.map((template) => <li key={template.id} className="py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-sm font-semibold">{template.title}</h3><p className="mt-2 line-clamp-4 whitespace-pre-wrap break-words text-sm text-slate-600">{template.message}</p></div><form action={deleteMessageTemplate}><input type="hidden" name="id" value={template.id} /><SubmitButton aria-label={`Excluir template ${template.title}`} pendingText="Excluindo…" className="h-11 w-11 shrink-0 px-0 text-rose-700 hover:bg-rose-50"><Trash2 size={16} aria-hidden="true" /></SubmitButton></form></div></li>)}</ul> : <div className="py-10 text-center"><MessageSquareText className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" /><p className="mt-3 text-sm text-slate-600">Nenhum template salvo.</p></div>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-5 font-semibold">Novo template</h2><TemplateEditor /></section>
      </div>
    </div></main>
  );
}
