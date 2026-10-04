"use client";

import { useMemo, useState } from "react";
import Link from "@/components/dashboard/NavigationLink";
import {
  BarChart3,
  ChevronRight,
  ExternalLink,
  Filter,
  MessageSquareText,
  MoreHorizontal,
  PackageSearch,
  Search,
  Settings2,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Users,
  Zap,
} from "lucide-react";

export type OfferRecord = {
  id: number;
  title: string;
  store: string;
  category: string | null;
  original_price: number;
  promo_price: number;
  discount_percent: number;
  coupon: string | null;
  free_shipping: boolean;
  verified_seller: boolean;
  quality_score: number;
  original_url: string;
  affiliate_url: string;
  image_url: string | null;
  status: "detected" | "scheduled" | "sent" | "ignored";
  created_at: string;
};

type DashboardClientProps = { initialOffers: OfferRecord[]; loadError?: string };
type OfferStatus = OfferRecord["status"];
type SortKey = "newest" | "discount" | "quality" | "price";

const statusLabels: Record<OfferStatus, string> = {
  detected: "Detectada",
  scheduled: "Agendada",
  sent: "Enviada",
  ignored: "Ignorada",
};

const statusStyles: Record<OfferStatus, string> = {
  detected: "bg-amber-50 text-amber-700 ring-amber-100",
  scheduled: "bg-sky-50 text-sky-700 ring-sky-100",
  sent: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  ignored: "bg-slate-100 text-slate-500 ring-slate-200",
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)).replace(" de ", " ");
}

function StoreMark({ store }: { store: string }) {
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white"><ShoppingBag className="h-4 w-4" /></span>;
}

function Metric({ label, value, detail, icon: Icon, accent }: { label: string; value: string; detail: string; icon: typeof Tag; accent: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)]"><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold text-slate-400">{label}</p><p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">{value}</p></div><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}><Icon className="h-4 w-4" /></span></div><p className="mt-4 text-[10px] font-medium text-slate-400">{detail}</p></div>;
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="flex min-w-[142px] flex-1 flex-col gap-1.5"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100">{children}</select></label>;
}

function OfferCard({ offer }: { offer: OfferRecord }) {
  return <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
    <div className="flex items-start gap-3"><StoreMark store={offer.store} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{offer.store}</p><h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-950">{offer.title}</h3></div><Link href={`/dashboard/ofertas/${offer.id}/editar`} aria-label="Editar promoção" className="rounded-lg p-1 text-slate-300 hover:bg-slate-50 hover:text-slate-600"><MoreHorizontal className="h-4 w-4" /></Link></div><p className="mt-1 text-[11px] text-slate-400">{offer.category || "Sem categoria"} · {dateLabel(offer.created_at)}</p></div></div>
    <div className="mt-4 rounded-xl bg-slate-50 p-3"><div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold text-slate-400 line-through">{money(offer.original_price)}</p><p className="mt-0.5 text-xl font-extrabold tracking-[-0.04em] text-slate-950">{money(offer.promo_price)}</p></div><span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-extrabold text-emerald-700">-{offer.discount_percent}%</span></div><div className="mt-3 flex flex-wrap gap-1.5">{offer.coupon && <span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">Cupom {offer.coupon}</span>}{offer.free_shipping && <span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">Frete grátis</span>}{offer.verified_seller && <span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">Vendedor verificado</span>}</div></div>
    <div className="mt-4 flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${statusStyles[offer.status]}`}>{statusLabels[offer.status]}</span><span className="text-[10px] font-bold text-slate-400">Score {offer.quality_score}/100</span></div>
    <div className="mt-4 flex gap-2"><a href={offer.affiliate_url} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2.5 text-[11px] font-bold text-white transition hover:bg-slate-800">Ver oferta <ExternalLink className="h-3.5 w-3.5" /></a><Link href={`/dashboard/disparos/novo?offer=${offer.id}`} className="rounded-xl border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-600 transition hover:border-slate-400 hover:text-slate-950">Programar</Link></div>
  </article>;
}

export default function DashboardClient({ initialOffers, loadError }: DashboardClientProps) {
  const [query, setQuery] = useState("");
  const [store, setStore] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filteredOffers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...initialOffers].filter((offer) => {
      const matchesQuery = !normalized || [offer.title, offer.store, offer.category, offer.coupon].filter(Boolean).join(" ").toLowerCase().includes(normalized);
      const matchesStore = store === "all" || offer.store.toLowerCase() === store.toLowerCase();
      const matchesStatus = status === "all" || offer.status === status;
      return matchesQuery && matchesStore && matchesStatus;
    }).sort((a, b) => {
      if (sort === "discount") return b.discount_percent - a.discount_percent;
      if (sort === "quality") return b.quality_score - a.quality_score;
      if (sort === "price") return a.promo_price - b.promo_price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [initialOffers, query, sort, status, store]);

  const stores = Array.from(new Set(initialOffers.map((offer) => offer.store))).sort();
  const detectedCount = initialOffers.filter((offer) => offer.status === "detected").length;
  const avgScore = initialOffers.length ? Math.round(initialOffers.reduce((total, offer) => total + offer.quality_score, 0) / initialOffers.length) : 0;

  return <main className="min-h-[calc(100vh-68px)] bg-[#f8fafc] px-5 py-7 text-slate-950 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="flex items-center gap-2 text-xs text-slate-400"><Link href="/dashboard" className="hover:text-slate-700">Dashboard</Link><ChevronRight className="h-3.5 w-3.5" /><span className="font-semibold text-slate-600">Promoções</span></div><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl">Suas promoções</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Encontre, organize e prepare as melhores ofertas para os seus grupos.</p></div><Link href="/dashboard/ofertas/nova" className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 md:self-auto"><Sparkles className="h-4 w-4" /> Cadastrar promoção</Link></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Ofertas encontradas" value={String(initialOffers.length)} detail="No seu workspace" icon={PackageSearch} accent="bg-violet-50 text-violet-600" /><Metric label="Aguardando ação" value={String(detectedCount)} detail="Prontas para revisar" icon={Zap} accent="bg-amber-50 text-amber-600" /><Metric label="Score médio" value={avgScore ? `${avgScore}/100` : "—"} detail="Qualidade das ofertas" icon={BarChart3} accent="bg-emerald-50 text-emerald-600" /><Metric label="Lojas conectadas" value={String(stores.length)} detail="Configure em integrações" icon={ShoppingBag} accent="bg-sky-50 text-sky-600" /></div>
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-end"><label className="relative flex-1"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Buscar promoção</span><Search className="absolute left-3 top-[31px] h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título, loja, categoria ou cupom" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" /></label><div className="flex flex-col gap-3 sm:flex-row"><FilterSelect label="Loja" value={store} onChange={setStore}><option value="all">Todas as lojas</option>{stores.map((item) => <option key={item} value={item}>{item}</option>)}</FilterSelect><FilterSelect label="Status" value={status} onChange={setStatus}><option value="all">Todos os status</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</FilterSelect><FilterSelect label="Ordenar por" value={sort} onChange={(value) => setSort(value as SortKey)}><option value="newest">Mais recentes</option><option value="discount">Maior desconto</option><option value="quality">Maior score</option><option value="price">Menor preço</option></FilterSelect></div></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><p className="text-[11px] font-semibold text-slate-400"><span className="font-extrabold text-slate-700">{filteredOffers.length}</span> promoções exibidas</p><button onClick={() => { setQuery(""); setStore("all"); setStatus("all"); setSort("newest"); }} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-950"><SlidersHorizontal className="h-3.5 w-3.5" /> Limpar filtros</button></div></section>
          {loadError && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">Não foi possível carregar as promoções agora. Tente novamente mais tarde.</div>}
          {filteredOffers.length > 0 ? <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</section> : <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Filter className="h-6 w-6" /></div><h3 className="mt-5 text-base font-extrabold text-slate-950">{initialOffers.length ? "Nenhuma promoção encontrada" : "Seu painel começa vazio"}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{initialOffers.length ? "Ajuste os filtros ou tente buscar por outro termo." : "Conecte uma loja ou configure suas integrações para começar a receber ofertas qualificadas."}</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Link href="/dashboard/integracoes" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white hover:bg-slate-800"><Settings2 className="h-4 w-4" /> Configurar integrações</Link><Link href="/dashboard/grupos" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 hover:border-slate-400"><Users className="h-4 w-4" /> Gerenciar grupos</Link><button onClick={() => { setQuery(""); setStore("all"); setStatus("all"); }} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 hover:border-slate-400">Limpar filtros</button></div></section>}
          <footer className="mt-10 flex flex-col justify-between gap-3 border-t border-slate-200 py-6 text-[10px] font-medium text-slate-400 sm:flex-row"><span>FlowPromos · Operação simples para afiliados</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Dados sincronizados com segurança</span></footer>
        </div>
  </main>;
}
