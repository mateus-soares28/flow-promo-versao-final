"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  children: ReactNode;
};

export default function SubmitButton({
  children,
  pendingText = "Salvando…",
  disabled,
  className = "",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={`relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[background-color,border-color,color,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {pending ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : null}
      <span>{pending ? pendingText : children}</span>
    </button>
  );
}
