"use client";

import { useMemo, useState } from "react";

type Template = { id: number; title: string; message: string };
type Offer = { title: string; store: string; promoPrice: number; originalPrice: number | null; discount: number | null; coupon: string | null; link: string };

function formatPrice(cents: number | null) {
  return cents === null ? "" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function applyOffer(message: string, offer: Offer) {
  const values: Record<string, string> = {
    "{titulo}": offer.title,
    "{preco_original}": formatPrice(offer.originalPrice),
    "{preco_final}": formatPrice(offer.promoPrice),
    "{desconto}": offer.discount === null ? "" : `${offer.discount}%`,
    "{cupom}": offer.coupon || "",
    "{link}": offer.link,
  };
  return Object.entries(values).reduce((result, [token, value]) => result.replaceAll(token, () => value), message);
}

export default function DispatchMessageField({ offer, templates, defaultMessage }: { offer: Offer; templates: Template[]; defaultMessage: string }) {
  const [message, setMessage] = useState(defaultMessage);
  const preview = useMemo(() => applyOffer(message, offer), [message, offer]);
  function chooseTemplate(id: string) {
    const selected = templates.find((template) => String(template.id) === id);
    setMessage(selected?.message || defaultMessage);
  }

  return <>
    {templates.length > 0 && <label className="block text-sm font-medium">Usar template<select aria-label="Selecionar template" onChange={(event) => chooseTemplate(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="">Mensagem padrão</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}</select></label>}
    <label className="block text-sm font-medium">Mensagem<textarea name="message" maxLength={4000} rows={6} value={preview} onChange={(event) => setMessage(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6" /></label>
  </>;
}
