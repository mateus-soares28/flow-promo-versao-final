import Link from "next/link";
import { ArrowLeft, LockKeyhole, Zap } from "lucide-react";
import SubmitButton from "@/components/dashboard/SubmitButton";
import { resetPassword } from "@/app/actions/auth";

type ResetPageProps = {
  searchParams: { error?: string; setup?: string };
};

const errorMessages: Record<string, string> = {
  invalid_code: "Código inválido ou expirado. Confira o e-mail ou solicite outro código.",
  weak_password: "A nova senha precisa ter pelo menos 12 caracteres.",
  password_mismatch: "As senhas digitadas não coincidem.",
  update_failed: "Não foi possível alterar a senha. Solicite um novo código e tente novamente.",
};

export default function ResetPage({ searchParams }: ResetPageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 text-[17px] font-extrabold">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-950 text-white"><Zap className="h-4 w-4 fill-white" /></span>
          FlowPromos
        </Link>
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" /> Voltar ao login
        </Link>
      </div>

      <section className="mx-auto flex w-full max-w-[420px] flex-1 items-center py-12">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><LockKeyhole className="h-5 w-5" /></span>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Nova senha</p>
          <h1 className="mt-2 text-2xl font-extrabold">Redefina sua senha</h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">Digite o código recebido por e-mail e escolha uma nova senha com pelo menos 12 caracteres.</p>

          {searchParams.setup === "supabase" && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-800">Recuperação indisponível neste ambiente. Configure o Supabase Auth.</p>}
          {searchParams.error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-700">{errorMessages[searchParams.error] || "Não foi possível alterar a senha. Tente novamente."}</p>}

          <form action={resetPassword} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">E-mail da conta</span>
              <input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Código de 6 dígitos</span>
              <input name="token" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required placeholder="000000" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm tracking-[0.2em] outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Nova senha</span>
              <input name="password" type="password" autoComplete="new-password" minLength={12} required placeholder="Pelo menos 12 caracteres" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Confirmar nova senha</span>
              <input name="password_confirmation" type="password" autoComplete="new-password" minLength={12} required placeholder="Repita a nova senha" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100" />
            </label>
            <SubmitButton pendingText="Alterando…" className="h-11 w-full bg-slate-950 text-xs text-white hover:bg-slate-800">Salvar nova senha</SubmitButton>
          </form>

          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <Link href="/recuperar-senha" className="text-xs font-bold text-emerald-700 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:underline">Código expirou? Solicitar outro</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
