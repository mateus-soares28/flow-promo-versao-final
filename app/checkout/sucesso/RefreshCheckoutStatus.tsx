"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefreshCheckoutStatus({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 12) window.clearInterval(timer);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [active, router]);

  if (!active) return null;
  return <button type="button" onClick={() => router.refresh()} className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:border-slate-400 hover:text-slate-950">Atualizar status</button>;
}
