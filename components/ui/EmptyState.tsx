import type { ReactNode } from "react";
import { AlertIcon, TvOffIcon } from "./icons";

/** Friendly on-brand message for empty results or recoverable errors, with a clear next step. */
export function EmptyState({
  title,
  message,
  tone = "empty",
  children,
  headingLevel = 2,
}: {
  title: string;
  message?: ReactNode;
  tone?: "empty" | "error";
  /** Recovery actions (buttons/links) */
  children?: ReactNode;
  headingLevel?: 1 | 2;
}) {
  const Icon = tone === "error" ? AlertIcon : TvOffIcon;
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className="mx-auto flex max-w-md animate-fade-up flex-col items-center px-4 py-16 text-center md:py-24"
    >
      <span
        className={
          "grid size-16 place-items-center rounded-full ring-1 " +
          (tone === "error" ? "bg-danger/10 text-danger ring-danger/25" : "bg-surface-overlay text-neutral-400 ring-white/5")
        }
      >
        <Icon className="size-7" />
      </span>
      <Heading className="mt-6 text-xl font-bold tracking-tight text-white md:text-2xl">{title}</Heading>
      {message && <p className="mt-2 text-sm text-neutral-400 md:text-base">{message}</p>}
      {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
