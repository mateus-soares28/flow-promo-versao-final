"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  connectEvolutionInstance,
  createEvolutionInstance,
  fetchEvolutionGroups,
  getEvolutionConnection,
  logoutEvolutionInstance,
} from "@/lib/evolution/server";

type ActionResult = { ok: true; state: string; qrCode?: string | null; phone?: string | null } | { ok: false; error: string };

function stateLabel(state: string): "connected" | "connecting" | "disconnected" {
  const normalized = state.toLowerCase();
  if (["open", "connected", "ready"].includes(normalized)) return "connected";
  if (["connecting", "qrcode", "qr", "starting"].includes(normalized)) return "connecting";
  return "disconnected";
}

async function getCurrentUserAndSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Entre na sua conta para conectar o WhatsApp." } as const;
  const { data: session, error } = await supabase
    .from("whatsapp_sessions")
    .select("id,session_name,status,phone,qr_code_url")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { error: "Não foi possível carregar sua sessão WhatsApp." } as const;
  return { supabase, user, session } as const;
}

function makeInstanceName(userId: string) {
  const prefix = (process.env.EVOLUTION_INSTANCE_NAME || "flowpromos").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30) || "flowpromos";
  return `${prefix}${userId.replace(/-/g, "").slice(0, 12)}`;
}

export async function connectWhatsapp(): Promise<ActionResult> {
  const context = await getCurrentUserAndSession();
  if (!context.user || !context.supabase) return { ok: false, error: context.error || "Sessão expirada. Entre novamente." };

  try {
    const sessionName = context.session?.session_name || makeInstanceName(context.user.id);
    let qrCode: string | null = null;
    if (!context.session) {
      const created = await createEvolutionInstance(sessionName);
      const qr = created.qrcode && typeof created.qrcode === "object" ? created.qrcode as Record<string, unknown> : {};
      const qrValue = qr.base64;
      if (typeof qrValue === "string") qrCode = qrValue.startsWith("data:image/") ? qrValue : `data:image/png;base64,${qrValue}`;
    }

    if (!qrCode) {
      const connection = await connectEvolutionInstance(sessionName);
      qrCode = connection.qrCode;
    }

    const { error } = context.session
      ? await context.supabase.from("whatsapp_sessions").update({
          session_name: sessionName,
          status: "connecting",
          qr_code_url: qrCode,
          phone: null,
        }).eq("id", context.session.id)
      : await context.supabase.from("whatsapp_sessions").insert({
          user_id: context.user.id,
          session_name: sessionName,
          status: "connecting",
          qr_code_url: qrCode,
        });
    if (error) throw error;
    return { ok: true, state: "connecting", qrCode };
  } catch {
    return { ok: false, error: "Não foi possível iniciar conexão. Confira a Evolution API e tente novamente." };
  }
}

export async function refreshWhatsappState(): Promise<ActionResult> {
  const context = await getCurrentUserAndSession();
  if (!context.user || !context.supabase) return { ok: false, error: context.error || "Sessão expirada. Entre novamente." };
  if (!context.session) return { ok: true, state: "disconnected" };

  try {
    const connection = await getEvolutionConnection(context.session.session_name);
    const status = stateLabel(connection.state);
    const qrCode = connection.qrCode || context.session.qr_code_url;
    const phone = connection.phone || context.session.phone;
    const { error } = await context.supabase.from("whatsapp_sessions").update({
      status,
      qr_code_url: status === "connected" ? null : qrCode,
      phone,
      last_seen: status === "connected" ? new Date().toISOString() : undefined,
    }).eq("id", context.session.id);
    if (error) throw error;
    return { ok: true, state: status, qrCode: status === "connected" ? null : qrCode, phone };
  } catch {
    return { ok: false, error: "Não foi possível consultar a conexão da Evolution API." };
  }
}

export async function disconnectWhatsapp(): Promise<ActionResult> {
  const context = await getCurrentUserAndSession();
  if (!context.user || !context.supabase) return { ok: false, error: context.error || "Sessão expirada. Entre novamente." };
  if (!context.session) return { ok: true, state: "disconnected" };

  try {
    await logoutEvolutionInstance(context.session.session_name);
    const { error } = await context.supabase.from("whatsapp_sessions").update({
      status: "disconnected",
      phone: null,
      qr_code_url: null,
    }).eq("id", context.session.id);
    if (error) throw error;
    return { ok: true, state: "disconnected" };
  } catch {
    return { ok: false, error: "Não foi possível desconectar o WhatsApp." };
  }
}

export async function syncWhatsappGroups() {
  const context = await getCurrentUserAndSession();
  if (!context.user || !context.supabase) return { ok: false, error: "Entre na sua conta novamente." };
  if (!context.session || context.session.status !== "connected") return { ok: false, error: "Conecte WhatsApp antes de sincronizar grupos." };

  try {
    const groups = await fetchEvolutionGroups(context.session.session_name);
    for (const group of groups) {
      const { data: existing, error: lookupError } = await context.supabase
        .from("affiliate_groups")
        .select("id")
        .eq("user_id", context.user.id)
        .eq("group_id", group.id)
        .limit(1)
        .maybeSingle();
      if (lookupError) throw lookupError;
      const result = existing
        ? await context.supabase.from("affiliate_groups").update({ name: group.name, members_count: group.members, is_active: true }).eq("id", existing.id)
        : await context.supabase.from("affiliate_groups").insert({ user_id: context.user.id, platform: "whatsapp", group_id: group.id, name: group.name, members_count: group.members });
      if (result.error) throw result.error;
    }
    return { ok: true, count: groups.length };
  } catch {
    return { ok: false, error: "Não foi possível sincronizar grupos com a Evolution API." };
  }
}

export async function syncWhatsappGroupsAction(_formData: FormData) {
  const result = await syncWhatsappGroups();
  if (!result.ok) redirect("/dashboard/grupos?error=sync");
  redirect(`/dashboard/grupos?synced=${result.count}`);
}
