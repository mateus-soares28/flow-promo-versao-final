import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import WhatsappConnection from "./WhatsappConnection";

export const dynamic = "force-dynamic";

export default async function WhatsappPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("whatsapp_sessions")
    .select("status,phone,qr_code_url")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return <main className="min-h-[calc(100vh-68px)] bg-[#f8fafc] px-5 py-8 text-slate-950 sm:px-8">
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-950">← Voltar ao dashboard</Link>
      <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.04em]">Integrações</h1>
      <p className="mt-2 text-sm text-slate-500">Gerencie conexão individual do WhatsApp com Evolution API.</p>
      <WhatsappConnection initialStatus={data?.status || "disconnected"} initialQrCode={data?.qr_code_url || null} initialPhone={data?.phone || null} />
    </div>
  </main>;
}
