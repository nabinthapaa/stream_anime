import Link from "next/link";
import { cn } from "./cn";

export interface FilterTab {
  label: string;
  href: string;
  active: boolean;
  /** Accessible name when the visible label is terse (e.g. "#") */
  ariaLabel?: string;
}

/** Pill-style filter links. Scrolls horizontally on small screens, wraps on desktop when `wrap` is set. */
export function FilterTabs({ tabs, label, wrap = false }: { tabs: FilterTab[]; label: string; wrap?: boolean }) {
  return (
    <nav aria-label={label} className="-mx-page">
      <ul
        role="list"
        className={cn(
          "scrollbar-none flex gap-2 overflow-x-auto px-page py-1",
          wrap && "md:flex-wrap md:overflow-visible",
        )}
      >
        {tabs.map((tab) => (
          <li key={tab.href} className="shrink-0">
            <Link
              href={tab.href}
              scroll={false}
              aria-current={tab.active ? "page" : undefined}
              aria-label={tab.ariaLabel}
              className={cn(
                "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors duration-200 sm:h-9",
                tab.active
                  ? "bg-accent-strong text-white"
                  : "bg-surface-overlay text-neutral-300 hover:bg-surface-hover hover:text-white",
              )}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
