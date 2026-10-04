import Link from "next/link";
import { createOffer } from "@/app/actions/workspace";
import { requireUser } from "@/lib/auth";

export default async function NewOfferPage({ searchParams }: { searchParams: { error?: string } }) {
  await requireUser();
  return <main className="min-h-[calc(100vh-68px)] bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8"><div className="mx-auto max-w-3xl">
    <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-950">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-extrabold">Nova promoção</h1><p className="mt-2 text-sm text-slate-500">Cadastre oferta manualmente para organizar e agendar.</p>
    {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">Confira título, preços e links. Preço promocional deve ser menor que preço original.</p>}
    <form action={createOffer} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-7">
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Título<input required maxLength={200} name="title" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">Loja<input required maxLength={80} name="store" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Shopee" /></label>
      <label className="text-xs font-semibold text-slate-600">Categoria<input maxLength={100} name="category" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">Preço original (R$)<input required min="0.01" step="0.01" type="number" name="original_price" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">Preço promocional (R$)<input required min="0.01" step="0.01" type="number" name="promo_price" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Link afiliado<input required type="url" name="affiliate_url" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="https://" /></label>
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Link original (opcional)<input type="url" name="original_url" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Se vazio, usa link afiliado" /></label>
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Cupom (opcional)<input maxLength={80} name="coupon" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <div className="flex gap-3 sm:col-span-2"><button className="h-11 flex-1 rounded-xl bg-slate-950 text-xs font-bold text-white hover:bg-slate-800">Salvar promoção</button><Link href="/dashboard" className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600">Cancelar</Link></div>
    </form>
  </div></main>;
}
