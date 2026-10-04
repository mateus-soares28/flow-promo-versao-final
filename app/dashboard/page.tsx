import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DashboardClient, { type OfferRecord } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("id,title,store,category,original_price,promo_price,discount_percent,coupon,free_shipping,verified_seller,quality_score,original_url,affiliate_url,image_url,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <DashboardClient initialOffers={(data || []) as OfferRecord[]} loadError={error?.message} />;
}
