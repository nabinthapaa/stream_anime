import { HERO_FRAME } from "@/components/ui/layout";

/** Same inset frame as the billboard so the rows below never jump. */
export default function HeroSkeleton() {
  return (
    <div role="status" aria-label="Loading featured title" className={HERO_FRAME + " bg-surface"}>
      <div className="w-full max-w-3xl space-y-4 p-5 pb-6 sm:p-8 lg:p-[3.125rem]">
        <div className="skeleton h-3 w-28 rounded-sm" />
        <div className="skeleton h-[clamp(2.25rem,5vw,5rem)] w-3/4 rounded-lg" />
        <div className="skeleton h-5 w-80 max-w-full rounded-sm" />
        <div className="max-w-[35rem] space-y-2 pt-1">
          <div className="skeleton h-4 w-full rounded-sm md:h-5" />
          <div className="skeleton h-4 w-11/12 rounded-sm md:h-5" />
          <div className="skeleton h-4 w-2/3 rounded-sm md:h-5" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="skeleton h-12 w-28 rounded-full" />
          <div className="skeleton h-12 w-40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
