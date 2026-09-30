"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getUserAndClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
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
  redirect("/dashboard");
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
  redirect("/dashboard");
}

export async function deleteOffer(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) redirect("/dashboard?error=delete");
  const { error } = await supabase.from("offers").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/dashboard/ofertas/${id}/editar?error=delete`);
  redirect("/dashboard");
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
