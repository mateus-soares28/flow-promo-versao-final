import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const supabase = await createClient();
  const [profileResult, whatsappResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("role,plan,expires_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("whatsapp_sessions")
      .select("status")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <DashboardShell
      profile={{
        email: user.email,
        role: profileResult.data?.role || "user",
        plan: profileResult.data?.plan || "essencial",
        expiresAt: profileResult.data?.expires_at || null,
      }}
      whatsappConnected={whatsappResult.data?.status === "connected"}
    >
      {children}
    </DashboardShell>
  );
}
