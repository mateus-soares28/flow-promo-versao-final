"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Zap } from "lucide-react";
import SubmitButton from "@/components/dashboard/SubmitButton";
import { login, resendConfirmation } from "@/app/actions/auth";

type LoginPageProps = { searchParams: { setup?: string; error?: string; confirmed?: string; confirmation?: string; purchase?: string } };

const loginErrorMessages: Record<string, string> = {
  email_not_confirmed: "Confirme seu e-mail pelo link enviado. Confira também a caixa de spam.",
  invalid_credentials: "E-mail ou senha incorretos. Confira os dados e tente novamente.",
  invalid_email: "Digite um e-mail válido para reenviar a confirmação.",
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const setupRequired = searchParams.setup === "supabase";
  const hasError = Boolean(searchParams.error);

  return <main className="grid min-h-screen bg-[#f8fafc] px-5 py-10 text-slate-950 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)] lg:px-12">
    <section className="hidden flex-col justify-between border-r border-slate-200 pr-12 lg:flex"><Link href="/" className="flex w-fit items-center gap-2.5 text-[17px] font-extrabold"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-950 text-white"><Zap className="h-4 w-4 fill-white" /></span>FlowPromos</Link><div className="max-w-xl pb-12"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">Workspace de afiliados</p><h1 className="mt-4 text-4xl font-extrabold leading-tight">Sua operação de ofertas, em um só lugar.</h1><p className="mt-4 max-w-lg text-sm leading-6 text-slate-500">Acesse promoções, grupos e integrações para organizar seus próximos envios.</p></div><p className="text-[10px] text-slate-400">FlowPromos · Acesso seguro à plataforma</p></section>
    <section className="flex items-center justify-center lg:px-12"><div className="w-full max-w-[420px]">
      <Link href="/" className="mb-9 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Voltar ao início</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-8"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><LockKeyhole className="h-5 w-5" /></span><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Acesso à plataforma</p><h2 className="mt-2 text-2xl font-extrabold">Entre na sua conta</h2><p className="mt-2 text-xs leading-5 text-slate-500">Use seu e-mail e senha para continuar.</p>
        {setupRequired && <div role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-800">Supabase não configurado neste ambiente. Localmente, preencha `.env.local`; na Vercel, defina `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas variáveis do projeto e faça um novo deploy.</div>}
        {searchParams.confirmed === "1" && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800">E-mail confirmado. Entre após a confirmação do pagamento e ativação do plano.</div>}
        {searchParams.purchase === "confirmed" && <div role="status" className="mt-5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-xs leading-5 text-sky-800">Pagamento confirmado e assinatura ativada. Se ainda não confirmou seu e-mail, abra o link enviado ao endereço cadastrado. Depois, entre com o mesmo e-mail e senha.</div>}
        {searchParams.confirmation === "sent" && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800">Se houver cadastro pendente para esse endereço, enviaremos um novo link. Confira também o spam.</div>}
        {hasError && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-700">{loginErrorMessages[searchParams.error || ""] || "Não foi possível entrar. Tente novamente."}</div>}
        {searchParams.error === "email_not_confirmed" && <form action={resendConfirmation} className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5"><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Reenviar confirmação</span><input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100" /></label><SubmitButton pendingText="Enviando…" className="mt-2 text-xs text-emerald-700 hover:text-emerald-800">Enviar novo link</SubmitButton></form>}
        <form action={login} className="mt-6 space-y-4"><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">E-mail</span><input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Senha</span><span className="relative block"><input name="password" type={passwordVisible ? "text" : "password"} autoComplete="current-password" required placeholder="Sua senha" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" /><button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={passwordVisible} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400">{passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label><SubmitButton pendingText="Entrando…" className="mt-2 h-11 w-full bg-slate-950 text-xs text-white hover:bg-slate-800">Entrar</SubmitButton></form>
        <div className="mt-5 border-t border-slate-100 pt-4 text-center"><p className="text-xs text-slate-500">Ainda não tem acesso?</p><Link href="/planos" className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">Escolher plano e criar conta <ArrowRight className="h-3.5 w-3.5" /></Link></div>
      </div><p className="mt-5 text-center text-[10px] leading-5 text-slate-400">Sua senha é validada pelo Supabase Auth e não é armazenada pela FlowPromos.</p>
    </div></section>
  </main>;
}
