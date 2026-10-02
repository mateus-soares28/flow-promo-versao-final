import Link from "next/link";
import { ArrowRight, Check, Clock3, Zap } from "lucide-react";
import { fulfillCheckoutSession } from "@/lib/stripe/fulfillment";
import { getStripeClient } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

type SuccessPageProps = { searchParams: { session_id?: string } };

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const stripe = getStripeClient();
  let paymentConfirmed = false;

  if (stripe && searchParams.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        await fulfillCheckoutSession(session);
        paymentConfirmed = true;
      }
    } catch (error) {
      console.error("Stripe checkout fulfillment failed", error);
      paymentConfirmed = false;
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-5 py-10 text-slate-950"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-9"><span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${paymentConfirmed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{paymentConfirmed ? <Check className="h-6 w-6" /> : <Clock3 className="h-6 w-6" />}</span><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">FlowPromos · Assinatura</p><h1 className="mt-2 text-2xl font-extrabold">{paymentConfirmed ? "Compra confirmada" : "Pagamento em processamento"}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{paymentConfirmed ? "Seu plano foi ativado. Entre com o e-mail e a senha que usou no cadastro." : "Assim que o Stripe confirmar o pagamento, seu acesso será liberado. Se o pagamento já foi aprovado, aguarde alguns instantes e entre na sua conta."}</p><Link href="/login" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800">Ir para o login <ArrowRight className="h-4 w-4" /></Link><Link href="/" className="mx-auto mt-5 flex w-fit items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-700"><Zap className="h-3.5 w-3.5" /> FlowPromos</Link></section></main>;
}
