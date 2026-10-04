import { KeyRound, LockKeyhole } from "lucide-react";
import { removeIntegrationCredentials, saveIntegrationCredentials } from "@/app/actions/workspace";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import SubmitButton from "@/components/dashboard/SubmitButton";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const providers = [
  { id: "shopee", title: "Shopee Afiliados", description: "Tag e credenciais do seu aplicativo Shopee Open Platform.", fields: [["tracking_id", "Tag / tracking ID", "Informe sua tag"], ["partner_id", "App ID / Partner ID", "Opcional conforme a plataforma"], ["api_key", "API Key", "Cole a API Key"], ["api_secret", "API Secret", "Cole a API Secret"]] },
  { id: "amazon", title: "Amazon Creators API", description: "Store ID/tag e credenciais emitidas pelo Associates Central.", fields: [["tracking_id", "Tag / tracking ID", "Informe sua tag"], ["store_id", "App ID / Store ID", "ID da loja"], ["api_key", "API Key", "Cole a API Key"], ["api_secret", "API Secret", "Cole a API Secret"]] },
  { id: "mercadolivre", title: "Mercado Livre", description: "Credenciais do aplicativo para a API de afiliados.", fields: [["tracking_id", "Tag / tracking ID", "Informe sua tag"], ["app_id", "App ID", "ID do aplicativo"], ["api_key", "API Key", "Cole a API Key"], ["api_secret", "API Secret", "Cole a API Secret"]] },
] as const;

export default async function IntegrationsPage({ searchParams }: { searchParams: { error?: string; saved?: string; deleted?: string } }) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: connections } = await supabase.from("integration_connections").select("provider,status,updated_at").eq("user_id", user.id);
  const configured = new Set((connections || []).map((connection) => connection.provider));
  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9"><div className="mx-auto max-w-5xl">
      <DashboardPageHeader eyebrow="Conexões" title="Integrações oficiais" description="Salve suas credenciais com segurança. O status fica como não validado até a integração com cada plataforma ser ativada." />
      {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{searchParams.error === "invalid" ? "Preencha tag, API Key e API Secret." : searchParams.error === "config" ? "Defina a chave de criptografia no ambiente do servidor." : "Não foi possível salvar as credenciais. Tente novamente."}</p>}
      {(searchParams.saved || searchParams.deleted) && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Credenciais atualizadas e armazenadas com criptografia.</p>}
      <div className="mt-6 space-y-4">{providers.map((provider) => <section key={provider.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">{provider.title}</h2><p className="mt-1 text-sm leading-5 text-slate-600">{provider.description}</p></div><span className={`rounded-full px-3 py-1 text-xs font-medium ${configured.has(provider.id) ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{configured.has(provider.id) ? "Credenciais salvas · não validadas" : "Não configurado"}</span></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><form action={saveIntegrationCredentials} className="contents"><input type="hidden" name="provider" value={provider.id} />{provider.fields.map(([name, label, placeholder]) => <label key={name} className="block text-sm font-medium">{label}<input name={name} type={name === "api_secret" || name === "api_key" ? "password" : "text"} autoComplete="off" required={name === "tracking_id" || name === "api_key" || name === "api_secret"} placeholder={placeholder} className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm" /></label>)}<SubmitButton pendingText="Salvando com segurança…" className="bg-slate-950 text-white hover:bg-slate-800 sm:col-span-2"><KeyRound size={15} aria-hidden="true" /> Salvar credenciais</SubmitButton></form>{configured.has(provider.id) && <form action={removeIntegrationCredentials}><input type="hidden" name="provider" value={provider.id} /><SubmitButton pendingText="Removendo…" className="border border-slate-200 bg-white text-rose-700 hover:border-rose-300">Remover credenciais</SubmitButton></form>}</div>
      </section>)}</div>
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-600"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" /> Secrets são criptografados no servidor e não retornam para o navegador. Salvar credenciais não ativa buscas automáticas por si só.</p>
    </div></main>
  );
}
