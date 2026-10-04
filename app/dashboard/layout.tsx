import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const supabase = await createClient();
  const profileResult = await supabase
    .from("profiles")
    .select("role,plan,plan_status,expires_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <DashboardShell
      profile={{
        email: user.email,
        role: profileResult.data?.role || "user",
        plan: profileResult.data?.plan || "none",
        planStatus: profileResult.data?.plan_status || "trial",
        expiresAt: profileResult.data?.expires_at || null,
      }}
    >
      {children}
    </DashboardShell>
  );
}
