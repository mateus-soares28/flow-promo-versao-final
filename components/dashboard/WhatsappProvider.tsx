"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { refreshWhatsappState } from "@/app/actions/whatsapp";

type Connection = {
  state: string;
  qrCode: string | null;
  phone: string | null;
};
type WhatsappContextValue = Connection & {
  error: string;
  checking: boolean;
  openConnection: () => void;
  refresh: () => Promise<void>;
  update: (connection: Connection) => void;
};

const WhatsappContext = createContext<WhatsappContextValue | null>(null);

export function WhatsappProvider({
  children,
  openConnection,
}: {
  children: React.ReactNode;
  openConnection: () => void;
}) {
  const [connection, setConnection] = useState<Connection>({
    state: "checking",
    qrCode: null,
    phone: null,
  });
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const busy = useRef(false);
  const revision = useRef(0);
  const mounted = useRef(false);

  const update = useCallback((value: Connection) => {
    revision.current += 1;
    setConnection(value);
    setError("");
    setChecking(false);
  }, []);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const version = revision.current;
    setChecking(true);
    try {
      const result = await refreshWhatsappState();
      if (!mounted.current || version !== revision.current) return;
      if (result.ok) {
        setConnection({
          state: result.state,
          qrCode: result.qrCode ?? null,
          phone: result.phone ?? null,
        });
        setError("");
      } else {
        setConnection((previous) => ({ ...previous, state: "unknown" }));
        setError(result.error);
      }
    } catch {
      if (mounted.current && version === revision.current) {
        setConnection((previous) => ({ ...previous, state: "unknown" }));
        setError("Não foi possível verificar a conexão. Tente novamente.");
      }
    } finally {
      busy.current = false;
      if (mounted.current) setChecking(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const timer = window.setInterval(
      () => {
        if (document.visibilityState === "visible") void refresh();
      },
      connection.state === "connecting" ? 5000 : 30000,
    );
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      mounted.current = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [connection.state, refresh]);

  return (
    <WhatsappContext.Provider
      value={{
        ...connection,
        error,
        checking,
        openConnection,
        refresh,
        update,
      }}
    >
      {children}
    </WhatsappContext.Provider>
  );
}

export function useWhatsapp() {
  const context = useContext(WhatsappContext);
  if (!context) throw new Error("useWhatsapp requires WhatsappProvider");
  return context;
}

export function whatsappLabel(state: string) {
  return (
    (
      {
        connected: "Conectado",
        disconnected: "Desconectado",
        connecting: "Aguardando leitura",
        checking: "Verificando…",
        unknown: "Não verificado",
      } as Record<string, string>
    )[state] || "Não verificado"
  );
}
