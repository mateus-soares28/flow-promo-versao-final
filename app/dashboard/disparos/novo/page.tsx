import Link from "next/link";
import { notFound } from "next/navigation";
import { scheduleDispatch } from "@/app/actions/workspace";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { searchParams: { offer?: string; error?: string } };

export default async function NewDispatchPage({ searchParams }: Props) {
  const user = await requireUser();
  const offerId = Number(searchParams.offer);
  if (!Number.isSafeInteger(offerId) || offerId <= 0) notFound();
  const supabase = await createClient();
  const [{ data: offer }, { data: groups }] = await Promise.all([
    supabase.from("offers").select("id,title,store,promo_price,affiliate_url").eq("id", offerId).eq("user_id", user.id).single(),
    supabase.from("affiliate_groups").select("id,name,group_id").eq("user_id", user.id).eq("is_active", true).order("name"),
  ]);
  if (!offer) notFound();

  return <main className="min-h-screen bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8"><div className="mx-auto max-w-3xl">
    <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-950">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-extrabold">Agendar disparo</h1><p className="mt-2 text-sm text-slate-500">{offer.title} · {offer.store}</p>
    {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">Não foi possível agendar. Confira grupo, data e mensagem.</p>}
    <form action={scheduleDispatch} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <input type="hidden" name="offer_id" value={offer.id} />
      <label className="block text-xs font-semibold text-slate-600">Grupo WhatsApp<select required name="group_id" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">{groups?.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
      {!groups?.length && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Cadastre um grupo antes de agendar. <Link className="font-bold underline" href="/dashboard/grupos">Gerenciar grupos</Link></p>}
      <label className="block text-xs font-semibold text-slate-600">Data e hora<input type="datetime-local" name="scheduled_for" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="block text-xs font-semibold text-slate-600">Mensagem (opcional)<textarea name="message" maxLength={4000} rows={6} defaultValue={`🔥 ${offer.title}\n${offer.store} · R$ ${(offer.promo_price / 100).toFixed(2).replace(".", ",")}\n${offer.affiliate_url}`} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" /></label>
      <div className="flex gap-3"><button disabled={!groups?.length} className="h-11 flex-1 rounded-xl bg-slate-950 text-xs font-bold text-white hover:bg-slate-800 disabled:bg-slate-300">Adicionar à fila</button><Link href="/dashboard" className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600">Cancelar</Link></div>
    </form>
  </div></main>;
}
