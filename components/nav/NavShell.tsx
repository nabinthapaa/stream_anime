"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "../ui/cn";

function subscribe(notify: () => void) {
  window.addEventListener("scroll", notify, { passive: true });
  return () => window.removeEventListener("scroll", notify);
}

/** Fixed header: gradient over imagery at the top, solid once the page scrolls. */
export function NavShell({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  );
  return (
    <header data-site-chrome="" className="fixed inset-x-0 top-0 z-50">
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-black/80 to-transparent" />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-canvas transition-opacity duration-300 ease-out",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="relative flex h-nav items-center gap-4 px-page lg:gap-6">{children}</div>
    </header>
  );
}
