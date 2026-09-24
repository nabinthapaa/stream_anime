"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../ui/cn";
import { ClockIcon, FilmIcon, FlameIcon, HomeIcon } from "../ui/icons";

const LINKS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/recent", label: "Recent", Icon: ClockIcon },
  { href: "/popular", label: "Popular", Icon: FlameIcon },
  { href: "/movies", label: "Movies", Icon: FilmIcon },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

/** Inline links in the top bar (tablet and up). */
export function NavLinks() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul role="list" className="flex items-center gap-1">
        {LINKS.map(({ href, label }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-3xl px-4 py-2.5 text-base leading-5 font-normal transition-colors duration-200",
                  active
                    ? "bg-accent/30 text-white ring-1 ring-inset ring-accent/50"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Thumb-friendly bottom tab bar (phones). */
export function MobileTabBar() {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul role="list" className="grid h-16 grid-cols-4">
        {LINKS.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-sm text-[0.6875rem] font-medium transition-colors duration-200",
                  active ? "text-white" : "text-neutral-400 hover:text-neutral-200",
                )}
              >
                <Icon className={cn("size-6", active && "text-accent")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
