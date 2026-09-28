import Link from "next/link";
import { ArrowRight, Check, MessageCircle, Radio, ShoppingBag, Zap } from "lucide-react";

const setupSteps = [
  { number: "01", title: "Conecte seu WhatsApp", description: "Vincule uma sessão e escolha onde suas ofertas serão publicadas.", icon: MessageCircle },
  { number: "02", title: "Organize seus grupos", description: "Separe audiências por nicho, loja ou tipo de promoção.", icon: Radio },
  { number: "03", title: "Prepare suas ofertas", description: "Revise links, cupons e preços antes de programar os envios.", icon: ShoppingBag },
];

export default function HomePage() {
  return <main className="min-h-screen bg-[#f8fafc] text-slate-950">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-[17px] font-extrabold text-slate-950"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-950 text-white"><Zap className="h-4 w-4 fill-white" /></span>FlowPromos</Link>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800">Acessar plataforma <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
      <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">Workspace de afiliados</p><h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">Ofertas certas, nos grupos certos.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Organize promoções de lojas como Shopee e Mercado Livre e prepare a publicação nos seus grupos de WhatsApp.</p></div>
        <Link href="/login" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:text-slate-950">Entrar no workspace <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <section className="grid gap-10 py-9 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:gap-16">
        <div><div className="flex items-center justify-between"><div><h2 className="text-sm font-extrabold text-slate-950">Seu fluxo de publicação</h2><p className="mt-1 text-xs text-slate-400">Da curadoria ao envio, em um só lugar.</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">Configuração inicial</span></div>
          <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">{setupSteps.map(({ number, title, description, icon: Icon }) => <article key={number} className="flex gap-4 py-5"><span className="pt-1 text-[10px] font-bold text-slate-300">{number}</span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200"><Icon className="h-4 w-4" /></span><div><h3 className="text-sm font-bold text-slate-800">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div><Check className="ml-auto mt-1 h-4 w-4 text-slate-200" /></article>)}</div>
        </div>
        <aside className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Primeiros passos</p><h2 className="mt-2 text-lg font-extrabold text-slate-950">Configure seu espaço</h2><p className="mt-2 text-xs leading-5 text-slate-500">Acesse sua conta para conectar os serviços e começar a organizar grupos e promoções.</p><ul className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-600"><li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Perfil e autenticação</li><li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> WhatsApp e grupos</li><li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Planos e pagamentos</li></ul><Link href="/login" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white hover:bg-slate-800">Continuar <ArrowRight className="h-4 w-4" /></Link></aside>
      </section>
      <footer className="border-t border-slate-200 pt-5 text-[10px] font-medium text-slate-400">FlowPromos · Operação simples para afiliados</footer>
    </div>
  </main>;
}
