"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Menu } from "lucide-react";
import styles from "@/app/home.module.css";

export default function MobileNavigation({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menu.current?.contains(event.target) &&
        menu.current
      ) {
        menu.current.open = false;
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function closeMenu(href: string) {
    if (menu.current) menu.current.open = false;
    if (href.startsWith("#"))
      document.getElementById(href.slice(1))?.focus({ preventScroll: true });
  }

  return (
    <details ref={menu} className={styles.mobileMenu}>
      <summary aria-label="Menu de navegação">
        <Menu size={22} aria-hidden="true" />
      </summary>
      <nav aria-label="Navegação mobile">
        {items.map((item) => (
          <a
            href={item.href}
            key={item.href}
            onClick={() => closeMenu(item.href)}
          >
            {item.label}
          </a>
        ))}
        <Link href="/planos" onClick={() => closeMenu("/planos")}>
          Começar agora <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </nav>
    </details>
  );
}
