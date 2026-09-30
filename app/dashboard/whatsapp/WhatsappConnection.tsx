"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { connectWhatsapp, disconnectWhatsapp, refreshWhatsappState } from "@/app/actions/whatsapp";

type Props = { initialStatus: string; initialQrCode: string | null; initialPhone: string | null };

export default function WhatsappConnection({ initialStatus, initialQrCode, initialPhone }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [qrCode, setQrCode] = useState(initialQrCode);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status !== "connecting") return;
    const timer = window.setInterval(() => {
      void refreshWhatsappState().then((result) => {
        if (!result.ok) return;
        setStatus(result.state);
        setQrCode(result.qrCode ?? null);
        setPhone(result.phone ?? null);
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [status]);

  function run(action: () => Promise<{ ok: boolean; state?: string; qrCode?: string | null; phone?: string | null; error?: string }>) {
    setMessage("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setMessage(result.error || "Não foi possível concluir a ação.");
        return;
      }
      setStatus(result.state || "disconnected");
      setQrCode(result.qrCode ?? null);
      setPhone(result.phone ?? null);
    });
  }

  const connected = status === "connected";
  return <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-8">
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Sessão WhatsApp</p><h2 className="mt-2 text-xl font-extrabold">Conecte seu aparelho</h2><p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">Leia o QR Code pelo WhatsApp em Aparelhos conectados. Cada conta FlowPromos recebe uma sessão própria.</p></div>
      <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${connected ? "bg-emerald-50 text-emerald-700" : status === "connecting" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{connected ? "Conectado" : status === "connecting" ? "Aguardando leitura" : "Desconectado"}</span>
    </div>

    {message && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{message}</p>}
    {connected ? <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">WhatsApp conectado{phone ? `: ${phone}` : ""}. Você já pode sincronizar grupos e preparar envios.</div> : qrCode ? <div className="mt-6 flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-5"><Image src={qrCode} alt="QR Code para conectar o WhatsApp" width={256} height={256} unoptimized className="h-64 w-64 rounded-lg bg-white object-contain" /><p className="mt-4 text-center text-xs leading-5 text-slate-500">Abra WhatsApp no celular, entre em <strong>Aparelhos conectados</strong> e escaneie este código.</p></div> : status === "connecting" && <p className="mt-6 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">A Evolution API iniciou a sessão. Atualizando estado para buscar o QR Code…</p>}

    <div className="mt-6 flex flex-wrap gap-3">
      <button disabled={isPending} onClick={() => run(connectWhatsapp)} className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">{isPending ? "Aguarde…" : connected ? "Gerar novo QR Code" : status === "connecting" ? "Atualizar QR Code" : "Conectar WhatsApp"}</button>
      {(connected || status === "connecting") && <button disabled={isPending} onClick={() => run(disconnectWhatsapp)} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 hover:border-slate-400 disabled:opacity-50">Desconectar</button>}
    </div>
  </section>;
}
