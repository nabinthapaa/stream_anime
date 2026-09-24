"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "../ui/cn";
import { PlayIcon } from "../ui/icons";

export interface EpisodeRow {
  number: number;
  href: string;
}

const RANGE_SIZE = 50;

/**
 * Netflix-style episode rows: number, 16:9 thumbnail, "Episode N" + runtime.
 * Ranges and sort order are local state (not URL params), so nothing here
 * triggers a navigation, which matters inside the intercepted modal.
 */
export function EpisodeList({
  episodes,
  thumbnail,
  seriesName,
  duration,
  latest,
  note,
}: {
  episodes: EpisodeRow[];
  thumbnail?: string;
  seriesName: string;
  duration?: number;
  latest?: number;
  note?: string;
}) {
  const [newestFirst, setNewestFirst] = useState(false);
  const [range, setRange] = useState(0);

  const ordered = newestFirst ? [...episodes].reverse() : episodes;
  const ranges: EpisodeRow[][] = [];
  for (let i = 0; i < ordered.length; i += RANGE_SIZE) ranges.push(ordered.slice(i, i + RANGE_SIZE));
  const current = ranges[Math.min(range, ranges.length - 1)] ?? [];

  return (
    <section aria-labelledby="episodes-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="episodes-heading" className="text-xl font-medium text-white sm:text-2xl">
          Episodes
        </h3>
        {episodes.length > 1 && (
          <div className="flex items-center gap-2">
            {ranges.length > 1 && (
              <>
                <label htmlFor="episode-range" className="sr-only">
                  Episode range
                </label>
                <select
                  id="episode-range"
                  value={range}
                  onChange={(e) => setRange(Number(e.target.value))}
                  className="h-11 rounded-md bg-surface-overlay px-3 text-sm font-medium text-white ring-1 ring-white/20 outline-hidden focus-visible:ring-accent sm:h-10"
                >
                  {ranges.map((r, i) => (
                    <option key={i} value={i}>
                      Episodes {r[0].number}&ndash;{r[r.length - 1].number}
                    </option>
                  ))}
                </select>
              </>
            )}
            <button
              type="button"
              aria-pressed={newestFirst}
              onClick={() => {
                setNewestFirst(!newestFirst);
                setRange(0);
              }}
              className="h-11 rounded-md px-3 text-sm font-medium text-white/80 ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white sm:h-10"
            >
              {newestFirst ? "Newest first" : "Oldest first"}
            </button>
          </div>
        )}
      </div>
      {note && <p className="mt-2 text-sm text-neutral-400">{note}</p>}

      {current.length ? (
        <ol role="list" className="mt-4 border-t border-line">
          {current.map((ep) => {
            const isLatest = ep.number === latest;
            return (
              <li key={ep.href} className="border-b border-line">
                <Link
                  href={ep.href}
                  className="group/ep flex items-center gap-3 px-1 py-4 transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover sm:gap-5 sm:rounded-md sm:px-4"
                >
                  <span className="w-9 shrink-0 text-center text-lg text-white/60 tabular-nums sm:w-12 sm:text-2xl">
                    {ep.number}
                  </span>
                  <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-sm bg-surface-raised sm:w-[8.125rem]">
                    {thumbnail && (
                      <Image src={thumbnail} alt="" fill sizes="130px" className="object-cover object-[center_25%]" />
                    )}
                    <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover/ep:opacity-100 group-focus-visible/ep:opacity-100">
                      <span className="grid size-9 place-items-center rounded-full ring-2 ring-white">
                        <PlayIcon className="size-4 translate-x-px text-white" />
                      </span>
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-medium text-white">Episode {ep.number}</span>
                      {duration ? <span className="shrink-0 text-sm text-white/70">{duration}m</span> : null}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-sm text-neutral-400">
                      {isLatest && (
                        <span className="rounded-sm bg-accent-strong px-1.5 text-[0.6875rem] leading-4 font-medium text-white uppercase">
                          New
                        </span>
                      )}
                      <span className="line-clamp-2">{seriesName}</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={cn("mt-4 rounded-md bg-surface-raised p-5 text-sm text-neutral-400")}>
          No episodes are available yet. Check back soon.
        </p>
      )}
    </section>
  );
}
