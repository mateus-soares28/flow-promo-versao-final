"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Circle,
  CreditCard,
  Layers3,
  MessageSquare,
  Send,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  useWhatsapp,
  whatsappLabel,
} from "@/components/dashboard/WhatsappProvider";

type Props = {
  name: string;
  profile: {
    plan: string;
    plan_status: string;
    expires_at: string | null;
  } | null;
  period: "weekly" | "monthly";
  offers: number | null;
  segments: number | null;
  groups: number | null;
  marketplaceConnected: boolean;
  dispatches: {
    id: number;
    message_content: string;
    scheduled_for: string;
    status: string;
  }[];
  dispatchError: boolean;
  loadError: boolean;
};

const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
const link =
  "inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-violet-700 transition hover:text-violet-900";

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  detail: string;
}) {
  return (
    <>
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Icon size={16} aria-hidden="true" />
        {label}
      </p>
      <div className="mt-3 text-2xl font-extrabold tracking-tight">{value}</div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </>
  );
}

export default function OverviewClient(props: Props) {
  const whatsapp = useWhatsapp();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const active =
    props.profile?.plan !== "none" &&
    props.profile?.plan_status === "active" &&
    (!props.profile.expires_at ||
      new Date(props.profile.expires_at).getTime() > Date.now());
  const plan = props.profile
    ? (
        {
          none: "Nenhum plano",
          essencial: "Essencial",
          pro: "Pro",
          expert: "Expert",
          anual: "Anual",
        } as Record<string, string>
      )[props.profile.plan] || props.profile.plan
    : "Indisponível";
  const remaining = active
    ? props.profile?.expires_at
      ? Math.max(
          0,
          Math.ceil(
            (new Date(props.profile.expires_at).getTime() - Date.now()) /
              86400000,
          ),
        )
      : "—"
    : 0;
  const steps = [
    {
      title: "Assista ao tutorial completo",
      detail: "Guia de configuração em preparação",
      href: "/dashboard/tutorial",
      done: false,
    },
    {
      title: "Conecte seu WhatsApp",
      detail: "Leia o QR Code para ativar os disparos",
      done: whatsapp.state === "connected",
    },
    {
      title: "Conecte um marketplace",
      detail: "Mercado Livre, Amazon ou Shopee",
      href: "/dashboard/integracoes",
      done: props.marketplaceConnected,
    },
    {
      title: "Crie seu primeiro grupo de destino",
      detail: "Escolha o grupo que vai receber as ofertas",
      href: "/dashboard/grupos",
      done: (props.groups ?? 0) > 0,
    },
    {
      title: "Monte sua primeira busca por palavra-chave",
      detail: "Ex.: nicho “Ferramentas” + palavra “Furadeira”",
      href: "/dashboard/segmentos",
      done: (props.segments ?? 0) > 0,
    },
  ];

  return (
    <main
      className="overview-page min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9"
      aria-busy={pending}
    >
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Olá, {props.name}
      </h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Aqui está o resumo da sua conta FlowPromos.
      </p>
      {props.loadError && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"
        >
          Alguns dados não puderam ser carregados. Atualize a página para tentar
          novamente.
        </p>
      )}

      <section
        aria-label="Resumo da conta"
        className="mt-8 grid gap-5 md:grid-cols-3 lg:gap-6"
      >
        <button
          type="button"
          onClick={whatsapp.openConnection}
          aria-label={`WhatsApp ${whatsappLabel(whatsapp.state)}; gerenciar conexão`}
          className={`${card} text-left transition hover:border-slate-400`}
        >
          <Metric
            icon={MessageSquare}
            label="WhatsApp"
            value={
              <span
                className={`flex items-center gap-2 text-xl ${whatsapp.state === "connected" ? "text-emerald-700" : whatsapp.state === "disconnected" ? "text-rose-600" : "text-slate-600"}`}
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-current"
                />
                {whatsappLabel(whatsapp.state)}
              </span>
            }
            detail={
              whatsapp.error
                ? "Conexão não confirmada. Clique para verificar."
                : "Clique para abrir a conexão"
            }
          />
        </button>
        <Link
          href="/planos"
          className={`${card} transition hover:border-slate-400`}
        >
          <Metric
            icon={CreditCard}
            label="Plano atual"
            value={plan}
            detail={`Status: ${!props.profile ? "Indisponível" : props.profile.plan === "none" ? "Sem assinatura" : active ? "Ativo" : ({ trial: "Em avaliação", cancelled: "Cancelado", expired: "Expirado" } as Record<string, string>)[props.profile.plan_status] || "Expirado"}`}
          />
        </Link>
        <div className={card}>
          <Metric
            icon={Activity}
            label="Dias restantes"
            value={props.profile ? remaining : "—"}
            detail={
              !props.profile
                ? "Não foi possível consultar"
                : active
                  ? props.profile.expires_at
                    ? "Até o fim do período atual"
                    : "Plano sem data de expiração"
                  : "Nenhuma assinatura ativa"
            }
          />
        </div>
      </section>

      <section
        aria-label="Resultados por marketplace"
        className="mt-8 grid gap-6 xl:grid-cols-3"
      >
        <article className={`${card} xl:col-span-2`}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div>
              <h2 className="text-sm font-bold">Desempenho por marketplace</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Cliques e conversões registrados pelas suas ofertas.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="sr-only" htmlFor="overview-period">
                Período do resumo
              </label>
              <select
                id="overview-period"
                value={props.period}
                disabled={pending}
                onChange={(event) =>
                  startTransition(() =>
                    router.replace(`/dashboard?period=${event.target.value}`, {
                      scroll: false,
                    }),
                  )
                }
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
              <Link href="/dashboard?tab=promocoes" className={link}>
                Ver ofertas <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="mt-4 flex min-h-56 items-center justify-center rounded-2xl bg-slate-50 p-6 text-center text-xs leading-6 text-slate-500">
            O rastreamento de cliques e conversões ainda não está disponível.
          </div>
        </article>
        <article className={card}>
          <h2 className="text-sm font-bold">Comissões geradas</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Por marketplace, conforme conversões confirmadas.
          </p>
          <div className="mt-4 flex min-h-56 items-center justify-center rounded-2xl bg-slate-50 p-6 text-center text-xs leading-6 text-slate-500">
            A integração de comissões ainda não está disponível.
          </div>
        </article>
      </section>

      <section
        aria-label="Resumo da operação"
        className="mt-8 grid gap-6 md:grid-cols-3"
      >
        <Link
          href="/dashboard?tab=promocoes"
          className={`${card} transition hover:border-slate-400`}
        >
          <Metric
            icon={Tag}
            label="Ofertas detectadas"
            value={props.offers ?? "—"}
            detail={`Total nos últimos ${props.period === "weekly" ? "7" : "30"} dias`}
          />
        </Link>
        <Link
          href="/dashboard/segmentos"
          className={`${card} transition hover:border-slate-400`}
        >
          <Metric
            icon={Layers3}
            label="Segmentos"
            value={props.segments ?? "—"}
            detail="Configurados"
          />
        </Link>
        <Link
          href="/dashboard/grupos"
          className={`${card} transition hover:border-slate-400`}
        >
          <Metric
            icon={Users}
            label="Grupos"
            value={props.groups ?? "—"}
            detail="Ativos para receber ofertas"
          />
        </Link>
      </section>

      <section
        aria-label="Configuração e próximos envios"
        className="mt-8 grid items-start gap-6 xl:grid-cols-2"
      >
        <article className={card}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-bold">Primeiros passos</h2>
            <p className="text-xs text-slate-500">
              {steps.filter((step) => step.done).length} de 5 concluídos
            </p>
          </div>
          <ul className="my-4 space-y-2">
            {steps.map((step) => {
              const content = (
                <>
                  <span
                    className={`mt-0.5 shrink-0 ${step.done ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {step.done ? (
                      <CheckCircle2 size={19} aria-hidden="true" />
                    ) : (
                      <Circle size={19} aria-hidden="true" />
                    )}
                  </span>
                  <span>
                    <span
                      className={`block text-sm ${step.done ? "text-slate-500 line-through" : "font-medium"}`}
                    >
                      {step.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {step.detail}
                    </span>
                    <span className="sr-only">
                      {step.done ? "Concluído" : "Pendente"}
                    </span>
                  </span>
                </>
              );
              const className = `flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-slate-50 ${!step.href && !step.done ? "bg-slate-50" : ""}`;
              return (
                <li key={step.title}>
                  {step.href ? (
                    <Link href={step.href} className={className}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={whatsapp.openConnection}
                      className={className}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={whatsapp.openConnection}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <MessageSquare size={16} aria-hidden="true" />
              {whatsapp.state === "connected"
                ? "Gerenciar WhatsApp"
                : "Conectar WhatsApp"}
            </button>
          </div>
        </article>
        <article className={card}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold">Próximos disparos</h2>
            <Link href="/dashboard/disparos" className={link}>
              Ver fila
            </Link>
          </div>
          {props.dispatchError ? (
            <p className="py-16 text-center text-sm text-slate-500">
              Não foi possível carregar os próximos disparos.
            </p>
          ) : props.dispatches.length ? (
            <ul className="divide-y divide-slate-100">
              {props.dispatches.map((dispatch) => (
                <li key={dispatch.id} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <time
                      dateTime={dispatch.scheduled_for}
                      className="text-xs font-semibold"
                    >
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                        timeZone: "America/Sao_Paulo",
                      }).format(new Date(dispatch.scheduled_for))}
                    </time>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800">
                      {dispatch.status === "processing"
                        ? "Enviando"
                        : "Na fila"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {dispatch.message_content}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center py-8 text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Send size={21} aria-hidden="true" />
              </span>
              <p className="text-sm text-slate-500">
                Nenhum disparo agendado no momento.
              </p>
              <Link href="/dashboard?tab=promocoes" className={`${link} mt-2`}>
                Selecionar ofertas para disparar{" "}
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
