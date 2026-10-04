import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  Layers3,
  PlaySquare,
  WalletCards,
} from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";

const futureSections = new Set([
  "tutorial",
  "integracoes",
  "segmentos",
  "monitoramento",
  "cupons",
  "mensagens",
  "faturamento",
]);

const sections = {
  tutorial: {
    title: "Tutorial",
    description: "Estamos preparando um guia para configurar seu workspace.",
    icon: PlaySquare,
    actions: [
      { href: "/dashboard/whatsapp", label: "Conectar WhatsApp" },
      { href: "/dashboard/grupos", label: "Organizar grupos" },
    ],
  },
  integracoes: {
    title: "Integrações",
    description: "Reúna e acompanhe os serviços conectados à sua operação.",
    icon: CircleHelp,
    actions: [{ href: "/dashboard/whatsapp", label: "Conectar WhatsApp" }],
  },
  segmentos: {
    title: "Segmentos",
    description: "Organize seus grupos por assunto na área de grupos WhatsApp.",
    icon: Layers3,
    actions: [{ href: "/dashboard/grupos", label: "Abrir grupos" }],
  },
  monitoramento: {
    title: "Monitoramento",
    description: "Acompanhe suas promoções e a atividade da sua operação.",
    icon: CircleHelp,
    actions: [{ href: "/dashboard?tab=promocoes", label: "Ver minhas promoções" }],
  },
  cupons: {
    title: "Cupons",
    description: "A área de cupons está sendo preparada para seu workspace.",
    icon: CircleHelp,
    actions: [{ href: "/dashboard?tab=promocoes", label: "Ver minhas promoções" }],
  },
  mensagens: {
    title: "Mensagens",
    description: "A área de mensagens está sendo preparada para seu workspace.",
    icon: CircleHelp,
    actions: [{ href: "/dashboard/disparos", label: "Ver meus disparos" }],
  },
  faturamento: {
    title: "Faturamento",
    description:
      "Consulte os valores e os ciclos disponíveis na página de planos.",
    icon: WalletCards,
    actions: [{ href: "/planos", label: "Ver planos disponíveis" }],
  },
} as const;

export default async function DashboardSectionPage({
  params,
}: {
  params: { section: string };
}) {
  await requireUser();

  if (!futureSections.has(params.section)) notFound();
  const section = sections[params.section as keyof typeof sections];
  if (!section) notFound();
  const Icon = section.icon;

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-950">
            Painel
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-slate-700">
            {section.title}
          </span>
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:px-12 sm:py-16">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Icon size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
            {section.title}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
            {section.description}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Esta área poderá ser ativada em uma próxima etapa.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {section.actions.map((action) => (
              <Link
                href={action.href}
                key={action.href}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                {action.label} <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Voltar ao meu workspace
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
