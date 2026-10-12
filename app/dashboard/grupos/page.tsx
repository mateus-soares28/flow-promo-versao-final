import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import GroupsClient, { type GroupRow } from "./GroupsClient";

export const dynamic = "force-dynamic";

type Props = { searchParams: { error?: string; created?: string; deleted?: string; synced?: string; skipped?: string; updated?: string } };

export default async function GroupsPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: groups, error: groupsError }, { data: profile }, { data: session }, { data: growth }] = await Promise.all([
    supabase.from("affiliate_groups").select("id,name,group_id,segment,is_active,members_count,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
    supabase.from("whatsapp_sessions").select("status").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.rpc("get_group_growth_24h").maybeSingle(),
  ]);
  const { data: plan } = profile?.plan && profile.plan !== "none"
    ? await supabase.from("plans").select("groups_limit").eq("id", profile.plan).maybeSingle()
    : { data: null };
  const growthStats = growth as { current_members: number; previous_members: number; compared_groups: number } | null;

  return <GroupsClient
    groups={(groups || []) as GroupRow[]}
    loadError={Boolean(groupsError)}
    groupLimit={plan?.groups_limit && plan.groups_limit > 0 ? plan.groups_limit : null}
    whatsappConnected={session?.status === "connected"}
    growth={growthStats?.compared_groups && growthStats.previous_members > 0 ? { current: growthStats.current_members, previous: growthStats.previous_members, groups: growthStats.compared_groups } : null}
    feedback={searchParams}
  />;
}
