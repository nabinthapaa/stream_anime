"use client";

import { CloseIcon } from "../ui/icons";
import { infoHref } from "../ui/format";
import { PosterCard } from "../ui/PosterCard";
import { RowSection, RowTrack } from "../ui/Row";
import { ROW_SIZES } from "../ui/layout";
import { useContinueWatching, useMounted, useMyList } from "./hooks";
import { removeContinueWatching } from "./library";

/**
 * Continue Watching: newest first, straight to the episode being watched, with a progress
 * bar along the bottom of the art and a remove control. Renders nothing (and reserves no
 * space) when empty or before mount, since the data only exists in the browser.
 */
export function ContinueWatchingRow() {
  const mounted = useMounted();
  const entries = useContinueWatching();
  if (!mounted || !entries.length) return null;

  return (
    <RowSection id="row-continue" title="Continue Watching">
      <RowTrack label="Continue Watching">
        {entries.map((entry) => (
          <div key={entry.id} className="group/cw relative">
            <PosterCard
              variant="row"
              href={`/watch/${entry.epId}`}
              title={entry.title}
              image={entry.image}
              edgeBadge={entry.epNumber ? `E${entry.epNumber}` : undefined}
              meta={entry.epNumber ? `Episode ${entry.epNumber}` : undefined}
              progress={entry.d > 0 ? entry.t / entry.d : 0}
              sizes={ROW_SIZES}
            />
            <button
              type="button"
              onClick={() => removeContinueWatching(entry.id)}
              aria-label={`Remove ${entry.title} from Continue Watching`}
              className="absolute top-1.5 right-1.5 z-10 grid size-9 place-items-center rounded-full bg-black/70 text-white opacity-0 ring-1 ring-white/25 transition-opacity duration-150 group-hover/cw:opacity-100 focus-visible:opacity-100 max-sm:opacity-100"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>
        ))}
      </RowTrack>
    </RowSection>
  );
}

/** My List: newest first; cards behave like every other card (they open the details modal). */
export function MyListRow() {
  const mounted = useMounted();
  const entries = useMyList();
  if (!mounted || !entries.length) return null;

  return (
    <RowSection id="row-my-list" title="My List">
      <RowTrack label="My List">
        {entries.map((entry) => (
          <PosterCard
            key={entry.id}
            variant="row"
            href={infoHref(entry.id)}
            title={entry.title}
            image={entry.image}
            sizes={ROW_SIZES}
          />
        ))}
      </RowTrack>
    </RowSection>
  );
}
