import Link from "next/link";
import { TicketPercent } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: offers } = await supabase.from("offers").select("id,title,store,coupon,affiliate_url,promo_price,created_at").eq("user_id", user.id).not("coupon", "is", null).order("created_at", { ascending: false }).limit(100);
  const coupons = (offers || []).filter((offer) => offer.coupon?.trim());
  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9"><div className="mx-auto max-w-6xl">
      <DashboardPageHeader eyebrow="Ofertas" title="Cupons" description="Cupons cadastrados nas suas promoções, prontos para copiar e compartilhar." action={<Link href="/dashboard/ofertas/nova" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Cadastrar oferta</Link>} />
      {coupons.length ? <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{coupons.map((offer) => <li key={offer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{offer.store}</p><h2 className="mt-2 text-sm font-semibold leading-5">{offer.title}</h2></div><TicketPercent size={18} className="shrink-0 text-emerald-700" aria-hidden="true" /></div><code className="mt-4 block overflow-hidden text-ellipsis rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800">{offer.coupon}</code><div className="mt-4 flex items-center justify-between gap-3"><span className="text-sm text-slate-600">R$ {(offer.promo_price / 100).toFixed(2).replace(".", ",")}</span><Link href={`/dashboard/ofertas/${offer.id}/editar`} className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800 hover:underline">Ver oferta</Link></div></li>)}</ul> : <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><TicketPercent className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" /><h2 className="mt-3 font-semibold">Nenhum cupom cadastrado</h2><p className="mt-1 text-sm text-slate-600">Adicione cupom ao cadastrar uma promoção.</p><Link href="/dashboard/ofertas/nova" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Cadastrar oferta</Link></section>}
    </div></main>
  );
}
