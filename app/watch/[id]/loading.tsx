import { TheaterMode } from "@/components/player/TheaterMode";

/** Same theater frame as the player, so nothing jumps when it arrives. */
export default function Loading() {
  return (
    <>
      <TheaterMode />
      <div
        role="status"
        aria-label="Loading episode"
        className="relative z-[55] grid h-dvh w-full place-items-center bg-black"
      >
        <span className="size-16 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
      </div>
    </>
  );
}
