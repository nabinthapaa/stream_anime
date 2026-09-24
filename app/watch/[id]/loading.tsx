import { WatchDetailsSkeleton } from "@/skeleton/Watch";

/** Same theater frame as the player, so nothing jumps when it arrives. */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading episode">
      <div className="relative z-[55] grid aspect-video w-full place-items-center bg-black md:aspect-auto md:h-svh landscape:aspect-auto landscape:h-svh">
        <span className="size-16 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
      </div>
      <WatchDetailsSkeleton />
    </div>
  );
}
