"use client";

import { useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { registerAndCheckout } from "@/app/actions/billing";
import { formatCpf, isValidCpf } from "@/lib/validation/signup";

type SignupFormProps = { planId: string; cycle: "monthly" | "annual" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return <button disabled={pending} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-500">
    {pending ? "Preparando pagamento…" : "Criar conta e ir para o pagamento"}
    {!pending && <ArrowRight className="h-4 w-4" />}
  </button>;
}

function PasswordInput({ name, label, visible, onToggle, autoComplete, hint }: {
  name: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
  autoComplete: "new-password";
  hint: string;
}) {
  return <label className="block">
    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
    <span className="relative block">
      <input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required minLength={12} maxLength={128} placeholder={hint} aria-describedby={`${name}-hint`} onChange={(event) => {
        const form = event.currentTarget.form;
        const password = form?.elements.namedItem("password") as HTMLInputElement | null;
        const confirmation = form?.elements.namedItem("password_confirmation") as HTMLInputElement | null;
        confirmation?.setCustomValidity(password && confirmation.value && password.value !== confirmation.value ? "As senhas não são iguais." : "");
      }} className="h-11 w-full rounded-xl border border-slate-200 px-3 pr-12 text-base outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:text-sm" />
      <button type="button" onClick={onToggle} aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`} aria-pressed={visible} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400">
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </span>
    <span id={`${name}-hint`} className="sr-only">Digite pelo menos 12 caracteres.</span>
  </label>;
}

export default function SignupForm({ planId, cycle }: SignupFormProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [cpf, setCpf] = useState("");
  const [cpfTouched, setCpfTouched] = useState(false);
  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfInvalid = (cpfTouched || cpfDigits.length === 11) && cpfDigits.length > 0 && !isValidCpf(cpf);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const password = form.elements.namedItem("password") as HTMLInputElement;
    const confirmation = form.elements.namedItem("password_confirmation") as HTMLInputElement;
    confirmation.setCustomValidity(password.value === confirmation.value ? "" : "As senhas não são iguais.");
    if (!form.reportValidity()) event.preventDefault();
  }

  return <form action={registerAndCheckout} onSubmit={handleSubmit} className="mt-6 space-y-4">
    <input type="hidden" name="plan" value={planId} />
    <input type="hidden" name="cycle" value={cycle} />
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Nome</span>
      <input name="name" autoComplete="name" required maxLength={100} placeholder="Seu nome" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-base outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:text-sm" />
    </label>
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">E-mail</span>
      <input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="voce@exemplo.com" aria-describedby="email-hint" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-base outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:text-sm" />
      <span id="email-hint" className="sr-only">Informe um e-mail válido.</span>
    </label>
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">CPF</span>
      <input name="cpf" type="text" inputMode="numeric" autoComplete="off" required maxLength={14} value={cpf} onChange={(event) => {
        const formatted = formatCpf(event.currentTarget.value);
        setCpf(formatted);
        event.currentTarget.setCustomValidity(formatted.replace(/\D/g, "").length === 11 && !isValidCpf(formatted) ? "Digite um CPF válido." : "");
      }} onBlur={(event) => {
        setCpfTouched(true);
        event.currentTarget.setCustomValidity(isValidCpf(event.currentTarget.value) ? "" : "Digite um CPF válido.");
      }} aria-invalid={cpfInvalid} aria-describedby="cpf-hint" placeholder="000.000.000-00" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-base outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:text-sm" />
      <span id="cpf-hint" className={`mt-1 block text-[11px] ${cpfInvalid ? "text-rose-600" : "text-slate-400"}`}>{cpfInvalid ? "Confira os números do CPF." : "Enviado ao Stripe para identificação da cobrança; não fica salvo no FlowPromos."}</span>
    </label>
    <PasswordInput name="password" label="Senha" visible={passwordVisible} onToggle={() => setPasswordVisible((value) => !value)} autoComplete="new-password" hint="Mínimo de 12 caracteres" />
    <PasswordInput name="password_confirmation" label="Confirmar senha" visible={confirmationVisible} onToggle={() => setConfirmationVisible((value) => !value)} autoComplete="new-password" hint="Digite a senha novamente" />
    <SubmitButton />
  </form>;
}
