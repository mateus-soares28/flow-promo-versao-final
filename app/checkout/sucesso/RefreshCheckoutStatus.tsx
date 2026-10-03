"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefreshCheckoutStatus({ active, redirectAfterConfirm = false }: { active: boolean; redirectAfterConfirm?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (redirectAfterConfirm) {
      const timer = window.setTimeout(() => router.replace("/login?purchase=confirmed"), 3500);
      return () => window.clearTimeout(timer);
    }
    if (!active) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 24) window.clearInterval(timer);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [active, redirectAfterConfirm, router]);

  if (redirectAfterConfirm) {
    return <div className="mt-5 space-y-2">
      <p className="text-xs text-slate-500">Redirecionando para o login...</p>
      <Link href="/login?purchase=confirmed" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800">Ir para o login agora</Link>
    </div>;
  }

  if (!active) return null;
  return <button type="button" onClick={() => router.refresh()} className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:border-slate-400 hover:text-slate-950">Atualizar status</button>;
}
