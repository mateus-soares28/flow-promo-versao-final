import Link from "next/link";
import { createGroup, deleteGroup } from "@/app/actions/workspace";
import { syncWhatsappGroupsAction } from "@/app/actions/whatsapp";
import SubmitButton from "@/components/dashboard/SubmitButton";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { searchParams: { error?: string; created?: string; deleted?: string; synced?: string } };

export default async function GroupsPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: groups } = await supabase.from("affiliate_groups").select("id,name,group_id,segment,is_active,members_count").eq("user_id", user.id).order("created_at", { ascending: false });
  const error = searchParams.error === "sync" ? "Não foi possível sincronizar. Conecte o WhatsApp e tente novamente." : searchParams.error ? "Não foi possível salvar. Confira nome e ID do grupo (ex.: 120363012345678901@g.us)." : "";

  return <main className="min-h-[calc(100vh-68px)] bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8"><div className="mx-auto max-w-5xl">
    <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-950">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-extrabold">Grupos WhatsApp</h1><p className="mt-2 text-sm text-slate-500">Cadastre grupos para escolher destinos de disparo.</p>
    {searchParams.created && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">Grupo cadastrado.</p>}{searchParams.deleted && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">Grupo removido.</p>}{searchParams.synced !== undefined && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">{searchParams.synced} grupo(s) sincronizado(s).</p>}{error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">Seus grupos</h2><form action={syncWhatsappGroupsAction}><SubmitButton pendingText="Sincronizando…" className="border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:border-slate-400">Sincronizar WhatsApp</SubmitButton></form></div>{groups?.length ? <ul className="mt-4 divide-y divide-slate-100">{groups.map((group) => <li key={group.id} className="flex items-center gap-3 py-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{group.name}</p><p className="mt-1 truncate text-xs text-slate-600">{group.group_id} · {group.segment || "Geral"}</p><p className="mt-1 text-xs text-slate-500">{group.members_count} participantes · {group.is_active ? "Ativo" : "Pausado"}</p></div><form action={deleteGroup}><input type="hidden" name="id" value={group.id} /><SubmitButton pendingText="Removendo…" className="px-3 text-xs text-rose-700 hover:bg-rose-50">Remover</SubmitButton></form></li>)}</ul> : <p className="mt-4 text-sm text-slate-600">Nenhum grupo cadastrado.</p>}</section>
      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Adicionar grupo</h2><form action={createGroup} className="mt-4 space-y-4">
        <label className="block text-xs font-semibold text-slate-600">Nome<input required maxLength={100} name="name" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Promoções tech" /></label>
        <label className="block text-xs font-semibold text-slate-600">ID do grupo<input required name="group_id" pattern="[0-9]{5,30}@g\.us" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="120363012345678901@g.us" /></label>
        <label className="block text-xs font-semibold text-slate-600">Segmento<input maxLength={80} name="segment" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Eletrônicos" /></label>
        <SubmitButton pendingText="Salvando grupo…" className="w-full bg-slate-950 text-white hover:bg-slate-800">Salvar grupo</SubmitButton>
      </form><Link href="/dashboard/whatsapp" className="mt-4 inline-block text-xs font-semibold text-emerald-700">Conectar WhatsApp</Link></section>
    </div>
  </div></main>;
}
