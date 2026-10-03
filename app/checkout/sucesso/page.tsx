import Link from "next/link";
import { ArrowRight, Check, Clock3, X, Zap } from "lucide-react";
import { fulfillCheckoutSession } from "@/lib/stripe/fulfillment";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/server";
import RefreshCheckoutStatus from "./RefreshCheckoutStatus";

export const dynamic = "force-dynamic";

type SuccessPageProps = { searchParams: { session_id?: string } };

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const stripe = getStripeClient();
  let status: "confirmed" | "processing" | "expired" | "unavailable" = "unavailable";

  if (searchParams.session_id) status = "processing";

  if (stripe && searchParams.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      if (session.status === "expired") {
        status = "expired";
      } else if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan_id;
        if (!userId || !plan) throw new Error("Paid Checkout Session is missing activation metadata.");

        const admin = createAdminClient();
        const { data: profile, error } = await admin
          .from("profiles")
          .select("plan,plan_status,expires_at")
          .eq("id", userId)
          .maybeSingle();
        if (error) throw error;

        const profileIsActive = profile?.plan_status === "active"
          && profile.plan === plan
          && (!profile.expires_at || new Date(profile.expires_at).getTime() > Date.now());

        if (!profileIsActive) await fulfillCheckoutSession(session);
        status = "confirmed";
      }
    } catch (error) {
      console.error("Stripe checkout activation/status check failed", error);
      status = "processing";
    }
  } else if (!stripe && searchParams.session_id) {
    console.error("Stripe checkout status unavailable: Stripe is not configured.");
  }

  const isConfirmed = status === "confirmed";
  const isExpired = status === "expired";
  const title = isConfirmed
    ? "Compra confirmada"
    : isExpired
      ? "Checkout expirado"
      : status === "unavailable"
        ? "Não localizamos o pagamento"
        : "Pagamento em processamento";
  const message = isConfirmed
    ? "Pagamento aprovado e plano ativado. Confirme o link enviado ao e-mail do cadastro antes de entrar. Vamos redirecionar você para o login."
    : isExpired
      ? "Esta sessão expirou sem confirmação de pagamento. Nenhuma cobrança foi confirmada. Escolha um plano e refaça o cadastro."
      : status === "unavailable"
        ? "Não encontramos a sessão de pagamento nesta página. Acesse os planos para iniciar uma compra."
        : "Estamos confirmando o pagamento e ativando seu acesso. Esta página continuará tentando automaticamente.";

  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-5 py-10 text-slate-950">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-9">
        <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${isConfirmed ? "bg-emerald-50 text-emerald-700" : isExpired || status === "unavailable" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
          {isConfirmed ? <Check className="h-6 w-6" /> : isExpired || status === "unavailable" ? <X className="h-6 w-6" /> : <Clock3 className="h-6 w-6" />}
        </span>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">FlowPromos · Assinatura</p>
        <h1 className="mt-2 text-2xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        {isConfirmed ? (
          <RefreshCheckoutStatus active={false} redirectAfterConfirm />
        ) : status === "processing" ? (
          <RefreshCheckoutStatus active />
        ) : (
          <Link href="/planos" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800">
            Ver planos <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link href="/" className="mx-auto mt-5 flex w-fit items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-700">
          <Zap className="h-3.5 w-3.5" /> FlowPromos
        </Link>
      </section>
    </main>
  );
}
