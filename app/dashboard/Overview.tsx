import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import OverviewClient from "./OverviewClient";

export default async function Overview({
  user,
  period,
}: {
  user: User;
  period?: string;
}) {
  const selectedPeriod = period === "monthly" ? "monthly" : "weekly";
  const since = new Date(
    Date.now() - (selectedPeriod === "monthly" ? 30 : 7) * 86400000,
  ).toISOString();
  const supabase = await createClient();
  const [profile, offers, segments, groups, integrations, dispatches] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("name,plan,plan_status,expires_at")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("offers")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", since),
      supabase
        .from("segments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("affiliate_groups")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase
        .from("integration_connections")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "connected")
        .in("provider", ["amazon", "shopee", "mercadolivre"]),
      supabase
        .from("dispatches")
        .select("id,message_content,scheduled_for,status")
        .eq("user_id", user.id)
        .in("status", ["pending", "processing"])
        .order("scheduled_for", { ascending: true })
        .limit(5),
    ]);

  return (
    <OverviewClient
      name={
        profile.data?.name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "bem-vindo"
      }
      profile={profile.data}
      period={selectedPeriod}
      offers={offers.error ? null : (offers.count ?? 0)}
      segments={segments.error ? null : (segments.count ?? 0)}
      groups={groups.error ? null : (groups.count ?? 0)}
      marketplaceConnected={
        !integrations.error && (integrations.count ?? 0) > 0
      }
      dispatches={dispatches.data || []}
      dispatchError={!!dispatches.error}
      loadError={[
        profile,
        offers,
        segments,
        groups,
        integrations,
        dispatches,
      ].some((result) => result.error)}
    />
  );
}
