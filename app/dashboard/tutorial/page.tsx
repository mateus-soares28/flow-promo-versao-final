import Link from "next/link";
import { ArrowRight, CheckCircle2, CirclePlay } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { requireUser } from "@/lib/auth";

const modules = [
  { title: "Como conectar seu WhatsApp via QR Code", detail: "Conecte seu aparelho com segurança e acompanhe o status da sessão.", minutes: "3 min", href: "/dashboard/whatsapp", action: "Conectar agora" },
  { title: "Cadastre suas tags de afiliado", detail: "Registre credenciais das plataformas que usa no FlowPromos.", minutes: "4 min", href: "/dashboard/integracoes", action: "Abrir integrações" },
  { title: "Organize grupos e regras de postagem", detail: "Cadastre os grupos que receberão suas ofertas.", minutes: "5 min", href: "/dashboard/grupos", action: "Configurar grupos" },
  { title: "Configure segmentos por palavras-chave", detail: "Agrupe termos e filtros para organizar seu nicho.", minutes: "4 min", href: "/dashboard/segmentos", action: "Criar segmento" },
  { title: "Use cupons nas ofertas", detail: "Acompanhe cupons cadastrados junto de cada promoção.", minutes: "3 min", href: "/dashboard/cupons", action: "Ver cupons" },
  { title: "Programe e acompanhe seus envios", detail: "Revise a fila e o histórico de publicação nos grupos.", minutes: "6 min", href: "/dashboard/disparos", action: "Abrir fila" },
];

export default async function TutorialPage() {
  await requireUser();
  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <DashboardPageHeader eyebrow="Primeiros passos" title="Tutorial do FlowPromos" description="Configure sua operação em seis etapas. Cada botão leva diretamente à ferramenta correspondente." />
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {modules.map((module, index) => (
            <li key={module.title} className="flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600"><CirclePlay size={16} className="text-violet-600" aria-hidden="true" /> Módulo {index + 1}</span>
                <span className="text-xs text-slate-500">{module.minutes}</span>
              </div>
              <h2 className="mt-4 text-base font-bold leading-6">{index + 1}. {module.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{module.detail}</p>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700"><CheckCircle2 size={15} aria-hidden="true" /> Guia prático</span>
                <Link href={module.href} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-950 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">{module.action}<ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
