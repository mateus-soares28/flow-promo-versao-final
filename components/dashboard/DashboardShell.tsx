"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BadgePercent,
  ChevronDown,
  CreditCard,
  Home,
  Layers3,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Sun,
  PlaySquare,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { WhatsappProvider, useWhatsapp, whatsappLabel } from "./WhatsappProvider";
import WhatsappConnection from "@/app/dashboard/whatsapp/WhatsappConnection";

type Profile = {
  email?: string;
  role: string;
  plan: string;
  expiresAt: string | null;
  planStatus: string;
};

type DashboardShellProps = {
  children: React.ReactNode;
  profile: Profile;
};

const sections = [
  {
    title: "Painel",
    items: [
      { label: "Visão geral", href: "/dashboard", icon: Home },
      { label: "Tutorial", href: "/dashboard/tutorial", icon: PlaySquare },
    ],
  },
  {
    title: "Operação",
    items: [
      { label: "WhatsApp", href: "/dashboard/whatsapp", icon: MessageSquare },
      { label: "Segmentos", href: "/dashboard/segmentos", icon: Layers3 },
      { label: "Grupos", href: "/dashboard/grupos", icon: Users },
      { label: "Ofertas", href: "/dashboard?tab=promocoes", icon: Tag },
      {
        label: "Monitoramento",
        href: "/dashboard/monitoramento",
        icon: Activity,
      },
      { label: "Disparos", href: "/dashboard/disparos", icon: Send },
      { label: "Cupons", href: "/dashboard/cupons", icon: BadgePercent },
      { label: "Mensagens", href: "/dashboard/mensagens", icon: MessageSquare },
    ],
  },
  {
    title: "Conta",
    items: [
      {
        label: "Faturamento",
        href: "/dashboard/faturamento",
        icon: WalletCards,
      },
      { label: "Integrações", href: "/dashboard/integracoes", icon: Settings2 },
      { label: "Plano", href: "/planos", icon: CreditCard },
    ],
  },
];

function isCurrentRoute(
  pathname: string,
  href: string,
  selectedTab: string | null,
) {
  const path = href.split("?")[0];
  if (path === "/dashboard") {
    if (pathname.startsWith("/dashboard/ofertas")) {
      return href.includes("tab=promocoes");
    }
    const expectedTab = new URLSearchParams(href.split("?")[1] || "").get(
      "tab",
    );
    return pathname === path && selectedTab === expectedTab;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function daysRemaining(expiresAt: string | null, planStatus: string) {
  if (planStatus !== "active") return "Ver planos";
  if (!expiresAt) return "Plano ativo";
  const remaining = new Date(expiresAt).getTime() - Date.now();
  return `${Math.max(0, Math.ceil(remaining / 86_400_000))} ${Math.ceil(remaining / 86_400_000) === 1 ? "dia" : "dias"} restantes`;
}

export default function DashboardShell(props: DashboardShellProps) {
  const [connectionOpen, setConnectionOpen] = useState(false);
  return <WhatsappProvider openConnection={() => setConnectionOpen(true)}>
    <DashboardContent {...props} connectionOpen={connectionOpen} closeConnection={() => setConnectionOpen(false)} />
  </WhatsappProvider>;
}

function DashboardContent({
  children,
  profile,
  connectionOpen,
  closeConnection,
}: DashboardShellProps & { connectionOpen: boolean; closeConnection: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const connectionDialog = useRef<HTMLDialogElement>(null);
  const whatsapp = useWhatsapp();
  const whatsappConnected = whatsapp.state === "connected";
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const previouslyOpen = useRef(false);
  const planLabels: Record<string, string> = {
    none: "Nenhum plano",
    essencial: "Essencial",
    pro: "Pro",
    expert: "Expert",
  };
  const currentPlan = planLabels[profile.plan] || profile.plan;

  useEffect(() => {
    try { setTheme(localStorage.getItem("flowpromos-theme") === "dark" ? "dark" : "light"); } catch { /* Storage may be disabled. */ }
  }, []);

  useEffect(() => {
    if (!connectionOpen) return;
    const dialog = connectionDialog.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [connectionOpen]);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 1023px)");
    function syncSidebar() {
      if (sidebar.current) sidebar.current.inert = mobile.matches && !menuOpen;
    }
    syncSidebar();
    mobile.addEventListener("change", syncSidebar);
    return () => mobile.removeEventListener("change", syncSidebar);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      if (previouslyOpen.current) menuButton.current?.focus();
      previouslyOpen.current = false;
      return;
    }

    previouslyOpen.current = true;
    sidebar.current?.querySelector<HTMLElement>("nav a")?.focus();

    function handleMenuKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !sidebar.current) return;

      const focusable = Array.from(
        sidebar.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.closest("[inert]"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleMenuKeyboard);
    return () => document.removeEventListener("keydown", handleMenuKeyboard);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try { localStorage.setItem("flowpromos-theme", nextTheme); } catch { /* Keep the current theme without persistence. */ }
  }

  return (
    <div data-theme={theme} className="dashboard-theme flex min-h-screen bg-[#f8fafc] text-slate-950">
      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeMenu}
          className="fixed inset-0 z-30 cursor-default bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        ref={sidebar}
        role={menuOpen ? "dialog" : undefined}
        aria-modal={menuOpen ? true : undefined}
        aria-labelledby="workspace-title"
        aria-label="Navegação do workspace"
        className={`fixed inset-y-0 left-0 z-40 flex w-[254px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-1">
          <Link
            href="/dashboard"
            onClick={closeMenu}
            className="flex items-center gap-3 text-[18px] font-extrabold tracking-[-0.04em]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-slate-950 text-white">
              <Zap
                className="h-[18px] w-[18px] fill-white"
                aria-hidden="true"
              />
            </span>
            <span id="workspace-title">FlowPromos</span>
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Fechar menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 lg:hidden"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Menu principal"
          className="mt-9 flex-1 overflow-y-auto pb-4"
        >
          {sections.map(({ title, items }) => (
            <section key={title} aria-label={title} className="mb-6">
              <h2 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
                {title}
              </h2>
              <ul className="space-y-1">
                {items.map(({ label, href, icon: Icon }) => {
                  const active = isCurrentRoute(
                    pathname,
                    href,
                    searchParams.get("tab"),
                  );
                  return (
                    <li key={label}>
                      <Link
                        href={href}
                        onClick={closeMenu}
                        aria-current={active ? "page" : undefined}
                        className={`group flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${active ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                      >
                        <Icon
                          size={16}
                          strokeWidth={1.8}
                          className={
                            active
                              ? "text-white"
                              : "text-slate-500 group-hover:text-slate-800"
                          }
                          aria-hidden="true"
                        />
                        {label}
                      </Link>
                    </li>
                  );
                })}
                {title === "Conta" && profile.role === "admin" && (
                  <li>
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      aria-current={pathname === "/admin" ? "page" : undefined}
                      className={`group flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${pathname === "/admin" ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                    >
                      <ShieldCheck size={16} aria-hidden="true" />
                      Administração
                    </Link>
                  </li>
                )}
              </ul>
            </section>
          ))}
        </nav>

        <div className="border-t border-slate-100 pt-3">
          <Link
            href="/dashboard/tutorial"
            onClick={closeMenu}
            className="flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <LifeBuoy size={16} aria-hidden="true" />
            Tutorial e ajuda
          </Link>
          <details className="group mt-2">
            <summary className="flex min-h-[58px] cursor-pointer list-none items-center gap-3 rounded-xl bg-slate-50 px-3 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 [&::-webkit-details-marker]:hidden">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-extrabold uppercase text-emerald-800">
                {(profile.email?.split("@")[0] || "FP").slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[11px] font-bold text-slate-800">
                  {profile.email || "Sua conta"}
                </span>
                <span className="mt-0.5 block text-[10px] capitalize text-slate-500">
                  {profile.plan === "none" ? currentPlan : `Plano ${currentPlan}`}
                </span>
              </span>
              <span className="text-slate-500 transition-transform group-open:rotate-180">
                <ChevronDown size={15} aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <Link
                href="/planos"
                onClick={closeMenu}
                className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ShoppingBag size={15} aria-hidden="true" /> Gerenciar meu plano
              </Link>
              <Link
                href="/dashboard/faturamento"
                onClick={closeMenu}
                className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <WalletCards size={15} aria-hidden="true" /> Ver faturamento
              </Link>
              <form action={logout}>
                <button className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700">
                  <LogOut size={15} aria-hidden="true" /> Sair da conta
                </button>
              </form>
            </div>
          </details>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex min-h-[68px] flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-slate-200/80 bg-[#f8fafc]/95 px-4 py-2 backdrop-blur-md sm:px-7 lg:flex-nowrap lg:px-9">
          <div className="flex min-h-10 w-full items-center gap-3 lg:w-auto">
            <button
              ref={menuButton}
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 lg:hidden"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">
                Workspace
              </p>
              <p className="mt-0.5 text-sm font-extrabold tracking-[-.02em] text-slate-950">
                FlowPromos
              </p>
            </div>
          </div>

          <nav
            aria-label="Status e ações da conta"
            className="flex min-h-10 w-full flex-wrap items-center justify-between gap-2 lg:w-auto lg:justify-end"
          >
            <button
              type="button"
              aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
              aria-pressed={theme === "dark"}
              title={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
              onClick={toggleTheme}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              {theme === "light" ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={whatsapp.openConnection}
              aria-label={`WhatsApp ${whatsappLabel(whatsapp.state)}; abrir conexão`}
              title="Ver integração do WhatsApp"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <span
                className={`h-2 w-2 rounded-full ${whatsappConnected ? "bg-emerald-500" : whatsapp.state === "disconnected" ? "bg-rose-500" : "bg-amber-500"}`}
                aria-hidden="true"
              />
              <span>{whatsappLabel(whatsapp.state)}</span>
            </button>
            <Link
              href="/planos"
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <span
                className="h-2 w-2 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              <span>{daysRemaining(profile.expiresAt, profile.planStatus)}</span>
            </Link>
            <form action={logout} className="shrink-0">
              <button aria-label="Sair da conta" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 text-[11px] font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:px-3">
                <LogOut size={15} aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </nav>
        </header>

        <div id="workspace-content" className="min-w-0">
          {children}
        </div>
      </div>

      <dialog ref={connectionDialog} aria-label="Conexão do WhatsApp" onCancel={closeConnection} className="whatsapp-dialog rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">Conexão do WhatsApp</h2>
          <button type="button" onClick={closeConnection} aria-label="Fechar conexão" className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={20} aria-hidden="true" /></button>
        </div>
        {connectionOpen && <WhatsappConnection />}
      </dialog>
    </div>
  );
}
