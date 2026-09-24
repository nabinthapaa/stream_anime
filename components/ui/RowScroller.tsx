"use client";

import { useCallback, useRef, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "./cn";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { ROW_TRACK } from "./layout";

/** Scroll state encoded as a primitive so useSyncExternalStore can compare it. */
function readState(el: HTMLElement | null) {
  if (!el) return "0,1,0,1";
  const style = getComputedStyle(el);
  const track = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const max = el.scrollWidth - el.clientWidth;
  const canPrev = el.scrollLeft > 4 ? 1 : 0;
  const canNext = el.scrollLeft < max - 4 ? 1 : 0;
  const pages = track > 0 ? Math.max(1, Math.ceil((el.scrollWidth - (el.clientWidth - track) - 4) / track)) : 1;
  const page = !canNext ? pages - 1 : Math.min(pages - 1, Math.round(el.scrollLeft / Math.max(track, 1)));
  return `${canPrev},${canNext},${page},${pages}`;
}

/**
 * Horizontal scroll-snap track. Desktop gets gutter-wide chevron handles and a
 * page indicator (both on row hover); touch swipe, trackpads and keyboard focus
 * (tabbing through cards scrolls them into view) work natively.
 */
export function RowScroller({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);

  const subscribe = useCallback((notify: () => void) => {
    const el = ref.current;
    if (!el) return () => {};
    el.addEventListener("scroll", notify, { passive: true });
    const observer = new ResizeObserver(notify);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", notify);
      observer.disconnect();
    };
  }, []);

  const state = useSyncExternalStore(
    subscribe,
    () => readState(ref.current),
    () => "0,1,0,1",
  );
  const [canPrev, canNext, page, pages] = state.split(",").map(Number);

  const scroll = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const track = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * track, behavior: reduce ? "auto" : "smooth" });
  };

  const handle =
    "absolute inset-y-1 z-20 hidden w-page min-w-8 items-center justify-center bg-canvas/50 text-white md:flex " +
    "opacity-0 transition-[opacity,background-color] duration-200 group-hover/row:opacity-100 focus-visible:opacity-100 hover:bg-canvas/70 " +
    "[&>svg]:transition-transform [&>svg]:duration-200 hover:[&>svg]:scale-125";

  return (
    <div className="relative">
      {pages > 1 && (
        <div
          aria-hidden="true"
          className="absolute right-page bottom-full mb-[1.8125rem] hidden gap-0.5 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 md:flex"
        >
          {Array.from({ length: pages }).map((_, i) => (
            <span key={i} className={cn("h-0.5 w-3", i === page ? "bg-accent" : "bg-white/30")} />
          ))}
        </div>
      )}
      <ul
        ref={ref}
        role="list"
        aria-label={label}
        className={cn(ROW_TRACK, "scrollbar-none snap-x snap-mandatory scroll-px-page overflow-x-auto overscroll-x-contain")}
      >
        {children}
      </ul>
      {canPrev ? (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${label} left`}
          className={cn(handle, "left-0 rounded-r-md")}
        >
          <ChevronLeftIcon className="size-8" />
        </button>
      ) : null}
      {canNext ? (
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label={`Scroll ${label} right`}
          className={cn(handle, "right-0 rounded-l-md")}
        >
          <ChevronRightIcon className="size-8" />
        </button>
      ) : null}
    </div>
  );
}
