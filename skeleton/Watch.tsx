/** Mirrors the block under the player: series link, title, episode picker. */
export function WatchDetailsSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-[80rem] px-page pt-8 pb-16 lg:px-0">
      <div className="space-y-3">
        <div className="skeleton h-4 w-28 rounded-sm" />
        <div className="skeleton h-8 w-72 max-w-full rounded-md" />
        <div className="skeleton h-4 w-32 rounded-sm" />
      </div>
      <div className="mt-10">
        <div className="skeleton h-6 w-28 rounded-md" />
        <div className="mt-4 grid grid-cols-4 gap-2 py-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
