import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-5 text-center text-slate-950"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_8px_28px_rgba(15,23,42,0.035)]"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"><Zap className="h-5 w-5 fill-white" /></span><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Erro 404</p><h1 className="mt-2 text-2xl font-extrabold">Página não encontrada</h1><p className="mt-2 text-sm leading-6 text-slate-500">O endereço pode ter mudado ou não existe.</p><Link className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800" href="/"><ArrowLeft className="h-4 w-4" /> Voltar ao início</Link></section></main>;
}
