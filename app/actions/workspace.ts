"use server";

import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActivePlan } from "@/lib/access";

async function getUserAndClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/login?error=email_not_confirmed");
  const { data: profile } = await supabase.from("profiles").select("role,plan_status,expires_at").eq("id", user.id).maybeSingle();
  if (!hasActivePlan(profile)) redirect("/planos?access=subscription_required");
  return { supabase, user };
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function createOffer(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const title = String(formData.get("title") || "").trim();
  const store = String(formData.get("store") || "").trim();
  const original = Number(String(formData.get("original_price") || "").replace(",", "."));
  const promo = Number(String(formData.get("promo_price") || "").replace(",", "."));
  const affiliateUrl = String(formData.get("affiliate_url") || "").trim();
  const originalUrl = String(formData.get("original_url") || affiliateUrl).trim();
  const category = String(formData.get("category") || "").trim();
  const coupon = String(formData.get("coupon") || "").trim();

  if (!title || title.length > 200 || !store || store.length > 80 || !Number.isFinite(original) || !Number.isFinite(promo) || original <= promo || promo <= 0 || !validHttpUrl(affiliateUrl) || !validHttpUrl(originalUrl)) {
    redirect("/dashboard/ofertas/nova?error=invalid");
  }

  const { error } = await supabase.from("offers").insert({
    user_id: user.id,
    title,
    store,
    category: category || null,
    original_price: Math.round(original * 100),
    promo_price: Math.round(promo * 100),
    discount_percent: Math.round((1 - promo / original) * 100),
    coupon: coupon || null,
    original_url: originalUrl,
    affiliate_url: affiliateUrl,
    status: "detected",
  });
  if (error) redirect("/dashboard/ofertas/nova?error=save");
  redirect("/dashboard?tab=promocoes");
}

export async function updateOffer(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const store = String(formData.get("store") || "").trim();
  const original = Number(String(formData.get("original_price") || "").replace(",", "."));
  const promo = Number(String(formData.get("promo_price") || "").replace(",", "."));
  const affiliateUrl = String(formData.get("affiliate_url") || "").trim();
  const originalUrl = String(formData.get("original_url") || affiliateUrl).trim();
  const category = String(formData.get("category") || "").trim();
  const coupon = String(formData.get("coupon") || "").trim();
  if (!Number.isSafeInteger(id) || !title || title.length > 200 || !store || store.length > 80 || !Number.isFinite(original) || !Number.isFinite(promo) || original <= promo || promo <= 0 || !validHttpUrl(affiliateUrl) || !validHttpUrl(originalUrl)) {
    redirect(`/dashboard/ofertas/${id}/editar?error=invalid`);
  }

  const { error } = await supabase.from("offers").update({
    title,
    store,
    category: category || null,
    original_price: Math.round(original * 100),
    promo_price: Math.round(promo * 100),
    discount_percent: Math.round((1 - promo / original) * 100),
    coupon: coupon || null,
    original_url: originalUrl,
    affiliate_url: affiliateUrl,
  }).eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/dashboard/ofertas/${id}/editar?error=save`);
  redirect("/dashboard?tab=promocoes");
}

export async function deleteOffer(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) redirect("/dashboard?tab=promocoes&error=delete");
  const { error } = await supabase.from("offers").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/dashboard/ofertas/${id}/editar?error=delete`);
  redirect("/dashboard?tab=promocoes");
}

export async function createGroup(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const name = String(formData.get("name") || "").trim();
  const groupId = String(formData.get("group_id") || "").trim();
  const segment = String(formData.get("segment") || "Geral").trim();
  if (!name || name.length > 100 || !/^\d{5,30}@g\.us$/.test(groupId)) redirect("/dashboard/grupos?error=invalid");

  const { error } = await supabase.from("affiliate_groups").insert({ user_id: user.id, name, group_id: groupId, segment });
  if (error) redirect("/dashboard/grupos?error=save");
  redirect("/dashboard/grupos?created=1");
}

const validStores = new Set(["all", "shopee", "amazon", "magalu", "mercadolivre", "aliexpress"]);

export async function createSegment(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const name = String(formData.get("name") || "").trim();
  const store = String(formData.get("store") || "all");
  const keywords = String(formData.get("keywords") || "").trim();
  const minDiscount = Number(formData.get("min_discount") || 15);
  const minScore = Number(formData.get("min_score") || 60);

  if (!name || name.length > 80 || !keywords || keywords.length > 500 || !validStores.has(store)
    || !Number.isInteger(minDiscount) || minDiscount < 0 || minDiscount > 100
    || !Number.isInteger(minScore) || minScore < 0 || minScore > 100) {
    redirect("/dashboard/segmentos?error=invalid");
  }

  const { error } = await supabase.from("segments").insert({
    user_id: user.id, name, store, keywords,
    min_discount_percentage: minDiscount,
    min_quality_score: minScore,
  });
  if (error) redirect("/dashboard/segmentos?error=save");
  redirect("/dashboard/segmentos?created=1");
}

export async function toggleSegment(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = Number(formData.get("id"));
  const isActive = formData.get("is_active") === "true";
  if (!Number.isSafeInteger(id) || id <= 0) redirect("/dashboard/segmentos?error=invalid");
  const { error } = await supabase.from("segments").update({ is_active: !isActive }).eq("id", id).eq("user_id", user.id);
  if (error) redirect("/dashboard/segmentos?error=save");
  redirect("/dashboard/segmentos?updated=1");
}

export async function deleteSegment(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) redirect("/dashboard/segmentos?error=invalid");
  const { error } = await supabase.from("segments").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect("/dashboard/segmentos?error=delete");
  redirect("/dashboard/segmentos?deleted=1");
}

export async function saveMessageTemplate(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const title = String(formData.get("title") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!title || title.length > 100 || !message || message.length > 4000) {
    redirect("/dashboard/mensagens?error=invalid");
  }
  const { error } = await supabase.from("message_templates").insert({ user_id: user.id, title, message });
  if (error) redirect("/dashboard/mensagens?error=save");
  redirect("/dashboard/mensagens?saved=1");
}

export async function deleteMessageTemplate(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) redirect("/dashboard/mensagens?error=delete");
  const { error } = await supabase.from("message_templates").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect("/dashboard/mensagens?error=delete");
  redirect("/dashboard/mensagens?deleted=1");
}

const integrationFields = {
  shopee: ["tracking_id", "partner_id", "api_key", "api_secret"],
  amazon: ["tracking_id", "store_id", "api_key", "api_secret"],
  mercadolivre: ["tracking_id", "app_id", "api_key", "api_secret"],
} as const;

function encryptCredentials(value: Record<string, string>) {
  const secret = process.env.INTEGRATION_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Defina INTEGRATION_ENCRYPTION_KEY no servidor.");
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return `v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${ciphertext.toString("hex")}`;
}

export async function saveIntegrationCredentials(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const provider = String(formData.get("provider") || "");
  if (!(provider in integrationFields)) redirect("/dashboard/integracoes?error=invalid");
  const fields = integrationFields[provider as keyof typeof integrationFields];
  const credentials = Object.fromEntries(fields.map((key) => [key, String(formData.get(key) || "").trim()]));
  if (!credentials.tracking_id || !credentials.api_key || !credentials.api_secret) redirect("/dashboard/integracoes?error=invalid");
  let encryptedCredentials: string;
  try {
    encryptedCredentials = encryptCredentials(credentials);
  } catch {
    redirect("/dashboard/integracoes?error=config");
  }
  const { error } = await supabase.from("integration_connections").upsert({
    user_id: user.id,
    provider,
    encrypted_credentials: encryptedCredentials,
    status: "disconnected",
    last_error: null,
  }, { onConflict: "user_id,provider" });
  if (error) redirect("/dashboard/integracoes?error=save");
  redirect("/dashboard/integracoes?saved=1");
}

export async function removeIntegrationCredentials(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const provider = String(formData.get("provider") || "");
  if (!(provider in integrationFields)) redirect("/dashboard/integracoes?error=invalid");
  const { error } = await supabase.from("integration_connections").delete().eq("user_id", user.id).eq("provider", provider);
  if (error) redirect("/dashboard/integracoes?error=delete");
  redirect("/dashboard/integracoes?deleted=1");
}

export async function deleteGroup(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) redirect("/dashboard/grupos?error=invalid");
  const { error } = await supabase.from("affiliate_groups").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect("/dashboard/grupos?error=delete");
  redirect("/dashboard/grupos?deleted=1");
}

export async function scheduleDispatch(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const offerId = Number(formData.get("offer_id"));
  const groupId = Number(formData.get("group_id"));
  if (!Number.isSafeInteger(offerId) || !Number.isSafeInteger(groupId)) redirect(`/dashboard/disparos/novo?offer=${offerId}&error=dispatch`);

  const scheduleInput = String(formData.get("scheduled_for") || "");
  const scheduledFor = scheduleInput ? new Date(`${scheduleInput}:00-03:00`) : new Date();
  if (Number.isNaN(scheduledFor.getTime())) redirect(`/dashboard/disparos/novo?offer=${offerId}&error=dispatch`);

  const [{ data: offer }, { data: group }] = await Promise.all([
    supabase.from("offers").select("title,store,promo_price,coupon,affiliate_url").eq("id", offerId).eq("user_id", user.id).single(),
    supabase.from("affiliate_groups").select("id").eq("id", groupId).eq("user_id", user.id).eq("is_active", true).single(),
  ]);
  if (!offer || !group) redirect(`/dashboard/disparos/novo?offer=${offerId}&error=dispatch`);

  const message = String(formData.get("message") || "").trim() || [
    `🔥 ${offer.title}`,
    `${offer.store} · R$ ${(offer.promo_price / 100).toFixed(2).replace(".", ",")}`,
    offer.coupon ? `Cupom: ${offer.coupon}` : "",
    offer.affiliate_url,
  ].filter(Boolean).join("\n");
  if (message.length > 4000) redirect(`/dashboard/disparos/novo?offer=${offerId}&error=dispatch`);

  const { error } = await supabase.from("dispatches").insert({
    user_id: user.id,
    offer_id: offerId,
    group_id: groupId,
    message_content: message,
    status: "pending",
    scheduled_for: scheduledFor.toISOString(),
  });
  if (error) redirect(`/dashboard/disparos/novo?offer=${offerId}&error=dispatch`);
  redirect("/dashboard/disparos?scheduled=1");
}

export async function retryDispatch(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) redirect("/dashboard/disparos?error=retry");
  const { error } = await supabase.from("dispatches").update({
    status: "pending",
    error_message: null,
    scheduled_for: new Date().toISOString(),
  }).eq("id", id).eq("user_id", user.id).eq("status", "failed");
  if (error) redirect("/dashboard/disparos?error=retry");
  redirect("/dashboard/disparos?retried=1");
}
