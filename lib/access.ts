type ProfileAccess = { role?: string | null; plan_status?: string | null; expires_at?: string | null } | null;

export function hasActivePlan(profile: ProfileAccess) {
  if (profile?.role === "admin") return true;
  if (profile?.plan_status !== "active") return false;
  return !profile.expires_at || new Date(profile.expires_at).getTime() > Date.now();
}
