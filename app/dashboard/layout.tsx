import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireUserContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await requireUserContext();

  return (
    <DashboardShell
      profile={{
        email: user.email,
        role: profile.role || "user",
        plan: profile.plan || "none",
        planStatus: profile.plan_status || "trial",
        expiresAt: profile.expires_at || null,
      }}
    >
      {children}
    </DashboardShell>
  );
}
