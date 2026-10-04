import Link from "next/link";
import { notFound } from "next/navigation";
import { scheduleDispatch } from "@/app/actions/workspace";
import DispatchMessageField from "@/components/dashboard/DispatchMessageField";
import SubmitButton from "@/components/dashboard/SubmitButton";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { searchParams: { offer?: string; error?: string } };

export default async function NewDispatchPage({ searchParams }: Props) {
  const user = await requireUser();
  const offerId = Number(searchParams.offer);
  if (!Number.isSafeInteger(offerId) || offerId <= 0) notFound();
  const supabase = await createClient();
  const [{ data: offer }, { data: groups }, { data: templates, error: templatesError }] = await Promise.all([
    supabase.from("offers").select("id,title,store,promo_price,original_price,discount_percent,coupon,affiliate_url").eq("id", offerId).eq("user_id", user.id).single(),
    supabase.from("affiliate_groups").select("id,name,group_id").eq("user_id", user.id).eq("is_active", true).order("name"),
    supabase.from("message_templates").select("id,title,message").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  if (!offer) notFound();
  const defaultMessage = [`🔥 ${offer.title}`, `${offer.store} · R$ ${(offer.promo_price / 100).toFixed(2).replace(".", ",")}`, offer.coupon ? `Cupom: ${offer.coupon}` : "", offer.affiliate_url].filter(Boolean).join("\n");

  return <main className="min-h-[calc(100vh-68px)] bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8"><div className="mx-auto max-w-3xl">
    <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-950">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-extrabold">Agendar disparo</h1><p className="mt-2 text-sm text-slate-500">{offer.title} · {offer.store}</p>
    {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">Não foi possível agendar. Confira grupo, data e mensagem.</p>}
    <form action={scheduleDispatch} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <input type="hidden" name="offer_id" value={offer.id} />
      <label className="block text-xs font-semibold text-slate-600">Grupo WhatsApp<select required name="group_id" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">{groups?.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
      {!groups?.length && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Cadastre um grupo antes de agendar. <Link className="font-bold underline" href="/dashboard/grupos">Gerenciar grupos</Link></p>}
      <label className="block text-xs font-semibold text-slate-600">Data e hora (Brasília)<input type="datetime-local" name="scheduled_for" aria-describedby="schedule-help" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <p id="schedule-help" className="text-xs text-slate-500">Deixe em branco para adicionar à fila agora.</p>
      {templatesError && <p role="status" className="text-xs text-amber-800">Modelos indisponíveis no momento. Você pode escrever sua mensagem abaixo.</p>}
      <DispatchMessageField offer={{ title: offer.title, store: offer.store, promoPrice: offer.promo_price, originalPrice: offer.original_price, discount: offer.discount_percent, coupon: offer.coupon, link: offer.affiliate_url }} templates={templates || []} defaultMessage={defaultMessage} />
      <div className="flex gap-3"><SubmitButton disabled={!groups?.length} pendingText="Adicionando à fila…" className="flex-1 bg-slate-950 text-white hover:bg-slate-800">Adicionar à fila</SubmitButton><Link href="/dashboard" className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600">Cancelar</Link></div>
    </form>
  </div></main>;
}
