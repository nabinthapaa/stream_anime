import Link from "next/link";
import { cn } from "./cn";

export interface EpisodeLink {
  number: number;
  href: string;
}

/**
 * Compact episode picker. `current` gets the accent fill (the one playing),
 * `latest` gets a small "New" marker so airing shows surface their newest episode.
 */
export function EpisodeGrid({
  episodes,
  current,
  latest,
  label = "Episodes",
  dense = false,
}: {
  episodes: EpisodeLink[];
  current?: number;
  latest?: number;
  label?: string;
  dense?: boolean;
}) {
  return (
    <ol
      role="list"
      aria-label={label}
      className={cn(
        "grid gap-2",
        dense
          ? "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12"
          : "grid-cols-3 min-[420px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8",
      )}
    >
      {episodes.map((ep) => {
        const isCurrent = ep.number === current;
        const isLatest = ep.number === latest && !isCurrent;
        return (
          <li key={ep.href}>
            <Link
              href={ep.href}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`Episode ${ep.number}${isCurrent ? ", now playing" : isLatest ? ", latest" : ""}`}
              className={cn(
                "relative flex h-14 flex-col items-center justify-center rounded-md ring-1 ring-inset transition-colors duration-200",
                isCurrent
                  ? "bg-accent-strong text-white ring-accent"
                  : "bg-surface-raised text-neutral-100 ring-white/5 hover:bg-surface-hover hover:ring-accent/60",
              )}
            >
              <span
                className={cn(
                  "text-[0.625rem] leading-none font-semibold tracking-widest uppercase",
                  isCurrent ? "text-white/80" : "text-neutral-400",
                )}
              >
                {isCurrent ? "Playing" : "Ep"}
              </span>
              <span className="mt-1 text-base leading-none font-bold tabular-nums">{ep.number}</span>
              {isLatest && (
                <span className="absolute -top-1.5 right-1 rounded-sm bg-accent-strong px-1 text-[0.5625rem] leading-3.5 font-bold tracking-wide text-white uppercase">
                  New
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
