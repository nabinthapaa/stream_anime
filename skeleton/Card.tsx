import { GRID, ROW_ITEM, ROW_TRACK } from "@/components/ui/layout";

/** Mirrors PosterCard: a 16:9 tile with the title lines on the scrim. */
export default function CardSkeleton() {
  return (
    <div aria-hidden="true" className="skeleton relative aspect-video overflow-hidden rounded-xl">
      <div className="absolute inset-x-3 bottom-3 space-y-1.5">
        <div className="h-3 w-3/4 rounded-sm bg-white/10" />
        <div className="h-2.5 w-1/3 rounded-sm bg-white/10" />
      </div>
    </div>
  );
}

/** Placeholder for a full poster grid page. */
export function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading titles">
      <ul role="list" className={GRID}>
        {Array.from({ length: count }).map((_, i) => (
          <li key={i}>
            <CardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Placeholder for a row's cards: same track, widths and 2:3 posters as RowScroller + PosterCard (row variant). */
export function RowCardsSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading titles" className={`${ROW_TRACK} overflow-hidden`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={ROW_ITEM}>
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}
