"use client";

import Link from "next/link";
import { RotateCcw, Zap } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-5 text-center text-slate-950"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_8px_28px_rgba(15,23,42,0.035)]"><Link href="/" className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"><Zap className="h-5 w-5 fill-white" /></Link><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">Erro inesperado</p><h1 className="mt-2 text-2xl font-extrabold">Não foi possível carregar</h1><p className="mt-2 text-sm leading-6 text-slate-500">Ocorreu um problema ao abrir esta página. Tente novamente.</p><button className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800" onClick={() => reset()}><RotateCcw className="h-4 w-4" /> Tentar novamente</button><Link href="/" className="mt-4 block text-xs font-semibold text-slate-500 hover:text-slate-950">Voltar ao início</Link></section></main>;
}
