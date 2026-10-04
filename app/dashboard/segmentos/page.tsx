import Link from "next/link";
import { Layers3, Pencil, Trash2 } from "lucide-react";
import { createSegment, deleteSegment, toggleSegment } from "@/app/actions/workspace";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import SubmitButton from "@/components/dashboard/SubmitButton";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const stores: Record<string, string> = { all: "Todas as lojas", shopee: "Shopee", amazon: "Amazon", magalu: "Magalu", mercadolivre: "Mercado Livre", aliexpress: "AliExpress" };

export default async function SegmentsPage({ searchParams }: { searchParams: { error?: string; created?: string; deleted?: string; updated?: string } }) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: segments } = await supabase.from("segments").select("id,name,store,keywords,min_discount_percentage,min_quality_score,is_active,created_at").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9"><div className="mx-auto max-w-6xl">
      <DashboardPageHeader eyebrow="Ofertas" title="Segmentos e nichos" description="Defina palavras-chave e filtros para organizar promoções para seu público." action={<a href="#novo-segmento" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"><Layers3 size={16} aria-hidden="true" /> Novo segmento</a>} />
      {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{searchParams.error === "invalid" ? "Confira os campos e tente novamente." : "Não foi possível salvar. Tente novamente."}</p>}
      {(searchParams.created || searchParams.updated || searchParams.deleted) && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Segmentos atualizados.</p>}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Segmentos cadastrados" className="grid content-start gap-3">
          {segments?.length ? segments.map((segment) => <article key={segment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="font-bold">{segment.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${segment.is_active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{segment.is_active ? "Ativo" : "Pausado"}</span></div><p className="mt-2 text-sm text-slate-600">{stores[segment.store] || segment.store} · Desconto mínimo {segment.min_discount_percentage}% · Score {segment.min_quality_score}+</p><p className="mt-2 break-words text-sm text-slate-500">{segment.keywords}</p></div><div className="flex items-center gap-2"><form action={toggleSegment}><input type="hidden" name="id" value={segment.id} /><input type="hidden" name="is_active" value={String(segment.is_active)} /><SubmitButton pendingText="Atualizando…" className="border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:border-slate-400">{segment.is_active ? "Pausar" : "Ativar"}</SubmitButton></form><form action={deleteSegment}><input type="hidden" name="id" value={segment.id} /><button aria-label={`Excluir segmento ${segment.name}`} className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-rose-700 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"><Trash2 size={16} aria-hidden="true" /></button></form></div></div></article>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Layers3 className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" /><h2 className="mt-3 font-semibold">Nenhum segmento ainda</h2><p className="mt-1 text-sm text-slate-600">Crie seu primeiro filtro no formulário ao lado.</p></div>}
        </section>
        <section id="novo-segmento" className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-base font-bold">Novo segmento</h2><p className="mt-1 text-sm text-slate-600">Use palavras separadas por vírgula.</p><form action={createSegment} className="mt-5 space-y-4">
          <label className="block text-sm font-medium">Nome<input required maxLength={80} name="name" placeholder="Ex.: Cozinha" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm" /></label>
          <label className="block text-sm font-medium">Loja<select name="store" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">{Object.entries(stores).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm font-medium">Palavras-chave<textarea required maxLength={500} name="keywords" rows={3} placeholder="cafeteira, air fryer, panela" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Desconto mín. %<input type="number" name="min_discount" min="0" max="100" defaultValue="15" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm" /></label><label className="block text-sm font-medium">Score mín.<input type="number" name="min_score" min="0" max="100" defaultValue="60" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm" /></label></div>
          <SubmitButton pendingText="Criando segmento…" className="w-full bg-slate-950 text-white hover:bg-slate-800">Criar segmento</SubmitButton>
        </form><Link href="/dashboard?tab=promocoes" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-emerald-800 hover:underline"><Pencil size={15} className="mr-2" aria-hidden="true" />Ver ofertas</Link></section>
      </div>
    </div></main>
  );
}
