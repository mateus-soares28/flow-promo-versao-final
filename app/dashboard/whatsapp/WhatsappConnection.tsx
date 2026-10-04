"use client";

import { useState } from "react";
import Image from "next/image";
import { connectWhatsapp, disconnectWhatsapp } from "@/app/actions/whatsapp";
import {
  useWhatsapp,
  whatsappLabel,
} from "@/components/dashboard/WhatsappProvider";

export default function WhatsappConnection() {
  const connection = useWhatsapp();
  const { state: status, qrCode, phone } = connection;
  const [message, setMessage] = useState("");
  const [isPending, setPending] = useState(false);

  async function run(action: typeof connectWhatsapp) {
    if (isPending) return;
    setMessage("");
    setPending(true);
    try {
      const result = await action();
      if (!result.ok) {
        setMessage(result.error || "Não foi possível concluir a ação.");
        return;
      }
      connection.update({
        state: result.state || "disconnected",
        qrCode: result.qrCode ?? null,
        phone: result.phone ?? null,
      });
    } catch {
      setMessage("Não foi possível concluir a ação. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  const connected = status === "connected";
  return (
    <section className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Sessão WhatsApp
          </p>
          <h2 className="mt-2 text-xl font-extrabold">Conecte seu aparelho</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Leia o QR Code pelo WhatsApp em Aparelhos conectados. Cada conta
            FlowPromos recebe uma sessão própria.
          </p>
        </div>
        <span
          role="status"
          className={`rounded-full px-3 py-1 text-xs font-bold ${connected ? "bg-emerald-50 text-emerald-700" : status === "connecting" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
        >
          {whatsappLabel(status)}
        </span>
      </div>

      {(message || connection.error) && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
        >
          {message || connection.error}
        </p>
      )}
      {connected ? (
        <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          WhatsApp conectado{phone ? `: ${phone}` : ""}. Você já pode
          sincronizar grupos e preparar envios.
        </div>
      ) : status === "connecting" && qrCode ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-5">
          <Image
            src={qrCode}
            alt="QR Code para conectar o WhatsApp"
            width={256}
            height={256}
            unoptimized
            className="h-auto w-64 max-w-full rounded-lg bg-white object-contain"
          />
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">
            Abra WhatsApp no celular, entre em{" "}
            <strong>Aparelhos conectados</strong> e escaneie este código.
          </p>
        </div>
      ) : (
        status === "connecting" && (
          <p className="mt-6 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
            A Evolution API iniciou a sessão. Atualizando estado para buscar o
            QR Code…
          </p>
        )
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {!connected && (
          <button
            type="button"
            disabled={isPending || connection.checking}
            onClick={() => run(connectWhatsapp)}
            className="min-h-11 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isPending
              ? "Aguarde…"
              : status === "connecting"
                ? "Atualizar QR Code"
                : "Conectar WhatsApp"}
          </button>
        )}
        <button
          type="button"
          disabled={isPending || connection.checking}
          onClick={() => {
            void connection.refresh();
          }}
          className="min-h-11 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 disabled:opacity-50"
        >
          {connection.checking ? "Verificando…" : "Verificar conexão"}
        </button>
        {(connected || status === "connecting") && (
          <button
            disabled={isPending}
            onClick={() => run(disconnectWhatsapp)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 hover:border-slate-400 disabled:opacity-50"
          >
            Desconectar
          </button>
        )}
      </div>
    </section>
  );
}
