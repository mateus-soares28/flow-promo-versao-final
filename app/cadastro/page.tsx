import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Zap } from "lucide-react";
import { getPlanCatalog } from "@/lib/stripe/server";
import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

type SignupPageProps = { searchParams: { plan?: string; cycle?: string; error?: string } };

const errorMessages: Record<string, string> = {
  missing_fields: "Preencha todos os campos para continuar.",
  weak_password: "A senha precisa ter pelo menos 12 caracteres.",
  password_mismatch: "As senhas não são iguais.",
  account_exists: "Já existe uma conta com este e-mail. Entre na sua conta para continuar.",
  signup_email_limited: "O Supabase limitou a confirmação por e-mail. Configure um SMTP próprio ou tente novamente quando o limite liberar.",
  invalid_email: "Digite um endereço de e-mail válido.",
  invalid_cpf: "Digite um CPF válido para continuar.",
  signup_unavailable: "Não foi possível criar sua conta agora. Tente novamente em alguns minutos.",
  checkout_unavailable: "Não foi possível iniciar o pagamento. Confirme se o plano e o Stripe estão configurados.",
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const plans = await getPlanCatalog();
  const selectedPlan = plans.find((plan) => plan.id === searchParams.plan) ?? plans.find((plan) => plan.monthly || plan.annual);
  const selectedCycle = searchParams.cycle === "annual" ? "annual" : "monthly";
  const selectedPrice = selectedPlan?.[selectedCycle] ?? null;

  return <main className="min-h-screen bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8">
    <div className="mx-auto max-w-5xl"><Link href="/planos" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Voltar aos planos</Link>
      <div className="mt-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.035)] lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="p-6 sm:p-9"><Link href="/" className="flex w-fit items-center gap-2.5 text-[17px] font-extrabold"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-950 text-white"><Zap className="h-4 w-4 fill-white" /></span>FlowPromos</Link><p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">Criar acesso</p><h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Sua conta começa aqui.</h1><p className="mt-2 text-sm leading-6 text-slate-500">Preencha seus dados. No próximo passo, você confirma sua assinatura no checkout seguro do Stripe.</p>
          {searchParams.error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-700">{errorMessages[searchParams.error] || "Não foi possível concluir o cadastro."}{searchParams.error === "account_exists" && <Link href="/login" className="ml-1 font-bold underline">Entrar</Link>}</div>}
          <SignupForm planId={selectedPlan?.id || ""} cycle={selectedCycle} />
          <p className="mt-4 flex items-center gap-2 text-[10px] leading-5 text-slate-400"><LockKeyhole className="h-3.5 w-3.5 shrink-0" /> Seus dados de acesso são tratados pelo Supabase Auth.</p>
          <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">Já comprou ou tem uma conta? <Link href="/login" className="font-bold text-slate-800 hover:text-emerald-700">Entrar</Link></p>
        </section>
        <aside className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-l lg:border-t-0"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Resumo do plano</p>{selectedPlan && selectedPrice ? <><h2 className="mt-3 text-xl font-extrabold">{selectedPlan.name}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{selectedPlan.audience}</p><p className="mt-6 text-3xl font-extrabold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: selectedPrice.currency.toUpperCase() }).format(selectedPrice.amount / 100)}</p><p className="mt-1 text-[11px] text-slate-400">por {selectedCycle === "monthly" ? "mês" : "ano"}</p><ul className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-xs text-slate-600"><li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Checkout processado pelo Stripe</li><li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600" /> Acesso liberado após confirmação</li></ul></> : <><h2 className="mt-3 text-lg font-extrabold">Plano indisponível</h2><p className="mt-2 text-xs leading-5 text-slate-500">Escolha outro plano ou aguarde a configuração dos preços no Stripe.</p><Link href="/planos" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">Ver planos <ArrowRight className="h-3.5 w-3.5" /></Link></>}</aside>
      </div>
    </div>
  </main>;
}
