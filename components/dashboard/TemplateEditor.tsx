"use client";

import { useState } from "react";
import { saveMessageTemplate } from "@/app/actions/workspace";
import SubmitButton from "@/components/dashboard/SubmitButton";

const examples: Record<string, string> = {
  "{titulo}": "Fone bluetooth sem fio",
  "{preco_original}": "R$ 199,90",
  "{preco_final}": "R$ 129,90",
  "{desconto}": "35%",
  "{cupom}": "FLOW10",
  "{link}": "https://loja.exemplo/oferta",
};

function previewMessage(value: string) {
  return Object.entries(examples).reduce((message, [token, replacement]) => message.replaceAll(token, replacement), value);
}

export default function TemplateEditor() {
  const [message, setMessage] = useState("");
  return (
    <form action={saveMessageTemplate} className="space-y-4">
      <label className="block text-sm font-medium">Título<input required maxLength={100} name="title" placeholder="Oferta relâmpago" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm" /></label>
      <label className="block text-sm font-medium">Mensagem<textarea required maxLength={4000} rows={7} name="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escreva sua mensagem usando {titulo}, {preco_final}, {cupom} e {link}" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6" /></label>
      <p className="text-xs leading-5 text-slate-600">Variáveis: {Object.keys(examples).join(", ")}</p>
      <SubmitButton pendingText="Salvando template…" className="bg-slate-950 text-white hover:bg-slate-800">Salvar template</SubmitButton>
      <section aria-live="polite" aria-label="Pré-visualização da mensagem" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold">Pré-visualização</h3>
        <p className="mt-3 min-h-16 whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm leading-6 text-slate-700">{message ? previewMessage(message) : "Digite um template para visualizar aqui."}</p>
      </section>
    </form>
  );
}
