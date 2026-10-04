"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ComponentProps } from "react";

/** Show feedback while a dynamic route is loading, including query-only changes. */
export default function NavigationLink({ children, onClick, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return <Link {...props} aria-busy={pending} onClick={(event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || (props.target && props.target !== "_self") || event.currentTarget.hasAttribute("download")) return;
    const destination = new URL(event.currentTarget.href);
    if (destination.origin !== window.location.origin || destination.hash) return;
    event.preventDefault();
    startTransition(() => {
      const href = `${destination.pathname}${destination.search}`;
      if (props.replace) router.replace(href, { scroll: props.scroll });
      else router.push(href, { scroll: props.scroll });
    });
  }}>
    {children}
    {pending && <span role="status" className="ml-auto inline-flex shrink-0 items-center">
      <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
      <span className="sr-only">Carregando página…</span>
    </span>}
  </Link>;
}
