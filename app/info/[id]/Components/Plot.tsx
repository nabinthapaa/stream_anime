"use client";
import { useEffect, useId, useRef, useState } from "react";

/** Synopsis clamped to four lines with an accessible "More / Less" toggle. */
export function Plot({ data }: { data: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const el = useRef<HTMLDivElement | null>(null);
  const id = useId();

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    // Measure once the clamp is applied; re-measure on resize.
    const observer = new ResizeObserver(() => {
      if (!expanded) setOverflowing(node.scrollHeight > node.clientHeight + 1);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <div className="max-w-2xl">
      <div
        ref={el}
        id={id}
        className={`text-sm leading-relaxed text-neutral-200 md:text-base [&_a]:underline [&_i]:italic ${expanded ? "" : "line-clamp-4"}`}
        dangerouslySetInnerHTML={{ __html: data }}
      />
      {(overflowing || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          className="-mx-2 mt-1 min-h-11 rounded-sm px-2 text-sm font-semibold text-white hover:text-accent-text sm:min-h-9"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
