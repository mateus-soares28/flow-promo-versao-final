import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEvolutionText } from "@/lib/evolution/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: pending, error } = await admin
    .from("dispatches")
    .select("id,user_id,group_id,message_content")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(20);
  if (error) return NextResponse.json({ error: "Could not load dispatch queue." }, { status: 500 });

  let sent = 0;
  let failed = 0;
  for (const dispatch of pending || []) {
    const { data: claimed } = await admin
      .from("dispatches")
      .update({ status: "processing" })
      .eq("id", dispatch.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    try {
      const [{ data: group }, { data: session }] = await Promise.all([
        admin.from("affiliate_groups").select("group_id").eq("id", dispatch.group_id).eq("user_id", dispatch.user_id).single(),
        admin.from("whatsapp_sessions").select("session_name,status").eq("user_id", dispatch.user_id).eq("status", "connected").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (!group || !session) throw new Error("Missing destination or connected WhatsApp session.");
      await sendEvolutionText(session.session_name, group.group_id, dispatch.message_content);
      const { error: updateError } = await admin.from("dispatches").update({ status: "sent", sent_at: new Date().toISOString(), error_message: null }).eq("id", dispatch.id);
      if (updateError) throw updateError;
      sent += 1;
    } catch (dispatchError) {
      console.error("Dispatch failed", { dispatchId: dispatch.id, error: dispatchError instanceof Error ? dispatchError.message : "Unknown error" });
      await admin.from("dispatches").update({ status: "failed", error_message: "Falha ao enviar. Confira a conexão do WhatsApp e tente novamente." }).eq("id", dispatch.id);
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}
