import Link from "next/link";
import { deleteOffer, updateOffer } from "@/app/actions/workspace";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SubmitButton from "@/components/dashboard/SubmitButton";

export const dynamic = "force-dynamic";

type Props = { params: { id: string }; searchParams: { error?: string } };

export default async function EditOfferPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const id = Number(params.id);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const supabase = await createClient();
  const { data: offer } = await supabase.from("offers").select("id,title,store,category,original_price,promo_price,coupon,original_url,affiliate_url").eq("id", id).eq("user_id", user.id).single();
  if (!offer) notFound();

  return <main className="min-h-[calc(100vh-68px)] bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8"><div className="mx-auto max-w-3xl">
    <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-950">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-extrabold">Editar promoção</h1>
    {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">Não foi possível salvar. Revise os dados e tente novamente.</p>}
    <form action={updateOffer} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-7">
      <input type="hidden" name="id" value={offer.id} />
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Título<input required maxLength={200} name="title" defaultValue={offer.title} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">Loja<input required maxLength={80} name="store" defaultValue={offer.store} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">Categoria<input maxLength={100} name="category" defaultValue={offer.category || ""} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">Preço original (R$)<input required min="0.01" step="0.01" type="number" name="original_price" defaultValue={(offer.original_price / 100).toFixed(2)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">Preço promocional (R$)<input required min="0.01" step="0.01" type="number" name="promo_price" defaultValue={(offer.promo_price / 100).toFixed(2)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Link afiliado<input required type="url" name="affiliate_url" defaultValue={offer.affiliate_url} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Link original<input type="url" name="original_url" defaultValue={offer.original_url} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Cupom<input maxLength={80} name="coupon" defaultValue={offer.coupon || ""} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <SubmitButton pendingText="Salvando alterações…" className="h-11 bg-slate-950 text-xs text-white hover:bg-slate-800">Salvar alterações</SubmitButton>
      <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-xs font-bold text-slate-600">Cancelar</Link>
    </form>
    <form action={deleteOffer} className="mt-4"><input type="hidden" name="id" value={offer.id} /><SubmitButton pendingText="Excluindo…" className="text-xs text-rose-600 hover:text-rose-800">Excluir promoção</SubmitButton></form>
  </div></main>;
}
